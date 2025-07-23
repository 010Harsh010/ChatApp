import React, { useEffect, useContext, useState } from "react";
import { BiSolidVolumeMute } from "react-icons/bi";
import { formatTimeAgo } from "../converter.js";
import { useDispatch } from "react-redux";
import {
  setFriend,
  setFirstMessages,
  setData,
  setMessages,
  setRoomId,
  initilizeMessages,
} from "../context/user/friendSlice.js";
import { setSlide } from "../context/user/userSlice.js";
import { SocketContext } from "../context/SocketContext.jsx";
import { setOnlineStatus } from "../context/user/friendSlice.js";

const Chartcard = (props) => {
  console.log("Chartcard props", props?.unseenCount);

  const { socket } = useContext(SocketContext);
  const dispatch = useDispatch();
  function checkLength(message) {
    const n = message.length;
    if (n < 10) {
      return message;
    } else {
      return message.substring(0, 10) + "...";
    }
  }

  const setFriendData = () => {
    dispatch(initilizeMessages());
    dispatch(setOnlineStatus(props?.isOnline));
    dispatch(setFriend(props?.data?.friendId));
    dispatch(setData(props?.data?.conn));
    dispatch(setRoomId(props?.data?.room));
    dispatch(setSlide(3));
  };
  return (
    <div
      key={props?.index}
      onClick={() => {
        setFriendData();
        props?.dissmiss();
      }}
      className="w-full hover:bg-[#272A30] hover:rounded-2xl h-[72px] m-1 flex flex-row justify-center items-center"
    >
      <div className="h-[100%] flex justify-center items-center w-[17%] rounded-full">
        <img
          src={props?.data?.conn?.avatar}
          className={`${
            props?.isOnline ? "border-2 border-green-600" : ""
          } object-cover h-[49px] w-[49px] rounded-full`}
          alt="avatar"
        />
      </div>
      <div className="h-[44px] w-[83%]">
        <div className="h-[50%] w-full flex flex-row justify-center items-center">
          <div className="w-[80%]">
            <h1 className="text-1xl font-semibold text-white">
              {props?.data?.conn?.fullname}
            </h1>
          </div>
          <div className="w-[20%]  flex justify-end mr-6 items-center">
            {props?.data?.conn?.muted ? (
              <BiSolidVolumeMute className="text-gray-100" size={22} />
            ) : props?.data?.messages?.length > 0 && props?.unseenCount > 0 ? (
              <div className="bg-gray-200 w-10 h-5 flex justify-center items-center rounded-4xl">
                <h1 className="text-black font-extrabold">{props.unseenCount}</h1>
              </div>
            ) : null}
          </div>
        </div>
        <div className="h-[50%] w-full flex flex-row justify-center items-center">
          <div className="w-[70%]">
            <p className="text-sm text-gray-400">
              {props?.data?.message
                ? checkLength(props?.data?.message)
                : "Say hii  to chat !!!"}
            </p>
          </div>
          <div className="w-[30%] flex  justify-end mr-4 ">
            <p className="text-sm text-gray-400">
              {props?.isOnline
                ? ""
                : formatTimeAgo(props?.data?.conn?.lastSeen)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chartcard;
