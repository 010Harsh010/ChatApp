import React from "react";
import { useDispatch } from "react-redux";
import {setSearchFriend} from "../context/user/friendSlice.js";
const Searchlist = (props) => {
  const dispatch = useDispatch();
  return (
    <div className="h-full flex flex-col w-full">
      {props?.data?.map((item, index) => (
        <div
          key={index}
          onClick={() => {
              dispatch(setSearchFriend(String(item?._id)));
              props?.dissmiss?.();
          }}
          className="w-full hover:bg-[#272A30] hover:rounded-2xl h-[72px] m-1 flex flex-row justify-center items-center"
        >
          <div className="h-[100%] flex justify-center items-center w-[17%] rounded-full">
            <img
              src={item?.avatar}
              className="object-cover h-[49px] w-[49px] rounded-full"
              alt="avatar"
            />
          </div>
          <div className="h-[44px] w-[83%] pl-2">
            <div className="h-[50%] w-full flex flex-row justify-start items-center">
              <h1 className="text-1xl font-semibold text-white">
                {item.fullname}
              </h1>
            </div>
            <div className="h-[50%] w-full flex flex-row justify-start items-center">
              <p className="text-sm text-gray-400">{item.username}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Searchlist;
