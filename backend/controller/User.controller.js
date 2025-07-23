const User = require("../model/User.model");
const Message = require("../model/Message.model.js");
const Room = require("../model/Room.model.js");
const uploadCloud = require("../utils/cloudnary.js");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { redisClient } = require("../redisClient.js");
const { sendMessageToSocketId } = require("../socket.js");

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateToken();
    const refreshToken = user.generaterefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Somthing went wrong on creating token");
  }
};

exports.login = async (req, res) => {
  const { username, password, email } = req.body;
  // console.log(email, username, password);

  try {
    if (!password || (!username && !email)) {
      throw new Error(400, "Username and Password are required");
    }
    let user;
    if (!email) {
      user = await User.findOne({ username: username }).select("+password");
    } else {
      user = await User.findOne({ email: email }).select("+password");
    }

    if (!user) {
      throw new Error(404, "User not found");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error(400, "Invalid Password");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ loggedInUser });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "Unauthorized");
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.refreshToken = "";
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({ message: "Logout successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken -accessToken"
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.createUser = async (req, res) => {
  const { username, email, password, fullname } = req.body;

  try {
    const avatarLocalpath = req.files?.avatar[0]?.path;
    if (!avatarLocalpath) {
      throw new ApiError(408, "Avatar is Require");
    }
    const avatarCloud = await uploadCloud(avatarLocalpath);
    if (!avatarCloud) {
      throw new ApiError(408, "Error uploading avatar to Cloudinary");
    }
    const user = await User.create({
      username,
      email,
      password,
      fullname,
      avatar: avatarCloud.url,
    });
    return res.status(201).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.addUser = async (req, res) => {
  const { userId } = req.body;

  // // check Already send
  // const alreadySent = await Message.exists({
  //   type: "notification",
  //   $or: [
  //     {
  //       sender: req?.user?._id,
  //       receiver: userId,
  //     },
  //     {
  //       receiver: req?.user?._id,
  //       sender: userId,
  //     },
  //   ],
  // });

  // const result = !!alreadySent;

  // if (!result) {
  //   throw new Error("already sent pending request");
  // }

  try {
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }
    const notification = await Message.create({
      message: `${req?.user?.username} send you a friend request.`,
      sender: req?.user?._id,
      receiver: new mongoose.Types.ObjectId(userId),
      type: "notification",
      status: "unseen",
    });
    if (!notification) {
      throw new ApiError(500, "Failed to create notification");
    }

    const reciver = await redisClient.hGet(userId, "Id");
    console.log("Receiver socket ID:", reciver);
    if (reciver) {
      const data = await User.aggregate([
        {
          $match: { _id: req?.user?._id },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            avatar: 1,
          },
        },
      ]);
      const send = {
        ...notification._doc,
        senderInfo: data,
      };
      console.log("Sending friend request notification to receiver:", reciver);

      sendMessageToSocketId(reciver, {
        event: "friendRequest",
        data: send,
      });
    }
    return res.status(200).json({ notification });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};
exports.acceptUser = async (req, res) => {
  const { messageId } = req.body;

  try {
    const message = await Message.findByIdAndUpdate(
      { _id: messageId },
      {
        status: "seen",
      },
      {
        new: true,
      }
    );

    const senderId = message.sender;
    const receiverId = message.receiver;

    const sortedIds = [senderId.toString(), receiverId.toString()].sort();

    const existingRoom = await Room.findOne({
      type: "chat",
      people: { $all: sortedIds, $size: 2 },
    });

    if (existingRoom) {
      throw new Error("Already room existes");
    }

    const Rooms = await Room.create({
      type: "chat",
      people: [senderId, receiverId],
    });

    const sender = await User.findById(senderId);
    // Check if friend already exists
    const alreadyConnected = sender.connections.some(
      (conn) => conn.friend.toString() === receiverId
    );
    if (!alreadyConnected) {
      sender.connections.push({
        friend: receiverId,
        muted: false,
        Room: Rooms._id,
      });
      await sender.save();
    } else {
      throw new Error("already friend");
    }

    const receiver = await User.findById(receiverId);
    // Check if friend already exists
    const alreadyConnected2 = receiver.connections.some(
      (conn) => conn.friend.toString() === senderId
    );
    if (!alreadyConnected2) {
      receiver.connections.push({
        friend: senderId,
        muted: false,
        Room: Rooms._id,
      });
      await receiver.save();
    } else {
      throw new Error("already friend");
    }

    const newmessage = await Message.create({
      message: `${req?.user?.username} Accepts your follow request`,
      sender: receiverId,
      receiver: senderId,
      type: "notification",
      status: "seen",
    });
    if (!newmessage) {
      throw new Error("Failed to create notification message");
    }
    const reciver = await redisClient.hGet(senderId.toString(), "Id");
    if (reciver) {
      const send = {
        ...newmessage._doc,
        senderInfo: [receiver],
      };
      sendMessageToSocketId(reciver, {
        event: "AcceptRequest",
        data: send,
      });
    }
    return res.status(200).json({ message: "User accepted", newmessage });
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      message: error.message,
    });
  }
};

exports.userDetails = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $addFields: {
          Following: {
            $size: "$connections",
          },
        },
      },
      {
        $project: {
          Following: 1,
          username: 1,
          avatar: 1,
          email: 1,
          fullname: 1,
          description: 1,
          gallery: 1,
          banner: 1,
        },
      },
    ]);
    if (!user) {
      throw new Error("no user Found");
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.getConnections = async (req, res) => {
  try {
    const list = await User.aggregate([
      {
        $match: { _id: req.user?._id },
      },
      {
        $unwind: {
          path: "$connections",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "connections.friend",
          foreignField: "_id",
          as: "conn",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullname: 1,
                avatar: 1,
                lastSeen: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$conn",
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "connections.Room",
          foreignField: "conversation",
          as: "messages",
          pipeline: [
            {
              $sort: {
                createdAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          friendId: "$connections.friend",
          room: "$connections.Room",
          muted: "$connections.muted",
          conn: 1,
          messages: 1,
        },
      },
    ]);

    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.messages = async (req, res) => {
  const { roomId } = req.body;
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          conversation: roomId,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);
    return res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
exports.fetchNotification = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          type: "notification",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderInfo",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
    ]);
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
exports.searchUsers = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.aggregate([
      {
        $match: {
          $or: [
            {
              username: {
                $regex: username,
                $options: "i",
              },
            },
            {
              fullname: {
                $regex: username,
                $options: "i",
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          fullname: 1,
          avatar: 1,

        },
      },
    ]);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
exports.isFollowing = async (req, res) => {
  const { id } = req.body;
  try {
    const isFollowing = await User.findOne({
      _id: req.user._id,
      "connections.friend": id,
    });
    return res.status(200).json({ isFollowing: !!isFollowing });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
exports.unfollow = async (req, res) => {
  const { id } = req.body;

  try {
    // Fetch both users
    const user = await User.findById(req?.user?._id);
    const another = await User.findById(id);

    if (!user || !another) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Unfollowing user:", user.username, "and", another.username);

    // Filter out the friend from the connections array
    user.connections = user.connections.filter(
      (conn) => conn.friend.toString() !== id
    );

    another.connections = another.connections.filter(
      (conn) => conn.friend.toString() !== req.user._id.toString()
    );

    await user.save();
    await another.save();

    // delete Room
    try {
      const result = await Room.findOneAndDelete({
        type: "chat",
        people: { $all: [req?.user?._id, another?._id], $size: 2 },
      });
      if (!result) {
        throw new Error("No conversation found between the users");
      }
      try {
        const messageObjects = await Message.deleteMany({
          conversation: result._id,
        });
      } catch (error) {
        console.log("Error deleting messages:", error.message);
      }
    } catch (error) {
      console.log("Error deleting conversation:", error.message);
    }

    return res.status(200).json({ message: "User Unfollowed" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

exports.rejectrequest = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Message.findByIdAndDelete(id);
    return res.status(200).json({ message: "Request Rejected" });
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({
      message: error.message,
    });
  }
};
exports.seenAllMessages = async (req, res) => {
  try {
    const { id } = req.body;
    const message = await Message.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        status: true,
      }
    );
    return res.status(200).json({
      message: "Message Seen",
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

exports.sendMessages = async (req, res) => {
  const { RoomId } = req.body;
  try {
    const messages = await Room.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(RoomId),
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "message",
          foreignField: "_id",
          as: "messages",
        },
      },
      {
        $unwind: {
          path: "$messages",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          messages: 1,
        },
      },
    ]);
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
exports.createVideoRoom = async (req, res) => {
  try {
    const newRoom = await Room.create({
      type: "video",
      $push: {
        people: req.user._id,
      },
    });
    await newRoom.save();
    return res.status(200).json(newRoom);
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

exports.registerUser = async (req, res) => {
  const { fullname, username, email, password } = req.body;
  console.log("Registering user:");

  // Check if all fields are provided
  if (!fullname || !username || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if user with the same email or username already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    return res.json({
      success: false,
      message: "Email is already registered",
      field: "email",
    });
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    return res.json({
      success: false,
      message: "Username is already taken",
      field: "username",
    });
  }

  // Create new user
  const user = new User({
    fullname,
    username,
    email,
    password,
  });

  // Save the user to the database
  await user.save();

  // Generate tokens
  const accessToken = user.generateToken();
  const refreshToken = user.generaterefreshToken();

  // Save tokens to user document
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();
  console.log("user registered");

  res.status(201).json({
    success: true,
    message: "Registration successful",
    user: {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  });
};

exports.sendFile = async (req, res) => {
  try {
    const messageObject = JSON.parse(req.body.data);

    if (!messageObject) {
      throw new ApiError(405, "Field Require");
    }
    const filePath = req.files?.file[0]?.path;
    if (!filePath) {
      throw new ApiError(408, "File is Require");
    }

    const FileCloud = await uploadCloud(filePath);
    if (!FileCloud) {
      throw new ApiError(408, "Error uploading file to Cloudinary");
    }
    const url = FileCloud.url;
    if (!url) {
      throw new ApiError("Unable to upload online");
    }
    const metadata = {
      caption: messageObject?.message || "", // optional caption from frontend
      fileName: FileCloud.original_filename + "." + FileCloud.format,
      size: FileCloud.bytes,
      mimeType: FileCloud.resource_type + "/" + FileCloud.format,
    };
    const message = await Message.create({
      message: url,
      sender: req.user._id,
      reciver: messageObject.reciver,
      conversation: messageObject.conversation,
      type: messageObject.type,
      status: "unseen",
      metadata: metadata,
    });

    const room = await Room.findByIdAndUpdate(
      {
        _id: messageObject?.conversation,
      },
      {
        $push: {
          message: message._id,
        },
      }
    );
    let obj = await { ...message._doc };

    const newmessageObject = {
      event: "receive-message",
      data: obj,
    };
    const sender = await redisClient.hGet(
      messageObject.sender.toString(),
      "Id"
    );
    if (sender) {
      sendMessageToSocketId(sender, newmessageObject);
    }
    const reciver = await redisClient.hGet(
      messageObject.receiver.toString(),
      "Id"
    );
    if (reciver) {
      sendMessageToSocketId(reciver, newmessageObject);
    }
    return res.status(200).json({
      message: "send File SuccessFull",
    });
  } catch (error) {
    console.log(error.message);

    return res.status(404).json({
      message: "Unable to send File",
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { fullname, description = "" } = req.body;
  console.log("fullname", fullname);

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Update user fields
    user.fullname = fullname || user.fullname;
    user.description = description || user.description;

    // Save the updated user
    await user.save();
    console.log(user);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({ message: error.message });
  }
};

exports.updateFile = async (req, res) => {
  try {
    const { type } = req.body;
    const file = req.files?.file[0]?.path;
    if (!file) {
      throw new Error(408, "File is Require");
    }

    const fileCloud = await uploadCloud(file);
    if (!fileCloud) {
      throw new Error(408, "Error uploading file to Cloudinary");
    }
    const user = await User.findById(req?.user?._id);

    if (!user) {
      throw new Error("no user");
    }

    if (type === "avatar") {
      user.avatar = fileCloud?.url;
    } else {
      user.banner = fileCloud?.url;
    }

    await user.save();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      throw new Error(400, "Current and new passwords are required");
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      throw new Error(404, "User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error(400, "Invalid current password");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
}
exports.postImage = async (req, res) => {
  try {
    const post = req.files?.post[0]?.path;
    if (!post) {
      throw new Error(408, "Post image is required");
    }

    const postCloud = await uploadCloud(post);
    if (!postCloud) {
      throw new Error(408, "Error uploading post image to Cloudinary");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new Error("User not found");
    }

    await user.gallery.push(postCloud.url);
    await user.save();

    return res.status(200).json({ imageUrl: postCloud.url });
  } catch (error) {
    console.error("Error posting image:", error.message);
    return res.status(500).json({ message: error.message });
  }
}