import {io} from "socket.io-client";
import React,{useEffect,createContext} from "react";
import { useSelector } from "react-redux";

export const SocketContext = createContext(null);
const socket = io("http://localhost:4000");

const SocketProvider = ({children}) => {
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('disconnect' , () => {
            console.log('Disconnected from server');
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [socket]);
    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )
};
export default SocketProvider;