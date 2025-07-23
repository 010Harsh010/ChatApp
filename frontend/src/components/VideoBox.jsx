import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiScreencastBold } from "react-icons/pi";
import { PiPhoneDisconnectFill } from "react-icons/pi";
import { IoVideocam, IoVideocamOff } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { IoSettings } from "react-icons/io5";
import { BsFillMicMuteFill } from "react-icons/bs";

const VideoBox = (props) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const videoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const remoteVideoVariants = {
    hidden: { opacity: 0, scale: 0.8, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        delay: 0.3,
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const controlsVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    hover: {
      scale: 1.1,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

  const disconnectButtonVariants = {
    ...buttonVariants,
    hover: {
      scale: 1.15,
      y: -3,
      backgroundColor: "#dc2626",
      boxShadow: "0 8px 25px rgba(220, 38, 38, 0.4)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const pulseVariants = {
    pulse: {
      boxShadow: [
        "0 0 0 0 rgba(239, 68, 68, 0.7)",
        "0 0 0 10px rgba(239, 68, 68, 0)",
        "0 0 0 0 rgba(239, 68, 68, 0)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const toggleVideo = () => {
    props?.toggleCamera();
    setIsVideoOn(!isVideoOn);
  };

  const toggleMic = () => {
    
    props?.toggleMute();
    setIsMicOn(!isMicOn);
  };

  const toggleScreenShare = () => {
    props?.toggleScreenShare();
    setIsScreenSharing(!isScreenSharing);
  };

  return (
    <motion.div
      className="relative h-full w-full overflow-hidden rounded-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      {/* Main Video */}
      <motion.div
        className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-800 relative"
        variants={videoVariants}
      >
        <motion.video
          id="local-video"
          ref={props?.localVideoRef}
          autoPlay
          muted
          playsInline
          className="object-cover h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVideoOn ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Video Off Placeholder */}
        <AnimatePresence>
          {!isVideoOn && (
            <motion.div
              className="absolute inset-0 bg-gray-800 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                  <IoVideocamOff className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-400 text-sm">Camera is off</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen Sharing Indicator */}
        <AnimatePresence>
          {isScreenSharing && (
            <motion.div
              className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Screen Sharing
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Other Users' Videos */}
      <motion.div
        className={`absolute right-2 top-2 ${
          isMobile ? "w-[30%] h-[25%]" : "w-[20%] h-[30%]"
        }`}
        variants={remoteVideoVariants}
      >
        <AnimatePresence>
          {
            <motion.div
              className="h-full w-full relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              {props?.peers.map((userId) => (
                <video
                  id={userId}
                  ref={props?.remoteVideoRefs?.current[userId]}
                  autoPlay
                 
                  className="object-cover rounded-xl h-full m-1 w-full border-2 border-white/20 shadow-lg"
                />
              ))}

              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            </motion.div>
          }
        </AnimatePresence>
      </motion.div>

      {/* Control Options */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className={`absolute bottom-0 w-full ${
              isMobile ? "h-[20%]" : "h-[15%]"
            } bg-gradient-to-t from-black/60 to-transparent`}
            variants={controlsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              className={`h-full w-full flex flex-row justify-center items-center ${
                isMobile ? "gap-2 px-2" : "gap-4"
              }`}
            >
              {/* Screen Share Button */}
              <motion.button
                className={`${
                  isMobile ? "h-12 w-12" : "h-14 w-14"
                } rounded-full flex justify-center items-center transition-all duration-300 ${
                  isScreenSharing
                    ? "bg-green-600 shadow-lg"
                    : "bg-[rgba(47,46,45,0.8)] backdrop-blur-sm hover:bg-[rgba(47,46,45,0.9)]"
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={toggleScreenShare}
              >
                <PiScreencastBold
                  className={`${
                    isScreenSharing ? "text-white" : "text-gray-200"
                  }`}
                  size={isMobile ? 18 : 20}
                />
              </motion.button>

              {/* Video Toggle Button */}
              <motion.button
                className={`${
                  isMobile ? "h-12 w-12" : "h-14 w-14"
                } rounded-full flex justify-center items-center transition-all duration-300 ${
                  isVideoOn
                    ? "bg-[rgba(47,46,45,0.8)] backdrop-blur-sm hover:bg-[rgba(47,46,45,0.9)]"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={toggleVideo}
              >
                {isVideoOn ? (
                  <IoVideocam
                    className="text-gray-200"
                    size={isMobile ? 18 : 20}
                  />
                ) : (
                  <IoVideocamOff
                    className="text-white"
                    size={isMobile ? 18 : 20}
                  />
                )}
              </motion.button>

              {/* Disconnect Button */}
              <motion.button
                className={`${
                  isMobile ? "h-12 w-16" : "h-14 w-20"
                } rounded-2xl flex justify-center items-center bg-red-600 hover:bg-red-700 transition-all duration-300`}
                variants={disconnectButtonVariants}
                whileHover="hover"
                whileTap="tap"
                animate="pulse"
              >
                <PiPhoneDisconnectFill
                  className="text-white"
                  size={isMobile ? 24 : 30}
                />
              </motion.button>

              {/* Microphone Toggle Button */}
              <motion.button
                className={`${
                  isMobile ? "h-12 w-12" : "h-14 w-14"
                } rounded-full flex justify-center items-center transition-all duration-300 ${
                  isMicOn
                    ? "bg-[rgba(47,46,45,0.8)] backdrop-blur-sm hover:bg-[rgba(47,46,45,0.9)]"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={toggleMic}
              >
                {isMicOn ? (
                  <FaMicrophone
                    className="text-gray-200"
                    size={isMobile ? 16 : 18}
                  />
                ) : (
                  <BsFillMicMuteFill
                    className="text-white"
                    size={isMobile ? 16 : 18}
                  />
                )}
              </motion.button>

              {/* Settings Button */}
              <motion.button
                className={`${
                  isMobile ? "h-12 w-12" : "h-14 w-14"
                } rounded-full flex justify-center items-center bg-[rgba(47,46,45,0.8)] backdrop-blur-sm hover:bg-[rgba(47,46,45,0.9)] transition-all duration-300`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <IoSettings
                  className="text-gray-200"
                  size={isMobile ? 18 : 20}
                />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute/Video Off Indicators */}
      <AnimatePresence>
        {(!isMicOn || !isVideoOn) && (
          <motion.div
            className="absolute top-4 right-4 flex gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {!isMicOn && (
              <motion.div
                className="bg-red-600 text-white p-2 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <BsFillMicMuteFill size={16} />
              </motion.div>
            )}
            {!isVideoOn && (
              <motion.div
                className="bg-red-600 text-white p-2 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                  delay: 0.1,
                }}
              >
                <IoVideocamOff size={16} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoBox;
