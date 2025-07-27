import React, { useState, useEffect } from "react";
import { IoMdCall, IoMdAddCircleOutline } from "react-icons/io";
import { FaVideo } from "react-icons/fa6";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { BiCheckDouble } from "react-icons/bi";
import { RiSendPlaneFill } from "react-icons/ri";
import CallBox from "./CallBox.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext.jsx";
import { useRef } from "react";
import { formatTimeAgo } from "../converter.js";
import { IoMdSend } from "react-icons/io";
import { X } from "lucide-react";
import {
  setMessages,
  setFirstMessages,
  updateMessagesStatus,
  setRoomId,
  setSearchFriend
} from "../context/user/friendSlice.js";
import Users from "../Server/user.js";
import { motion, AnimatePresence } from "motion/react";
import EmojiPicker from "emoji-picker-react";
import File from "./Files.jsx";
import Call from "./Call.jsx";
import { MdVideocamOff } from "react-icons/md";

const Chatbox = () => {
  const auth = new Users();
  let isOnline = useSelector((state) => state?.friend?.isOnline);
  const [videocall, setvideocall] = useState(true);
  const { socket } = useContext(SocketContext);
  const [friend, setFriend] = useState(null);
  const friendData = useSelector((state) => state.friend.data);
  const currentMessage = useRef(null);
  const messagesEndRef = useRef(null);
  const fileMessage = useRef(null);

  const messagesContainerRef = useRef(null);
  const user = useSelector((state) => state.user.user);
  const RoomId = useSelector((state) => state.friend.roomId);
  const dispatch = useDispatch();
  const [newmessages, setnewmessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setselectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [bigImage, setBigImages] = useState({});
  const [incommingCall, setIncomingCall] = useState(false);
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "video/mp4",
    "video/webm",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];

  const [swipeMessage, setswipeMessage] = useState({});

  const handleDragEnd = (event, info, message) => {
    const threshold = 100;

    if (Math.abs(info.offset.x) > threshold) {
      setswipeMessage(message);
      scrollToBottom();
      currentMessage.current.focus();
    }
  };

  const handlechangeImage = (event, info) => {
    const Posthreshold = +50;
    const Negthreshold = -50;

    // Filter only messages of type 'image'
    const imageMessages = newmessages.filter(
      (msg) => msg?.messages?.type === "image"
    );

    // Find current index among only image messages
    const currentIndex = imageMessages.findIndex(
      (msg) => msg?.messages?.message === bigImage?.message
    );

    // Next image
    if (
      info.offset.x > Posthreshold &&
      currentIndex !== -1 &&
      currentIndex > 0
    ) {
      setBigImages(imageMessages[currentIndex - 1].messages);
    }

    // Previous image
    if (
      info.offset.x < Negthreshold &&
      currentIndex < imageMessages.length - 1
    ) {
      setBigImages(imageMessages[currentIndex + 1].messages);
    }
  };

  const handleEmojiClick = (emojiData) => {
    // setMessage((prev) => prev + emojiData.emoji);
    const msg = currentMessage.current.value + emojiData.emoji;
    currentMessage.current.value = msg;
    setMessage(msg);
    // Optional: Close emoji picker after selection
    setShowEmojiPicker(false);
    currentMessage.current.focus();
  };

  // Handle input change
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim() !== "") {
      socket.emit("typing", {
        sender: friendData?._id,
        RoomId: RoomId,
      });
    }
  };

  // Scroll to bottom with animation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [newmessages]);

  useEffect(() => {
    const getmess = async () => {
      try {
        const res = await auth.getMessages({ id: RoomId });
        if (!res) throw new Error("no message");
        console.log("data", res);
        dispatch(setFirstMessages(res));
        setnewmessages(res);
      } catch (error) {
        console.log(error.message);
      }
    };
    getmess();
  }, [RoomId]);

  useEffect(() => {
    if (newmessages?.length === 0 && friendData?._id && !RoomId) return;
    socket.emit("unseen", {
      sender: friendData?._id,
      RoomId: RoomId,
    });
  }, [friendData, socket]);

  useEffect(() => {
    socket.on("madeSeen", () => {
      setnewmessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg?.messages?.status === "unseen") {
            return {
              ...msg,
              messages: {
                ...msg.messages,
                status: "seen",
              },
            };
          }
          return msg;
        })
      );
    });

    return () => {
      socket.off("madeSeen");
    };
  }, [socket]);

  const checkFileType = () => {
    const file = fileMessage.current.files[0];
    if (!allowedTypes.includes(file.type)) {
      alert("File type not allowed!");
      fileMessage.current.value = null;
      return false;
    }
    return true;
  };
  const getFileEnumType = (file) => {
    if (!file) return null;

    const extension = file.name.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension))
      return "image";
    if (["mp4", "webm", "mov", "avi"].includes(extension)) return "video";
    if (["pdf", "doc", "docx", "ppt", "xls", "zip", "rar"].includes(extension))
      return "file";

    return "file";
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      let message = await currentMessage.current.value.trim();
      const sideContent = swipeMessage;
      let file;
      if (fileMessage.current) {
        file = await fileMessage.current.files[0];
        if (file) {
          setselectedFile(file);

          const type = getFileEnumType(file);

          if (type) {
            const messageObject = {
              message: message,
              sender: user?._id,
              receiver: friendData?._id,
              conversation: RoomId,
              type: type,
              status: "unseen",
            };
            console.log("send");
            const response = await auth.sendFile({ file, messageObject });
          }
          if (fileMessage.current) {
            fileMessage.current.value = null;
          }
          setselectedFile(null);
          return;
        }
      }
      if (!message) {
        return;
      }
      let metadata = null;
      if (sideContent?.message || sideContent?.content) {
        metadata = {
          caption: `${
            sideContent?.message ? sideContent?.message : sideContent?.content
          }`,
          Id: sideContent?._id,
          type: sideContent?.type,
        };
      }

      let messageObject = {
        message: message,
        sender: user?._id,
        receiver: friendData?._id,
        conversation: RoomId,
        type: "text",
        status: "unseen",
      };
      if (metadata) {
        messageObject = {
          message: message,
          sender: user?._id,
          receiver: friendData?._id,
          conversation: RoomId,
          type: "text",
          status: "unseen",
          metadata: metadata,
        };
      }

      socket.emit("send-message", messageObject);
    } catch (error) {
      console.log(error.message);
    } finally {
      currentMessage.current.value = "";
      setswipeMessage({});
      scrollToBottom();
    }
  };

  useEffect(() => {
    const handleTyping = ({ roomE }) => {
      // alert("usertyping received for room:");
      if (roomE !== RoomId) return;
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
      scrollToBottom();
    };

    socket.on("usertyping", handleTyping);
    return () => {
      socket.off("usertyping", handleTyping);
    };
  }, [socket]);

  useEffect(() => {
    socket.on("receive-message", (messageObject) => {
      console.log(messageObject);
      if (!messageObject) return;
      if (messageObject?.conversation !== RoomId){
        return;
      }
      const msg = { messages: messageObject };
      dispatch(setMessages(msg));
      setnewmessages((state) => [...state, msg]);
      socket.emit("onceseen", messageObject);
      scrollToBottom();
      if (messageObject?.type === "videocall") {
        if (messageObject?.sender === user?._id) {
          setvideocall(false);
        } else {
          console.log("getting");
          setIncomingCall(true);
        }
      }
    });
    return () => socket.off("receive-message");
  }, [socket]);

  useEffect(() => {
    if (friendData) {
      setFriend(friendData);
    }
  }, [friendData]);

  if (!friend) {
    return (
      <motion.div
        className="h-full w-full flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-white text-lg">Friend not found</div>
      </motion.div>
    );
  }

  const createVideoRoom = async () => {
    try {
      // const room = await auth.createVideoRoom();
      // dispatch(setRoomId(room._id));
      // setvideocall(false);
      // socket.emit("call-friend", {
      //   id: friendData?._id,
      //   roomId: room._id,
      //   sender: {
      //     _id: user?._id,
      //     fullname: user?.fullname,
      //     avatar: user?.avatar,
      //   },
      // });
      socket.emit("createRoom", {
        sender: user?._id,
        reciver: friendData?._id,
        RoomId: RoomId,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAns = (ans) => {
    if(ans){
      setIncomingCall(false);
      setvideocall(false);
    }else{
      setIncomingCall(false);
    }
  }

  const viewProfile = (id) => {
    if (!id) return;
    dispatch(setSearchFriend(id));
    
  }
  return (
    <motion.div
      className="h-[100%] w-[100%] overflow-hidden"
      initial={{
        opacity: 0,
        scale: 0,
        transformOrigin: "top left",
        clipPath: "circle(0% at 0% 0%)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        clipPath: "circle(150% at 0% 0%)",
        transition: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          clipPath: { duration: 0.7, ease: "easeOut" },
          opacity: { duration: 0.3 },
          scale: { duration: 0.5, ease: "easeOut" },
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        clipPath: "circle(0% at 0% 0%)",
        transition: { duration: 0.4 },
      }}
    >
      <AnimatePresence mode="wait">
        {videocall ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full flex flex-col"
          >
            {/* Header */}
            <motion.div
              className="border-l-2 border-white h-[8%] shadow-2xl box-border bg-[#17191C] w-full flex flex-row justify-center items-center px-2 sm:px-4"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Avatar */}
              <motion.div
                className="h-[100%] w-12 sm:w-14 md:w-16 flex items-center justify-center p-1"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.img
                  src={friend?.avatar}
                  alt="avatar"
                  className="object-cover h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full flex-shrink-0"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                />
              </motion.div>

              {/* User Info */}
              <div onClick={() => {
                viewProfile(friend?._id);
              }} className="h-[100%] flex-1 flex flex-col justify-center min-w-0 px-2 sm:px-3">
                <motion.h1
                  className="font-semibold text-sm sm:text-base md:text-lg text-white truncate"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {friend?.fullname}
                </motion.h1>
                <motion.h4
                  className={`font-medium text-xs sm:text-sm ${
                    isOnline ? "text-green-600" : "text-gray-500"
                  } truncate`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {!isOnline
                    ? formatTimeAgo(friend?.lastseen)
                    : isTyping
                    ? "Typing"
                    : "Online"}
                </motion.h4>
              </div>

              {/* Action Buttons */}
              <motion.div
                className="h-[100%] flex flex-row gap-2 sm:gap-4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.div
                  className="h-[100%] flex justify-center items-center"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoMdCall
                    className="text-white hover:text-gray-400 cursor-pointer"
                    size={20}
                  />
                </motion.div>
                <motion.div
                  onClick={() => createVideoRoom()}
                  className="h-[100%] flex justify-center items-center"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaVideo
                    className="text-white hover:text-gray-400 cursor-pointer"
                    size={20}
                  />
                </motion.div>
              </motion.div>

              {/* accept call */}
              {incommingCall && (
                <motion.div
                  className="h-[100%] flex right-0 top-0 flex-row gap-2 z-50 fixed sm:gap-4"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Call handleAns={handleAns}  />
                </motion.div>
              )}
            </motion.div>

            {/* Messages Container */}

            {!bigImage?.message && (
              <>
                <motion.div
                  ref={messagesContainerRef}
                  style={{ scrollbarWidth: "none" }}
                  className="h-[84%] w-full flex flex-col overflow-y-scroll gap-2 sm:gap-3 pt-2 sm:pt-4 pb-3 px-2 sm:px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <AnimatePresence>
                    {Array.isArray(newmessages) &&
                      newmessages?.map(
                        (msg, index) =>
                          msg?.messages && (
                            <motion.div
                              key={`${msg?.messages?._id || index}-${index}`}
                              className={`flex w-full ${
                                msg?.messages?.sender === user?._id
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                              initial={{
                                opacity: 0,
                                y: 50,
                                x:
                                  msg?.messages?.sender === user?._id
                                    ? 50
                                    : -50,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                x: 0,
                              }}
                              exit={{
                                opacity: 0,
                                y: -20,
                                transition: { duration: 0.2 },
                              }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 100,
                              }}
                              layout
                            >
                              <motion.div
                                className="max-w-[85%] cursor-grab active:cursor-grabbing sm:max-w-[75%] md:max-w-[70%]"
                                drag="x"
                                dragConstraints={{
                                  left: 0,
                                  right: 100,
                                }}
                                dragElastic={0.2}
                                dragSnapToOrigin={true}
                                whileDrag={{
                                  scale: 0.9,
                                  // rotate: (info) => info.offset.x / 10,
                                  boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                                }}
                                onDragEnd={(event, info) =>
                                  handleDragEnd(
                                    event,
                                    info,
                                    msg?.messages || {}
                                  )
                                }
                                dragTransition={{
                                  bounceStiffness: 600,
                                  bounceDamping: 20,
                                }}
                              >
                                <div
                                  className={`${
                                    msg?.messages?.sender !== user?._id
                                      ? "gap-2 flex flex-row items-end"
                                      : ""
                                  }`}
                                >
                                  {/* Friend Avatar */}
                                  {msg?.messages?.sender !== user?._id && (
                                    <motion.div
                                      className="flex-shrink-0 mb-1"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        delay: index * 0.1 + 0.2,
                                        type: "spring",
                                        stiffness: 200,
                                      }}
                                    >
                                      <img
                                        src={friendData?.avatar}
                                        className="object-cover h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full"
                                        alt="avatar"
                                      />
                                    </motion.div>
                                  )}

                                  {/* Message Bubble */}
                                  <motion.div
                                    className={`flex flex-col ${
                                      msg?.messages?.type !== "text"
                                        ? "p-0.5"
                                        : `p-2 sm:p-2`
                                    } rounded-lg break-words hyphens-auto overflow-wrap-anywhere ${
                                      msg?.messages?.sender === user?._id
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-gray-800 text-white rounded-bl-sm"
                                    }`}
                                    whileHover={{
                                      scale: 1.02,
                                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {/* 
                                    extracontent  
                                 */}
                                    {msg?.messages?.metadata?.Id && (
                                      <motion.div className="bg-gray-900 flex flex-row">
                                        <div
                                          className={`w-1 ${
                                            msg?.messages?.sender !==
                                            friendData?._id
                                              ? "bg-yellow-400"
                                              : "bg-[#00e29c]"
                                          }  rounded-l-2xl`}
                                        ></div>
                                        <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="bg-[#2a2a2a] text-white p-2 rounded-lg shadow-md relative max-h-14 w-full overflow-hidden"
                                        >
                                          <div className="flex flex-col h-full">
                                            <span
                                              className={`text-sm ${
                                                msg?.messages?.sender !==
                                                friendData?._id
                                                  ? "text-yellow-300"
                                                  : "text-[#00e29c]"
                                              } font-semibold text-[10px] flex-shrink-0 text-ellipsis`}
                                            >
                                              {msg?.messages?.sender ===
                                              friendData?._id
                                                ? friendData?.fullname
                                                : "You"}
                                            </span>

                                            {msg?.messages?.type === "text" ? (
                                              <span className="text-sm mt-1 line-clamp-3 overflow-hidden text-ellipsis ">
                                                {
                                                  msg?.messages?.metadata
                                                    ?.caption
                                                }
                                              </span>
                                            ) : (
                                              <div className="flex-1 mt-1 overflow-hidden rounded">
                                                {msg?.messages?.type ===
                                                  "image" && (
                                                  <div
                                                    className="bg-black p-0.5 pl-2 flex flex-row justify-between h-full mt-1"
                                                    style={{
                                                      borderRadius: "5px",
                                                    }}
                                                  >
                                                    <div className="flex align-middle justify-between">
                                                      {msg?.messages?.metadata
                                                        ?.mimeType ||
                                                        msg?.messages?.metadata
                                                          ?.fileName}
                                                    </div>
                                                    <img
                                                      src={
                                                        msg?.messages?.message
                                                      }
                                                      className="h-10 w-10 object-cover "
                                                    />
                                                  </div>
                                                )}
                                                {msg?.messages?.type ===
                                                  "video" && (
                                                  <div
                                                    className="bg-black p-0.5 pl-2 flex flex-row justify-between align-middle h-full mt-1"
                                                    style={{
                                                      borderRadius: "5px",
                                                    }}
                                                  >
                                                    <div>
                                                      {
                                                        msg?.messages?.metadata
                                                          ?.mimeType
                                                      }
                                                    </div>
                                                    <video
                                                      className="w-fullflex"
                                                      src={
                                                        msg?.messages?.message
                                                      }
                                                      controls={false}
                                                    />
                                                  </div>
                                                )}
                                                {msg?.messages?.type ===
                                                  "file" && (
                                                  <div className="bg-black p-2 h-full">
                                                    <div className="flex align-middle justify-between">
                                                      <div>
                                                        {
                                                          msg?.messages
                                                            ?.metadata?.mimeType
                                                        }
                                                      </div>
                                                      <a
                                                        href={
                                                          msg?.messages?.message
                                                        }
                                                        target="_blank"
                                                      >
                                                        {msg?.messages?.metadata
                                                          ?.fileName ||
                                                          "unknown Documnet"}
                                                      </a>
                                                    </div>
                                                  </div>
                                                )}
                                                {msg?.messages?.type ===
                                                  "videocall" && (
                                                  <>
                                                    <div>
                                                      {
                                                        msg?.messages?.metadata
                                                          ?.mimeType
                                                      }
                                                    </div>
                                                    <h2>
                                                      {msg?.messages?.message}
                                                    </h2>
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>
                                      </motion.div>
                                    )}
                                    {msg?.messages?.type === "text" ? (
                                      <motion.p
                                        className="text-sm sm:text-base leading-relaxed word-wrap break-words whitespace-pre-wrap max-w-full"
                                        style={{
                                          wordBreak: "break-word",
                                          overflowWrap: "anywhere",
                                          hyphens: "auto",
                                        }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                          delay: index * 0.1 + 0.3,
                                          duration: 0.5,
                                        }}
                                      >
                                        {msg?.messages?.message ||
                                          msg?.messages?.content}
                                      </motion.p>
                                    ) : (
                                      <>
                                        {msg?.messages?.type === "videocall" ? (
                                          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg text-white w-fit shadow-md">
                                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                              <MdVideocamOff
                                                size={22}
                                                className="text-white"
                                              />
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-sm font-medium">
                                                Video call
                                              </span>
                                              <span className="text-xs text-gray-300">
                                                Ended
                                              </span>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <File
                                              msg={msg?.messages}
                                              setBigImages={setBigImages}
                                            />
                                            {msg?.messages?.metadata
                                              ?.caption ? (
                                              <p className="pl-2 right-0 w-[100%]">
                                                {
                                                  msg?.messages?.metadata
                                                    ?.caption
                                                }
                                              </p>
                                            ) : (
                                              <>Hii</>
                                            )}
                                          </>
                                        )}
                                      </>
                                    )}
                                  </motion.div>
                                </div>

                                {/* Message Timestamp */}
                                <motion.div
                                  className={`text-xs flex gap-1 items-center text-gray-400 mt-1 px-1 ${
                                    msg?.messages?.sender === user?._id
                                      ? "justify-end"
                                      : "justify-start"
                                  } ${
                                    msg?.messages?.sender !== user?._id
                                      ? "ml-8 sm:ml-10 md:ml-12"
                                      : ""
                                  }`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{
                                    delay: index * 0.1 + 0.4,
                                    duration: 0.3,
                                  }}
                                >
                                  <span className="truncate">
                                    {formatTimeAgo(msg?.messages?.createdAt)}
                                  </span>
                                  {msg?.messages?.sender === user?._id && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        delay: index * 0.1 + 0.5,
                                        type: "spring",
                                        stiffness: 300,
                                      }}
                                    >
                                      <BiCheckDouble
                                        size={16}
                                        className={`flex-shrink-0 ${
                                          msg?.messages?.status === "seen"
                                            ? "text-blue-500"
                                            : "text-gray-500"
                                        }`}
                                      />
                                    </motion.div>
                                  )}
                                </motion.div>
                              </motion.div>
                            </motion.div>
                          )
                      )}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        className="flex justify-start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            Typing...
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </motion.div>

                {/* Input Form */}
                {(swipeMessage?.message || swipeMessage?.content) && (
                  <motion.div className="bg-gray-900 flex flex-row border-t-2  border-t-gray-100">
                    <div
                      className={`w-1 ${
                        swipeMessage?.sender !== friendData?._id
                          ? "bg-yellow-400"
                          : "bg-[#00e29c]"
                      }  rounded-l-2xl`}
                    ></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#2a2a2a] text-white p-2 rounded-lg shadow-md relative max-h-24 w-full overflow-hidden"
                    >
                      <div className="flex flex-col h-full">
                        <span
                          className={`text-sm ${
                            swipeMessage?.sender !== friendData?._id
                              ? "text-yellow-300"
                              : "text-[#00e29c]"
                          } font-medium flex-shrink-0 text-ellipsis`}
                        >
                          {swipeMessage?.sender === friendData?._id
                            ? friendData?.fullname
                            : "You"}
                        </span>

                        {swipeMessage?.type === "text" ? (
                          <span className="text-sm mt-1 line-clamp-3 overflow-hidden text-ellipsis ">
                            {swipeMessage?.message}
                          </span>
                        ) : (
                          <div className="flex-1 mt-1 overflow-hidden rounded">
                            {swipeMessage?.type === "image" && (
                              <div
                                className="bg-black p-0.5 pl-2 flex flex-row justify-between h-full mt-1"
                                style={{ borderRadius: "5px" }}
                              >
                                <div className="flex align-middle justify-between">
                                  {swipeMessage?.metadata?.mimeType ||
                                    swipeMessage?.metadata?.fileName}
                                </div>
                                <img
                                  src={swipeMessage?.message}
                                  className="h-10 w-10 object-cover "
                                />
                              </div>
                            )}
                            {swipeMessage?.type === "video" && (
                              <div
                                className="bg-black p-0.5 pl-2 flex flex-row justify-between align-middle h-full mt-1"
                                style={{ borderRadius: "5px" }}
                              >
                                <div>{swipeMessage?.metadata?.mimeType}</div>
                                <video
                                  className="w-fullflex"
                                  src={swipeMessage?.message}
                                  controls={false}
                                />
                              </div>
                            )}
                            {swipeMessage?.type === "file" && (
                              <div className="bg-black p-2 h-full">
                                <div className="flex align-middle justify-between">
                                  <div>{swipeMessage?.metadata?.mimeType}</div>
                                  <a
                                    href={swipeMessage?.message}
                                    target="_blank"
                                  >
                                    {swipeMessage?.metadata?.fileName ||
                                      "unknown Documnet"}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setswipeMessage({})}
                        className="absolute top-1 right-1 text-white/60 hover:text-white text-xs z-10 cursor-pointer"
                      >
                        ×
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}

            {bigImage?.message && (
              <AnimatePresence>
                {bigImage?._id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => {
                      scrollToBottom();
                      setBigImages({});
                    }}
                  >
                    {/* Modal Container */}
                    <motion.div
                      drag="x"
                      dragConstraints={{
                        left: 100,
                        right: 100,
                      }}
                      dragElastic={0.5}
                      dragSnapToOrigin={true}
                      whileDrag={{
                        scale: 0.9,
                        // rotate: (info) => info.offset.x / 10,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                      }}
                      onDragEnd={(event, info) =>
                        handlechangeImage(event, info)
                      }
                      dragTransition={{
                        bounceStiffness: 600,
                        bounceDamping: 20,
                      }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className=" cursor-grab active:cursor-grabbing relative max-w-4xl max-h-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close Button */}
                      <motion.button
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          scrollToBottom();
                          setBigImages({});
                        }}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200 border border-white/20"
                      >
                        <X size={20} />
                      </motion.button>

                      {/* Image Container */}
                      <div className="relative">
                        <motion.img
                          initial={{ scale: 1.1, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.1, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          src={bigImage?.message}
                          alt={bigImage?.metadata?.caption}
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />

                        {/* Image overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none" />
                      </div>

                      {/* Optional: Image info bar */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6"
                      >
                        <p className="text-white text-sm opacity-80">
                          {`${"<"} Swipe for Other's ${">"}`}
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <motion.form
              onSubmit={sendMessage}
              className="h-[8%] shadow-2xl w-full border-l-2 border-gray-400 flex flex-row justify-center items-center px-2 sm:px-4 gap-2"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {/* Add Button */}
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  <IoMdAddCircleOutline
                    className={`${
                      !selectedFile ? "text-gray-300" : "text-green-500"
                    } hover:text-gray-100`}
                    size={24}
                  />
                </label>
                <input
                  ref={fileMessage}
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={() => {
                    if (fileMessage.current) {
                      if (checkFileType) {
                        setselectedFile(fileMessage.current.files[0]);
                      }
                    }
                  }}
                />
              </motion.div>

              {/* messages */}
              <motion.div
                className="flex-1 min-w-0"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="border-2 border-gray-600 h-10 sm:h-12 rounded-2xl flex flex-row bg-transparent focus-within:border-blue-500 transition-colors duration-300">
                  <input
                    ref={currentMessage}
                    type="text"
                    placeholder="Type a message..."
                    value={currentMessage.current?.value || ""}
                    autoComplete="off"
                    onChange={handleInputChange}
                    className="text-gray-400 flex-1 font-medium outline-0 pl-3 sm:pl-4 h-full bg-transparent text-sm sm:text-base min-w-0 placeholder:text-gray-500"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  />
                  <motion.div
                    className="flex-shrink-0 w-10 sm:w-12 flex justify-center items-center"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MdOutlineEmojiEmotions
                      className="cursor-pointer text-gray-400 hover:text-gray-200"
                      size={20}
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                    />
                  </motion.div>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 right-0 z-50 scale-50 origin-bottom-right">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Send Button */}
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.button
                  type="submit"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex justify-center items-center hover:bg-gray-700 transition-colors"
                  whileHover={{
                    backgroundColor: "rgba(55, 65, 81, 0.8)",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <IoMdSend
                    className="cursor-pointer text-gray-300 hover:text-gray-100"
                    size={20}
                  />
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="call"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="h-[100%] w-full"
          >
            <CallBox setvideocall={setvideocall} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Chatbox;
