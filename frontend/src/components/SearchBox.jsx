import React, { useEffect, useState, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosPeople } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { IoIosPersonAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import Users from "../Server/user.js";
import { IoMdSettings } from "react-icons/io";
import { setSlide } from "../context/user/userSlice.js";
import { useDispatch } from "react-redux";
import { IoIosAdd } from "react-icons/io";

const SearchBox = (props) => {
  const ids = useSelector((state) => state.friend.searchFriend);
  const owner = useSelector((state) => state.user.user?._id);
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const [loading, setLoading] = useState(true);
  const postRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null); // holds image src
  const [fileToUpload, setFileToUpload] = useState(null);
  // const [requested,]
  const user = new Users();

const postImage = async () => {
  if (!fileToUpload) {
    console.error("No image selected for upload.");
    return;
  }

  const formData = new FormData();
  formData.append("post", fileToUpload);

  try {
    const response = await user.postImage(formData); // your API call

    setImagePreview(null);
    setFileToUpload(null);
    postRef.current.value = ""; // clear input field

    setData((prevData) => ({
      ...prevData,
      gallery: [response.imageUrl, ...prevData.gallery],
    }));
  } catch (error) {
    console.error("Error uploading image:", error.message);
  }
};


  useEffect(() => {
    setLoading(true);
    const getData = async () => {
      try {
        const res = await user.getUserDetails({ id: ids });
        setData(res[0]);
        console.log(res[0]);

        const response = await user.isFollowed({ id: ids });
        setFollowed(response.isFollowing);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
    const timer = setTimeout(() => {
      getData();
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [ids]);

  const toggleFollow = async () => {
    try {
      const userId = data?._id;
      if (!userId) {
        return;
      }
      if (followed) {
        const response = await user.unfollow({ id: data?._id });
        setFollowed(false);
        setData((prevData) => ({
          ...prevData,
          Following: prevData.Following - 1,
        }));
      } else {
        const response = await user.sendRequest({ userId });
        // setFollowed(true);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const avatarVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-gray-1100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data && !ids) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-gray-950">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          No user found
        </motion.p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${
        props?.isMobile ? "min-h-screen" : "h-[100%]"
      } w-full bg-gray-1100 flex flex-col`}
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="relative h-48 sm:h-60 md:h-72 lg:h-80 w-full bg-gradient-to-b from-gray-700 to-gray-1000"
      >
        {/* Cover Image */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            src={data?.banner}
            className="w-full h-full object-cover opacity-30"
            alt="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        {/* Profile Avatar - Positioned to overlap */}
        <motion.div
          variants={avatarVariants}
          whileHover="hover"
          className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8 z-10"
        >
          <div className="relative">
            <img
              src={data?.avatar}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-gray-900 object-cover shadow-xl"
              alt="avatar"
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="absolute bottom-0 right-4 sm:right-8 flex">
          {["gallery", "tagged"].map((tab) => (
            <motion.button
              key={tab}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium capitalize transition-all ${
                activeTab === tab
                  ? "text-white border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 mt-12 sm:mt-16">
        {/* Profile Info Sidebar */}
        <motion.div variants={itemVariants} className="w-full lg:w-80 xl:w-96">
          <div className="bg-gray-900/20 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 shadow-2xl">
            {/* User Info */}
            <motion.div variants={itemVariants} className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold flex flex-row justify-between align-middle text-white mb-1">
                {data?.fullname}
                <IoMdSettings
                  color="white"
                  className="cursor-pointer"
                  onClick={() => {
                    dispatch(setSlide(5));
                  }}
                />
              </h1>
              <p className="text-gray-400 text-sm sm:text-base mb-4">
                {data?.username}
              </p>

              {/* Follow Button */}
              {owner !== ids && (
                <div className="flex items-center gap-3">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={toggleFollow}
                    className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
                      followed
                        ? "bg-gray-600 hover:bg-gray-700 text-white border border-gray-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    }`}
                  >
                    {followed ? "Following" : "Follow"}
                  </motion.button>

                  <AnimatePresence>
                    {!followed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <IoIosPersonAdd className="text-white" size={24} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="mb-6">
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {data?.description}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                <IoIosPeople className="text-blue-400" size={24} />
                <span className="font-bold text-white">
                  {data?.Following?.toLocaleString()}
                </span>
                <span className="text-gray-400">Following</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                <MdEmail className="text-green-400" size={24} />
                <span className="text-white text-sm sm:text-base break-all">
                  {data?.email}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div variants={itemVariants} className="flex-1">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800 h-64 sm:h-80 lg:h-96 overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-hidden p-4 hide-scrollbar">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="h-full"
              >
                
                {data?.gallery?.length > 0 && (
                  <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-3">
                    <motion.div
                      className="break-inside-avoid mb-2 sm:mb-3"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {!imagePreview ? (
                        <motion.div>
                          <motion.label
                            htmlFor="file-upload"
                            className="w-full h-24 sm:h-32 md:h-40 lg:h-48 flex items-center justify-center bg-gray-800 rounded-lg cursor-pointer relative overflow-hidden"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IoIosAdd
                              size={20}
                              className="w-full h-full text-2xs text-gray-400 rounded-lg object-cover shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                              onClick={() => {}}
                            />
                          </motion.label>
                          <motion.input
                            ref={postRef}
                            className="hidden"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                postRef.current = file;
                                setImagePreview(URL.createObjectURL(file));
                                setFileToUpload(file); // Store the file for upload
                              }
                            }}
                            id="file-upload"
                            name="file-upload"
                            multiple
                            style={{ display: "none" }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div>
                          <img
                            src={imagePreview}
                            alt="post"
                            className="h-[85%] rounded-2xl"
                          />
                          <div
                            className="flex w-full flex-row justify-between align-middle"
                            onClick={() => {
                              setImagePreview(null);
                              postRef.current = null;
                            }}
                          >
                            <motion.button className="text-amber-50 w-full bg-black cursor-pointer  h-[15%] z-10 flex justify-center align-middle">
                              Cancel
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                postImage();
                              }}
                              className="text-amber-50 bg-black w-full cursor-pointer  h-[15%] z-10 flex justify-center align-middle"
                            >
                              POST
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  
                    {data?.gallery?.map((img, index) => (
                      <motion.div
                        key={index}
                        className="break-inside-avoid mb-2 sm:mb-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img
                          src={img}
                          alt={`Photo ${index + 1}`}
                          className="w-full rounded-lg object-cover shadow-lg hover:shadow-xl transition-shadow duration-300"
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchBox;
