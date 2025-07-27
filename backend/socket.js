const socketIo = require("socket.io");
const User = require("./model/User.model.js");
const Message = require("./model/Message.model.js");
const Room = require("./model/Room.model.js");
const { redisClient } = require("./redisClient.js");
let io;

let rooms = {};

function initilizeSocket(server) {
  const corsOptions = {
    origin: function (origin, cb) {
      if (!origin || process.env.ALLOWED_ORIGINS.split(",").includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
     methods: ["GET", "POST"],
  };
  io = socketIo(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    console.log("Client Connected: ", socket.id);

    async function mapUserSocket(userId, socketId) {
      await redisClient.hSet(userId, "Id", socketId);
      await redisClient.expire(userId, 3600);
      await redisClient.set(socketId, userId, { EX: 3600 });
    }
    socket.on("join", async (data) => {
      try {
        const { id } = data;
        await mapUserSocket(id, socket.id);
        const user = await User.findById(id);
        if (!user) {
          console.error("User not found:", id);
          return;
        }
        const connections = user.connections || [];
        for (const conn of connections) {
          try {
            const friendId = conn.friend;
            const friendSocketId = await redisClient.hGet(
              friendId.toString(),
              "Id"
            );
            if (friendSocketId) {
              io.to(friendSocketId).emit("userconnected", { id });
            }
          } catch (error) {
            console.error("Error emitting userconnected event:", error);
          }
        }
      } catch (error) {
        console.log("Error in join event:", error);
      }
    });

    socket.on("checkOnlineBulk", async (friendIds) => {
      try {
        // console.log("Checking online status for bulk friend IDs:", friendI/ds);

        if (friendIds.length === 0 || !Array.isArray(friendIds)) {
          console.log("No friend IDs provided for bulk online status check.");
          return;
        }
        const statusMap = {};
        for (const id of friendIds) {
          if (!id) {
            // console.log("Invalid ID in friendIds array:", id);
            continue;
          }
          statusMap[id] = await redisClient.hExists(id, "Id");
        }
        socket.emit("bulkOnlineStatus", statusMap);
      } catch (error) {
        console.log("Error in checkOnlineBulk:", error);
      }
    });

    socket.on("typing", async (data) => {
      if (io) {
        if (await redisClient.hExists(data?.sender, "Id")) {
          const senderSocketId = await redisClient.hGet(data?.sender, "Id");
          io.to(senderSocketId).emit("usertyping", { roomE: data?.RoomId });
        }
      } else {
        console.log("Socket.io not initialized.");
      }
    });

    socket.on("send-message", async (messageObject) => {
      let messageObjects;
      if (messageObject?.metadata) {
        messageObjects = await Message.create({
          message: messageObject?.message,
          type: messageObject?.type,
          sender: messageObject?.sender,
          receiver: messageObject?.receiver,
          conversation: messageObject?.conversation,
          status: "unseen",
          metadata: messageObject?.metadata,
        });
      } else {
        messageObjects = await Message.create({
          message: messageObject?.message,
          type: messageObject?.type,
          sender: messageObject?.sender,
          receiver: messageObject?.receiver,
          conversation: messageObject?.conversation,
          status: "unseen",
        });
      }

      await messageObjects.save();

      const room = await Room.findByIdAndUpdate(
        {
          _id: messageObjects?.conversation,
        },
        {
          $push: {
            message: messageObjects._id,
          },
        }
      );

      if (io) {
        if (await redisClient.hExists(messageObject?.sender, "Id")) {
          const senderSocketId = await redisClient.hGet(
            messageObject.sender,
            "Id"
          );
          io.to(senderSocketId).emit("receive-message", messageObjects);
        }

        if (await redisClient.hExists(messageObject?.receiver, "Id")) {
          const receiverSocketId = await redisClient.hGet(
            messageObject?.receiver,
            "Id"
          );
          io.to(receiverSocketId).emit("receive-message", messageObjects);
        }
      } else {
        console.log("Socket.io not initialized.");
      }
    });

    socket.on("onceseen", (messageObject) => {
      const updateSeenMessages = async () => {
        try {
          await Message.findByIdAndUpdate(
            { _id: messageObject?._id },
            { status: "seen" }
          );
          if (await redisClient.hExists(messageObject?.sender, "Id")) {
            const reciver = await redisClient.hGet(messageObject?.sender, "Id");
            io.to(reciver).emit("madeSeen");
          } else {
            console.log("Sender socket ID not found in Redis.");
          }
        } catch (error) {
          console.error("Error updating once seen messages:", error);
        }
      };
      updateSeenMessages();
    });

    socket.on("unseen", async (data) => {
      try {
        const { sender, RoomId } = data;
        if (!sender && !RoomId) return;

        const Chatroom = await Room.findById({ _id: RoomId });
        if (!Chatroom) {
          return;
        }
        const messages = Chatroom.message;
        await Message.updateMany(
          { _id: messages, sender: sender },
          {
            status: "seen",
          }
        );
        if (await redisClient.hExists(sender, "Id")) {
          const reciver = await redisClient.hGet(sender, "Id");
          // console.log("Sender socket ID found in Redis:", reciver);
          io.to(reciver).emit("madeSeen");
        } else {
          console.log("Sender socket ID not found in Redis.");
        }
      } catch (error) {
        console.error("Error updating All seen messages:", error);
      }
    });

    // WebRTC Socket's
    socket.on("join-room", (roomId, data) => {
      socket.join(roomId);
      console.log(data);

      const otherUsers = Array.from(
        io.sockets.adapter.rooms.get(roomId) || []
      ).filter((id) => id !== socket.id);
      otherUsers.forEach((userId) => {
        socket.to(userId).emit("user-joined", socket.id, data);
      });
    });
    socket.on("offer", ({ offer, to }) => {
      io.to(to).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", ({ answer, to }) => {
      io.to(to).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // Rooms
    socket.on("createRoom", async ({ sender, reciver, RoomId }) => {
      console.log("Creating room:", RoomId, "between", sender, "and", reciver);
      const messageObject = await Message.create({
        message: "Video Call Started",
        sender: sender,
        reciver: reciver,
        type: "videocall",
        conversation: RoomId,
      });

      const room = await Room.findByIdAndUpdate(
        {
          _id: messageObject?.conversation,
        },
        {
          $push: {
            message: messageObject._id,
          },
        }
      );
      if (io) {
        if (await redisClient.hExists(String(reciver), "Id")) {
          console.log("get reciver");

          const receiverSocketId = await redisClient.hGet(
            String(reciver),
            "Id"
          );
          console.log("sending reciver");

          io.to(receiverSocketId).emit("receive-message", messageObject);
        }

        if (await redisClient.hExists(String(messageObject?.sender), "Id")) {
          const senderSocketId = await redisClient.hGet(
            String(messageObject.sender),
            "Id"
          );
          io.to(senderSocketId).emit("receive-message", messageObject);
        }
      } else {
        console.log("Socket.io not initialized.");
      }
    });

    socket.on("disconnect", () => {
      const disconnectUser = async () => {
        const socketId = socket.id;
        console.log("User disconnected:", socketId);

        try {
          const userId = await redisClient.get(socketId);
          if (!userId) {
            // console.log("User ID not found for socket:", socketId);
            return;
          }

          const user = await User.findByIdAndUpdate(
            userId,
            { lastSeen: Date.now() },
            { new: true }
          );
          if (!user) {
            // console.log("User not found:", userId);
            return;
          }

          await redisClient.hDel(user._id.toString(), "Id");
          // console.log("User disconnected from redis:", user._id);
          await redisClient.del(socketId.toString());
          // console.log("Socket ID deleted from redis:", socketId);

          const connections = user.connections || [];
          for (const conn of connections) {
            try {
              const friendId = conn.friend;
              const friendSocketId = await redisClient.hGet(
                friendId.toString(),
                "Id"
              );
              // console.log("Friend Socket ID:", friendSocketId);
              if (friendSocketId) {
                io.to(friendSocketId).emit("userdisconnected", { id: userId });
                // console.log("Emitted userdisconnected event to friend:", friendId);
              }
            } catch (error) {}
          }
        } catch (err) {
          console.error("Error in disconnectUser:", err);
        }
      };

      disconnectUser();
    });
  });
}
const sendMessageToSocketId = (socketId, messageObject) => {
  // console.log(messageObject);
  // console.log(socketId);
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

module.exports = { initilizeSocket, sendMessageToSocketId };
