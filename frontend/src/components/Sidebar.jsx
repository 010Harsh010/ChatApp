import React, { useState, useEffect,useContext } from 'react';
import { CiAt } from "react-icons/ci";
import { ImPencil } from "react-icons/im";
import { HiUserGroup } from "react-icons/hi2";
import { CiUser } from "react-icons/ci";
import { SiDarkreader } from "react-icons/si";
import { MdNotifications } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import users from "../Server/user.js";
import {motion,AnimatePresence} from "motion/react";
import { setSlide } from "../context/user/userSlice.js";
import { useDispatch, useSelector } from "react-redux";
import sideContext from "../context/SlideBarContext.jsx";
import {setSearchFriend} from "../context/user/friendSlice.js";

const Sidebar = (props) => {
  const Server = new users();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const {setSide} = useContext(sideContext);
  

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  function setnewState(x) {
    setSide(false);
    dispatch(setSlide(x));
  }

  async function LogOut() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    await Server.logout();
    window.location.reload();
  }

  const menuItems = [
    {
      id: 0,
      icon: CiAt,
      label: "Messages",
      onClick: () => setnewState(0),
      color: "text-orange-400"
    },
    {
      id: 1,
      icon: MdNotifications,
      label: "Notifications",
      onClick: () => setnewState(1),
      color: "text-blue-400"
    },
    {
      id: 2,
      icon: ImPencil,
      label: "Search Users",
      onClick: () => {
        dispatch(setSearchFriend(""));
        setnewState(2)},
      color: "text-green-400"
    },
    {
      id: 3,
      icon: HiUserGroup,
      label: "New Group",
      onClick: () => setnewState(3),
      color: "text-purple-400"
    },
    {
      id: 4,
      icon: SiDarkreader,
      label: "Dark Mode",
      onClick: () => setnewState(4),
      color: "text-yellow-400"
    },
    {
      id: 5,
      icon: CiUser,
      label: "Sign Out",
      onClick: LogOut,
      color: "text-red-400"
    }
  ];

  const sidebarVariants = {
    expanded: {
      width: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    collapsed: {
      width: "80px",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const tooltipVariants = {
    hidden: {
      opacity: 0,
      x: -10,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className='h-full shadow-2xl p-4 bg-[#1a1d21] relative overflow-hidden z-50 '
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      initial={false}
    >
      {/* Background Gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#1a1d21] via-[#1f2329] to-[#1a1d21] opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
      />
      
      {/* Toggle Button (Desktop only) */}
      {!isMobile && (
        <motion.button
          className="absolute top-4 right-2 z-10 p-1 rounded-full bg-[#272A30] text-white hover:bg-[#373B41] transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <IoIosArrowBack size={16} />
          </motion.div>
        </motion.button>
      )}

      {/* User Profile Section */}
      <motion.div 
        className='h-[20%] w-full flex flex-row items-center relative z-10'
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div 
          className={`h-full flex-shrink-0 ${isCollapsed ? 'w-full' : 'w-[25%]'} flex justify-center items-center`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.img 
            src={user?.avatar} 
             onClick={() => {
                  dispatch(setSearchFriend(String(user?._id)));
                  props?.dissmiss?.();
                  setnewState(2)}}
            alt="avatar"  
            className={`object-cover rounded-full border-2 border-blue-500/50 ${
              isCollapsed ? 'h-12 w-12' : 'h-full w-full p-2'
            }`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.3, 
              type: "spring",
              stiffness: 200 
            }}
          />
        </motion.div>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              className='h-full flex-1 flex justify-start pl-3 items-center'
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
             
            >
              <motion.h1 
                className='text-2xl md:text-3xl text-white font-semibold cursor-pointer hover:text-blue-400 transition-colors truncate'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                 onClick={() => {
                  dispatch(setSearchFriend(String(user?._id)));
                  setnewState(2)}}
              >
                {user?.fullname}
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Menu Items */}
      <motion.div 
        className='h-[80%] w-full flex flex-col justify-center items-center gap-2 relative z-10'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            className={`relative h-[18%] w-full rounded-2xl hover:bg-[#272A30] flex flex-row cursor-pointer group ${
              isCollapsed ? 'justify-center' : ''
            }`}
            onClick={item.onClick}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.5 + index * 0.1,
              type: "spring",
              stiffness: 100 
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "rgba(39, 42, 48, 0.8)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Icon */}
            <motion.div 
              className={`${isCollapsed ? 'w-full' : 'w-[20%]'} h-full flex justify-center items-center`}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{
                  color: hoveredItem === item.id ? item.color.replace('text-', '#') : '#ffffff'
                }}
                transition={{ duration: 0.3 }}
              >
                <item.icon size={25} />
              </motion.div>
            </motion.div>
            
            {/* Label */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  className='w-[80%] h-full flex justify-start pl-2 items-center'
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  <motion.h1 
                    className='text-white font-medium text-lg md:text-xl truncate group-hover:text-blue-300 transition-colors'
                    animate={{
                      color: hoveredItem === item.id ? item.color.replace('text-', '#') : '#ffffff'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.label}
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            <AnimatePresence>
              {isCollapsed && hoveredItem === item.id && (
                <motion.div
                  className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-[#272A30] text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50"
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#272A30]" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover effect overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ opacity: 0 }}
              whileHover={{ 
                opacity: 1,
                background: `linear-gradient(45deg, ${item.color.replace('text-', 'rgba(')}20, transparent)`
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Decorative Elements */}
      {/* <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-purple-500 to-pink-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 1 }}
      /> */}
      
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-gray-200"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      />
    </motion.div>
  );
}

export default Sidebar;