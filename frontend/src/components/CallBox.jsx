import React, { useEffect, useRef, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaAngleLeft } from "react-icons/fa6";
import { BsPeopleFill } from "react-icons/bs";
import { FaRecordVinyl } from "react-icons/fa6";
import { MdAddBox } from "react-icons/md";
import { BiChat } from "react-icons/bi";
import VideoBox from "./VideoBox";
import { SocketContext } from "../context/SocketContext";
import { useSelector } from "react-redux";

const CallBox = (props) => {
  const user = useSelector((state) => state?.user?.user);
  const [peers, setPeers] = useState([]);
  const [group, setGroup] = useState(new Map());
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const remoteVideoRefs = useRef({});
  const localStream = useRef(null);
  const screenStream = useRef(null); // Ref for screen-sharing stream

  const { socket } = useContext(SocketContext);
  const roomId = "12345"; // Replace with dynamic roomId if needed
  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  const [isMuted, setIsMuted] = useState(false); 
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUsers, setshowUsers] = useState(false);
  const [addUsers, setaddUser] = useState(false);


  // extra
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
const addToGroup = (data) => {
  setGroup((prev) => {
    const updated = new Map(prev);
    updated.set(data.id, data);
    return updated;
  });
};
  // creating room

  // create Stream
// Setup WebRTC and socket listeners
// Setup WebRTC and socket listeners
  useEffect(() => {
    if (!socket) {
      console.error("Socket not available");
      return;
    }

    const setup = async () => {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current){
          localVideoRef.current.srcObject = localStream.current;
        } else {
          console.warn("localVideoRef not ready");
        }
        const data = {
          id: user?._id,
          fullName: user?.fullname,
          email : user?.email,
          avatar: user?.avatar
        }
        group.set(user?._id,data);
        socket.emit("join-room", roomId,data);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    setup();

    socket.on("user-joined", async (userId,data) => {
      // const userId = data?._id;
      addToGroup(data);
      
      if (!remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId] = React.createRef();
      }
      setPeers((prev) => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });

      const pc = createPeerConnection(userId);
      peerConnections.current[userId] = pc;

      addCurrentTracks(pc);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { offer, to: userId });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    });

    socket.on("offer", async ({ offer, from }) => {
      console.log(`Received offer from ${from}`);
      if (!remoteVideoRefs.current[from]) {
        remoteVideoRefs.current[from] = React.createRef();
      }
      setPeers((prev) => {
        if (!prev.includes(from)) {
          return [...prev, from];
        }
        return prev;
      });

      const pc = createPeerConnection(from);
      peerConnections.current[from] = pc;

      addCurrentTracks(pc);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on("answer", async ({ answer, from }) => {
      try {
        const pc = peerConnections.current[from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      try {
        const pc = peerConnections.current[from];
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ ICE candidate added");
        }
      } catch (error) {
        console.error("❌ Error adding ICE candidate:", error);
      }
    });

    socket.on("user-disconnected", (userId) => {
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
        delete remoteVideoRefs.current[userId];
        setPeers((prev) => prev.filter((id) => id !== userId));
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
        localStream.current = null;
      }
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((track) => track.stop());
        screenStream.current = null;
      }
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
    };
  }, [socket, roomId]);

  const addCurrentTracks = (pc) => {
    if (screenStream.current && isScreenSharing) {
      const videoTrack = screenStream.current.getVideoTracks()[0];
      if (videoTrack) {
        pc.addTrack(videoTrack, screenStream.current);
        console.log(`Added screen video track to peer connection`);
      }
      const audioTrack = localStream.current?.getAudioTracks()[0];
      if (audioTrack) {
        pc.addTrack(audioTrack, localStream.current);
        console.log(`Added audio track to peer connection`);
      }
    } else if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        if (track.kind === "video" && isCameraOn) {
          pc.addTrack(track, localStream.current);
          console.log(`Added camera video track to peer connection`);
        } else if (track.kind === "audio") {
          pc.addTrack(track, localStream.current);
          console.log(`Added audio track to peer connection`);
        }
      });
    }
  };

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { candidate: e.candidate, to: userId });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      const videoRef = remoteVideoRefs.current[userId];
      if (videoRef?.current) {
        console.log(`Assigning stream to video ref for user ${userId}`);
        videoRef.current.srcObject = stream;
      } else {
        console.warn(`Video ref for user ${userId} not ready`);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}: ${pc.connectionState}`);
      if (pc.connectionState === "failed") {
        console.error(`Peer connection failed for user ${userId}`);
      }
    };

    return pc;
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(`Microphone ${audioTrack.enabled ? "unmuted" : "muted"}`);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream.current && !isScreenSharing) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        console.log(`Camera ${videoTrack.enabled ? "on" : "off"}`);

        // Update peer connections
        Object.values(peerConnections.current).forEach(async (pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((sender) => sender.track?.kind === "video");
          if (videoSender) {
            await videoSender.replaceTrack(videoTrack.enabled ? videoTrack : null);
            console.log(`Replaced video track for peer connection: ${videoTrack.enabled ? "camera" : "null"}`);
          }
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen-sharing
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((track) => track.stop());
        screenStream.current = null;
        console.log("Stopped screen-sharing stream");
      }
      setIsScreenSharing(false);
      // Restore camera stream to local video
      if (localVideoRef.current && localStream.current) {
        localVideoRef.current.srcObject = localStream.current;
        console.log("Restored local camera stream to video element");
      }
      // Update peer connections
      Object.values(peerConnections.current).forEach(async (pc) => {
        if (pc.connectionState === "connected") {
          const senders = pc.getSenders();
          const videoSender = senders.find((sender) => sender.track?.kind === "video");
          if (videoSender && localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            try {
              if (videoTrack && isCameraOn) {
                await videoSender.replaceTrack(videoTrack);
                console.log("Replaced track with camera video");
              } else {
                await videoSender.replaceTrack(null);
                console.log("Replaced track with null (camera off)");
              }
            } catch (error) {
              console.error("Error replacing track:", error);
            }
          }
        } else {
          console.warn(`Peer connection not in connected state: ${pc.connectionState}`);
        }
      });
    } else {
      // Start screen-sharing
      try {
        screenStream.current = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setIsScreenSharing(true);
        setIsCameraOn(false);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream.current;
          console.log("Set local video to screen-sharing stream");
        }
        // Update peer connections
        Object.values(peerConnections.current).forEach(async (pc) => {
          if (pc.connectionState === "connected") {
            const senders = pc.getSenders();
            const videoSender = senders.find((sender) => sender.track?.kind === "video");
            const videoTrack = screenStream.current.getVideoTracks()[0];
            if (videoSender && videoTrack) {
              try {
                await videoSender.replaceTrack(videoTrack);
                console.log("Replaced track with screen-sharing video");
              } catch (error) {
                console.error("Error replacing track with screen share:", error);
              }
            }
          } else {
            console.warn(`Peer connection not in connected state: ${pc.connectionState}`);
          }
        });
        screenStream.current.getVideoTracks()[0].onended = () => {
          console.log("Screen-sharing ended by user");
          toggleScreenShare();
        };
      } catch (error) {
        console.error("Error starting screen-sharing:", error);
        setIsScreenSharing(false);
      }
    }
  };


  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.1,
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const controlsVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const videoVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const chatVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const iconHoverVariants = {
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="h-full w-full bg-[#04090f] flex flex-row relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Video Area */}
      <motion.div
        className={`h-full transition-all duration-300 mr-1 ${
          isMobile
            ? showChat
              ? "w-0 overflow-hidden"
              : "w-full"
            : showChat
            ? "w-[70%]"
            : "w-full"
        }`}
        layout
      >
        {/* Header */}
        <motion.div
          className="h-[10%] w-full flex flex-row justify-between items-center border-b-2 border-white px-2 md:px-0"
          variants={headerVariants}
        >
          <div
            onClick={() => props?.setvideocall(true)}
            className="h-full w-[10%] md:w-[10%] flex justify-center items-center"
          >
            <motion.div
              className="h-[40%] w-[40%] md:h-[40%] md:w-[40%] rounded-md bg-[#354657] flex justify-center items-center cursor-pointer"
              whileHover="hover"
              variants={iconHoverVariants}
            >
              <FaAngleLeft className="text-white" size={isMobile ? 12 : 15} />
            </motion.div>
          </div>

          <div className="h-full w-[90%] flex justify-start items-center overflow-hidden">
            <motion.h1
              className="text-gray-200 text-sm md:text-base lg:text-lg truncate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              Room-Id: {roomId}
            </motion.h1>

            <motion.div
              className="bg-[#354657] cursor-pointer ml-2 md:ml-5 rounded-md gap-1 md:gap-2 h-[50%] w-auto px-2 md:w-[13%] flex flex-row justify-center items-center"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setaddUser(false);
                setShowChat(false);
                setshowUsers(true);
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <BsPeopleFill className="text-white" size={isMobile ? 12 : 16} />
              <h2 className="text-white text-xs md:text-sm">{group.size}</h2>
            </motion.div>
          </div>

          {/* Mobile Chat Toggle */}
          {isMobile && (
            <motion.button
              className="md:hidden p-2 text-white"
              onClick={() => {
                setaddUser(false);
                setShowChat(true);
                setshowUsers(false);
              }}
              whileHover="hover"
              variants={iconHoverVariants}
            >
              <BiChat size={20} />
            </motion.button>
          )}
        </motion.div>

        {/* Controls */}
        <motion.div
          className="h-[8%] w-full flex flex-row justify-between items-center px-2 md:px-0"
          variants={controlsVariants}
        >
          <div className="h-full font-medium flex flex-row text-gray-400 gap-1 md:gap-2 justify-start items-center">
            <motion.div variants={pulseVariants} animate="pulse">
              <FaRecordVinyl
                className="ml-2 md:ml-3 text-red-500"
                size={isMobile ? 16 : 20}
              />
            </motion.div>
            <h2 className="text-xs md:text-sm">REC</h2>
            <h2 className="text-xs md:text-sm">00:12:36</h2>
          </div>

          <motion.div
            className="flex flex-row justify-center items-center gap-1 md:gap-2 mr-2 md:mr-3 text-gray-300 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => {
              setaddUser(true);
              setShowChat(false);
              setshowUsers(false);
            }}
          >
            <MdAddBox size={isMobile ? 20 : 25} />
            {!isMobile && <h2 className="text-[13px]">Add user to the call</h2>}
          </motion.div>
        </motion.div>

        {/* Video Area */}
        <motion.div
          className="h-[70%] md:h-[70%] pl-1 md:pl-2 w-full"
          variants={videoVariants}
        >
          <VideoBox
            peers={peers}
            remoteVideoRefs={remoteVideoRefs}
            localVideoRef={localVideoRef}
            toggleMute={toggleMute}
            toggleCamera={toggleCamera}
            toggleScreenShare={toggleScreenShare}
          />

        </motion.div>

        {/* Bottom Controls Space */}
        <motion.div
          className="h-[12%] md:h-auto flex-1 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {/* Add your call controls here */}
        </motion.div>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {(isMobile ? showChat && showChat : showChat) && (
          <motion.div
            className={`h-full bg-[#000000] border-l border-gray-700 ${
              isMobile ? "absolute top-0 right-0 w-full z-10" : "w-[30%]"
            }`}
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {/* Chat Header */}
            <motion.div
              className="h-[10%] w-full flex items-center justify-between px-4 border-b border-gray-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h3 className="text-white font-medium">Live Chat</h3>

              <motion.button
                onClick={() => {
                  setaddUser(false);
                  setShowChat(false);
                  setshowUsers(false);
                }}
                className="text-gray-400 hover:text-white"
                whileHover="hover"
                variants={iconHoverVariants}
              >
                <FaAngleLeft size={18} />
              </motion.button>
            </motion.div>

            {/* Chat Content */}
            <motion.div
              className="h-[90%] w-full flex flex-col p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="flex-1 text-gray-400 text-center flex items-center justify-center">
                <p>Chat messages will appear here</p>
              </div>

              {/* Chat Input */}
              <motion.div
                className="mt-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-3 py-2 bg-[#2a3441] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* User List Panel  */}

      <AnimatePresence>
        {showUsers && (
          <motion.div
            className={`h-full bg-[#000000bb] border-l border-gray-700 ${
              isMobile ? "absolute top-0 right-0 w-full z-10" : "w-[30%]"
            }`}
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {/* User List Header */}
            <motion.div
              className="h-[10%] w-full flex items-center justify-between px-4 border-b bg-black border-gray-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h3 className="text-white font-medium">Current Users</h3>
              <motion.button
                onClick={() => {
                  setaddUser(false);
                  setShowChat(false);
                  setshowUsers(false);
                }}
                className="text-gray-400 hover:text-white"
                whileHover="hover"
                variants={iconHoverVariants}
              >
                <FaAngleLeft size={18} />
              </motion.button>
            </motion.div>

            {/* User List Content */}
            <motion.div
              className="h-[90%] w-full flex flex-col p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="flex-1 space-y-4">
                <div className="text-gray-400 text-sm mb-4 text-center">
                  Call Participants (15+)
                </div>

                {/* Additional Users */}
              {[...group].map(([userId, data], index) => (
  <motion.div
    key={userId}
    className="w-full bg-[#2a3441] rounded-xl shadow-md p-4 flex items-center gap-4 hover:bg-[#354657] transition-all duration-300"
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
  >
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-600">
      {data.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")}
    </div>
    <div className="flex-1">
      <h2 className="text-lg font-semibold text-white">
        {data.fullName}
      </h2>
      <p className="text-sm text-gray-400">{data.email}</p>
    </div>
    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
  </motion.div>
))}

                {/* More Users Indicator */}
                <motion.div
                  className="w-full bg-[#2a3441] rounded-xl shadow-md p-4 flex items-center justify-center gap-2 text-gray-400 border-2 border-dashed border-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  <span className="text-sm">+10 more participants</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Join User */}
      <AnimatePresence>
        {addUsers && (
          <motion.div
            className={`h-full bg-[#000000] border-l border-gray-700 ${
              isMobile ? "absolute top-0 right-0 w-full z-10" : "w-[30%]"
            }`}
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {/* User List Header */}
            <motion.div
              className="h-[10%] w-full flex items-center justify-between px-4 border-b border-gray-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h3 className="text-white font-medium">Add User</h3>
              <motion.button
                onClick={() => {
                  setaddUser(false);
                  setShowChat(false);
                  setshowUsers(false);
                }}
                className="text-gray-400 hover:text-white"
                whileHover="hover"
                variants={iconHoverVariants}
              >
                <FaAngleLeft size={18} />
              </motion.button>
            </motion.div>

            {/* User List Content */}
            <motion.div
              className="h-[90%] w-full flex flex-col p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="flex-1 space-y-4">
                {/* Additional Users */}
                {[
                  {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    avatar: "/api/placeholder/48/48",
                  },
                  {
                    name: "Jane Smith",
                    email: "jane.smith@example.com",
                    avatar: "/api/placeholder/48/48",
                  },
                  {
                    name: "Mike Johnson",
                    email: "mike.j@example.com",
                    avatar: "/api/placeholder/48/48",
                  },
                  {
                    name: "Sarah Wilson",
                    email: "sarah.w@example.com",
                    avatar: "/api/placeholder/48/48",
                  },
                ].map((user, index) => (
                  <motion.div
                    key={user.email}
                    className="w-full bg-[#2a3441] rounded-xl shadow-md p-4 flex items-center gap-4 hover:bg-[#354657] transition-all duration-300"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-600">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-white">
                        {user.name}
                      </h2>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </motion.div>
                ))}

                {/* More Users Indicator */}
                <motion.div
                  className="w-full bg-[#2a3441] rounded-xl shadow-md p-4 flex items-center justify-center gap-2 text-gray-400 border-2 border-dashed border-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  <span className="text-sm">+10 more participants</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Chat Toggle */}
      {!isMobile && !showChat && (
        <motion.div
          drag
          dragConstraints={{
            top: -window.innerHeight * 0.4,
            left: -window.innerWidth * 0.6,
            right: 0,
            bottom: window.innerHeight * 0.4,
          }}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => {
            setTimeout(() => setIsDragging(false), 100);
          }}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.button
            className="bg-[#354657] p-3 rounded-full text-white shadow-lg cursor-pointer select-none"
            onClick={() => {
              if (!isDragging) {
                setShowChat(true);
                setaddUser(false);
                setshowUsers(false);
              }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <BiChat size={20} />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CallBox;
