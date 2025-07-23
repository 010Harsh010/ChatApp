import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EnhancedImageMessage = ({ index = 0, imageSrc,msg={}, alt = "sent",setBigImages }) => {
  // console.log(imageSrc);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 30,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: index * 0.1 + 0.3,
        duration: 0.6,
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
  };

  const imageVariants = {
    loading: {
      scale: 1.1,
      filter: "blur(10px)",
    },
    loaded: {
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        delay: index * 0.1 + 0.8,
      },
    },
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleFullscreen = () => {
    setBigImages(msg);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setBigImages({});
    setIsFullscreen(false);
  };

  return (
    <>
      <motion.div
        className="max-w-full perspective-1000"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div
          className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg"
          style={{
            transformStyle: "preserve-3d",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFullscreen();
            setBigImages(msg);
          }}
        >
          {/* Loading shimmer effect */}
          {!isLoaded && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          )}

          {/* Main image */}
          <motion.img
            src={imageSrc}
            alt={alt}
            className="rounded-lg w-full h-auto max-w-xs sm:max-w-sm md:max-w-md max-h-60 sm:max-h-80 object-cover cursor-pointer"
            variants={imageVariants}
            initial="loading"
            animate={isLoaded ? (isHovered ? "hover" : "loaded") : "loading"}
            onLoad={handleImageLoad}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFullscreen();
            }}
          />

          {/* Hover overlay with icons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                >
                  <svg
                    className="w-6 h-6 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle border glow effect */}
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-transparent"
            animate={{
              borderColor: isHovered
                ? "rgba(255, 255, 255, 0.3)"
                : "transparent",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>

      {/* Fullscreen modal */}
    </>
  );
};
// Enhanced Video Message Component
const EnhancedVideoMessage = ({
  index = 0,
  videoSrc = "/sample.mp4",
  alt = "video",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 30,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: index * 0.1 + 0.3,
        duration: 0.6,
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFullscreen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFullscreen(true);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <motion.div
        className="max-w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg bg-black">
          <video
            ref={videoRef}
            src={videoSrc}
            controls={isHovered}
            className="rounded-lg w-full h-auto max-w-xs sm:max-w-sm md:max-w-md max-h-60 sm:max-h-80 object-cover"
            onLoadedMetadata={() => {
              setIsLoaded(true);
              setDuration(videoRef.current?.duration || 0);
            }}
            onTimeUpdate={() => {
              setCurrentTime(videoRef.current?.currentTime || 0);
            }}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Play button overlay */}
          <AnimatePresence>
            {(!isPlaying || isHovered) && (
              <motion.div
                className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.button
                  className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg hover:bg-white transition-colors"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  onClick={handlePlay}
                >
                  {isPlaying ? (
                    <svg
                      className="w-8 h-8 text-gray-800"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-gray-800 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video duration */}
          {isLoaded && (
            <motion.div
              className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.8 }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </motion.div>
          )}

          {/* Video indicator */}
          {isPlaying && (
            <motion.div
              className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isLoaded ? 1 : 0, opacity: isLoaded ? 1 : 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

// Enhanced File Message Component
const EnhancedFileMessage = ({
  index = 0,
  fileName = "document.pdf",
  fileSize = "2.4 MB",
  fileType = "PDF",
  downloadUrl = "#",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const bytesToMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2); // Returns value in MB with 2 decimal places
  };

  const getFileIcon = (types) => {
    let type = "DEFAULT";

    // ================= PDF =================
    if (types.includes("pdf")) type = "PDF";
    // ================= DOC =================
    else if (types.includes("doc") || types.includes("docx")) type = "DOC";
    // ================= ZIP =================
    else if (types.includes("zip") || types.includes("rar")) type = "ZIP";

    // ================= ICONS =================
    const icons = {
      PDF: (
        <svg
          className="w-8 h-8 text-red-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V10H19v1h1.5v1.5H17.5V7H20.5v1.5zM9 9.5h1v-1H9v1z" />
        </svg>
      ),
      DOC: (
        <svg
          className="w-8 h-8 text-blue-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      ZIP: (
        <svg
          className="w-8 h-8 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,1L8,5H11V14H13V5H16M18,23H6C4.89,23 4,22.1 4,21V9C4,7.89 4.89,7 6,7H10V9H6V21H18V9H14V7H18C19.1,7 20,7.89 20,9V21C20,22.1 19.1,23 18,23Z" />
        </svg>
      ),
      DEFAULT: (
        <svg
          className="w-8 h-8 text-gray-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
    };

    return icons[type];
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 30,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: index * 0.1 + 0.3,
        duration: 0.6,
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    },
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDownloading(true);

    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false);
      // Add your actual download logic here
      window.open(downloadUrl, "_blank");
    }, 1000);
  };

  return (
    <motion.div
      className="max-w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer max-w-xs sm:max-w-sm"
        onClick={handleDownload}
      >
        <div className="flex items-center space-x-3">
          {/* File icon */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {getFileIcon(fileType)}
          </motion.div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <motion.p
              className="text-sm font-medium text-gray-900 dark:text-white truncate"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              {fileName}
            </motion.p>
            <motion.div
              className="flex items-center space-x-2 mt-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {bytesToMB(fileSize) + " MB"}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">
                {fileType}
              </span>
            </motion.div>
          </div>

          {/* Download button */}
          <motion.div
            className="flex-shrink-0"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: index * 0.1 + 0.7,
              type: "spring",
              stiffness: 400,
            }}
          >
            <motion.button
              className={`p-2 rounded-full transition-colors ${
                isDownloading
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <motion.svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </motion.svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Progress bar (shown during download) */}
        <AnimatePresence>
          {isDownloading && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-transparent"
          animate={{
            borderColor: isHovered ? "rgba(59, 130, 246, 0.3)" : "transparent",
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

// Demo showcasing all components
const Demo = (props) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {props?.msg?.type === "image" && (
        <EnhancedImageMessage msg={props?.msg} imageSrc={props?.msg?.message} setBigImages={props?.setBigImages} />
      )}
      {/* Video Component */}
      {props?.msg?.type === "video" && (
        <EnhancedVideoMessage
          index={0}
          videoSrc={props?.msg?.message}
          alt="Sample video"
        />
      )}

      {/* File Components */}

      {props?.msg?.type === "file" && (
        <EnhancedFileMessage
          index={0}
          fileName={props?.msg?.metadata?.fileName}
          fileSize={props?.msg?.metadata?.size}
          fileType={props?.msg?.metadata?.mimeType}
          downloadUrl={props?.msg?.message}
        />
      )}
    </div>
  );
};

export default Demo;
