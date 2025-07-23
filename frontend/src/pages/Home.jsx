import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import Chartcard from "../components/Chartcard";
import Chatbox from "../components/Chatbox";
import { useContext } from "react";
import sideContext from "../context/SlideBarContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { SocketContext } from "../context/SocketContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import NotificationCard from "../components/NotificationCard.jsx";
import Users from "../Server/user.js";
import Searchlist from "../components/Searchlist.jsx";
import SearchBox from "../components/SearchBox.jsx";
import { setRoomId } from "../context/user/friendSlice.js";
import { motion } from "motion/react";
import { setSlide } from "../context/user/userSlice.js";
import Loader from "../components/Loader.jsx";
import NoFriendsFound from "../components/NoFriendsFound.jsx";
import Setting from "../components/Setting.jsx";
function Home() {
  const users = new Users();
  const online = new Map();
  const dispatch = useDispatch();
  const { side, setSide } = useContext(sideContext);
  const { socket } = useContext(SocketContext);
  const user = useSelector((state) => state.user.user);
  const [connections, setConnections] = useState([]);
  const slide = useSelector((state) => state.user.slide);
  const [notifi, setNotifi] = useState([]);
  const [search, setSearch] = useState([]);
  const [usename, setUsename] = useState("");
  const [leftWidth, setLeftWidth] = useState(30); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [isOnlineMap, setIsOnlineMap] = useState(new Map());
  // for the resize window
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileWidth, setMobileWidth] = useState(100);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, []);

  {
    /* 
    Notification 
  */
  }
  useEffect(() => {
    socket.on("friendRequest", (data) => {
      console.log("Notification data", data);
      setNotifi((prevNotifi) => [data, ...prevNotifi]);
    });
    socket.on("AcceptRequest", (data) => {
      console.log(data);

      setNotifi((prev) => [data, ...prev]);
    });
    return () => {
      socket.off("notification");
      socket.off("AcceptRequest");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("userconnected", ({ id }) => {
      // console.log("User connected:", id);
      setIsOnlineMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(id, true);
        return newMap;
      });
    });
    return () => {
      socket.off("userconnected");
    };
  }, [socket]);

  {
    /* 
    User disconnected/Connected
  */
  }
  useEffect(() => {
    const handleDisconnect = ({ id }) => {
      // alert("User disconnected");
      setIsOnlineMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(id, false);
        return newMap;
      });
    };
    socket.on("userdisconnected", handleDisconnect);
    return () => {
      socket.off("userdisconnected", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (connections.length === 0) return;

    const friendIds = connections.map((conn) => conn.friendId);
    socket.emit("checkOnlineBulk", friendIds);

    const handleBulkStatus = (statuses) => {
      const newMap = new Map();
      for (const [id, status] of Object.entries(statuses)) {
        newMap.set(id, status);
        console.log("Bulk status update:", id, status);
      }

      setIsOnlineMap(newMap); // now triggers re-render
      setIsLoading(false);
    };

    socket.on("bulkOnlineStatus", handleBulkStatus);

    return () => {
      socket.off("bulkOnlineStatus", handleBulkStatus);
    };
  }, [connections]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;

      // Constrain between 10% and 90%
      let constrainedPercentage;
      if (!isMobile) {
        constrainedPercentage = Math.max(5, Math.min(30, percentage));
      } else {
        constrainedPercentage = Math.max(0, Math.min(100, percentage));
        if (constrainedPercentage > 50) {
          setMobileNavOpen(true);
        } else {
          setMobileNavOpen(false);
        }
        setMobileWidth(constrainedPercentage);
      }
      setLeftWidth(constrainedPercentage);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isDragging, handleMouseMove, handleMouseUp, isMobile]);

  const rightWidth = 100 - leftWidth;

  useEffect(() => {
    if (!user?._id) {
      return;
    }
    socket.emit("join", { id: user._id });
  }, [user, socket]);

  useEffect(() => {
    const fetchConn = async () => {
      try {
        const res = await users.getConnections();
        console.log("Connections", res);
        if (res.length === 0) {
          setIsLoading(false);
          setConnections([]);
          return;
        }
        setConnections(res);
      } catch (error) {
        console.log("error", error);
      }
    };
    const fetchNotification = async () => {
      try {
        const res = await users.getNotification();
        console.log("notificaton", res);
        setNotifi(res);
      } catch (error) {
        console.log("noti error", error);
      }
    };
    fetchNotification();
    fetchConn();
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      if (usename === "") return setSearch([]);
      try {
        const res = await users.searchUser({
          username: usename,
        });
        setSearch(res);
        console.log("Search", res);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchSearch();
  }, [usename]);

  const deleteNotification = ({ id }) => {
    if (!id) return;
    setNotifi((prevNotifi) => prevNotifi.filter((data) => data._id !== id));
  };

  const dissmiss = () => {
    // dispatch(setSlide(3));
    if (isMobile) {
      setSide(false);
      setLeftWidth(0);
      setMobileNavOpen(false);
    }
  };

  // if (isLoading) {
  //   return (
  //     <Loader></Loader>
  //   );
  // }

  return (
    <div
      className={`h-[100vh] w-[100%] flex flex-row`}
      ref={containerRef}
      style={{
        userSelect: isDragging ? "none" : "auto",
        backgroundColor: "#080707",
      }}
    >
      <div
        className={`h-[100%] ${
          isMobile ? "fixed" : "relative"
        } z-10 transition-all duration-300 ease-in-out`}
        style={{
          width: isMobile ? `${leftWidth}%` : `${leftWidth}%`,
          backgroundColor: "#17191C",
          transform: isMobile
            ? mobileNavOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "none",
          opacity: isMobile ? (mobileNavOpen ? 1 : 0) : 1,
        }}
      >
        {/* search bar */}
        <div className="h-[8%] w-full flex flex-row p-2 justify-center items-center">
          <FaBars
            onClick={() => setSide((prev) => !prev)}
            className="text-white ml-2 cursor-pointer"
            size={30}
          />
          <div className="border-2 h-10 ml-4 mr-4 border-gray-600 w-full justify-center items-center p-1 flex flex-row rounded-4xl">
            <FaSearch
              className="text-gray-400 ml-2 cursor-pointer mt-1"
              size={20}
            />
            <input
              onChange={(e) => setUsename(e.target.value)}
              type="text"
              placeholder="Search"
              className="cursor-text border-none pl-4 text-1xl font-mono text-gray-400 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Sidebar */}
        {side && (
          <div className="h-[50%] w-[20%] fixed z-50 border-2 border-[#17191C] box-border  shadow-2xs bg-[#17191C] ml-2 rounded-2xl">
            <Sidebar dissmiss={dissmiss} />
          </div>
        )}
        {(slide === 0 || slide > 2) && !isLoading && (
          <div className="h-[92%] pt-1">
            {connections.length > 0 ? (
              connections.map((data, index) => {
                const isOnline = isOnlineMap.get(data.friendId) || false;
                const unseenCount = data?.messages?.reduce((acc, msg) => {
                  return acc + (((msg?.status === "unseen") && msg?.sender===data?.friendId) ? 1 : 0);
                }, 0);

                return (
                  <Chartcard
                    unseenCount={unseenCount}
                    data={data}
                    index={index}
                    dissmiss={dissmiss}
                    isOnline={isOnline}
                  />
                );
              })
            ) : (
              <NoFriendsFound />
            )}
          </div>
        )}
        {slide === 1 && (
          <div className="h-[92%] pt-1 z-0 overflow-scroll hide-scrollbar">
            {notifi.map((data, index) => {
              return (
                <NotificationCard
                  deleteNotification={deleteNotification}
                  data={data}
                  index={data._id}
                />
              );
            })}
          </div>
        )}
        {slide === 2 && (
          <div className="h-[92%] pt-1">
            <Searchlist data={search} dissmiss={dissmiss} />
          </div>
        )}
      </div>
      <div
        className={`h-full w-1 flex justify-center items-center cursor-col-resize hover:bg-gray-500 transition-colors ${
          isDragging ? "bg-gray-900" : "bg-gray-900"
        } opacity-0 hover:opacity-100`}
        onMouseDown={handleMouseDown}
      >
        <div className="w-1 h-8 bg-gray-900 rounded"></div>
      </div>

      {/* {
        alert(searchId)
      } */}
      <div
        className="h-[100%] z-0  flex justify-center items-center overflow-auto hide-scrollbar"
        style={{ width: `${isMobile ? 100 : rightWidth}%` }}
      >
        {slide < 2 && (
          <motion.div
            className="h-full w-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-white text-lg">Friend not found</div>
          </motion.div>
        )}
        {(slide > 2 && slide <4) && <Chatbox />}
        {slide > 4 && <Setting />}
        {slide === 2 && <SearchBox isMobile={isMobile} />}
      </div>
      {isMobile && mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-5"
          onClick={() => {
            setMobileNavOpen(false);
            setLeftWidth(0);
          }}
        />
      )}
    </div>
  );
}

export default Home;
