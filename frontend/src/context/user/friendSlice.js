import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    friend: null,
    data: null,
    messages : [],
    roomId : null,
    isOnline: false,
    searchFriend:  sessionStorage.getItem("searchId") || null,
}

const friendSlice = createSlice({
    name : "friend",
    initialState,
    reducers : {
        setFriend(state, action) {
            state.friend = action.payload;
        },
        setData(state, action) {
            state.data = action.payload;
        },
        setMessages(state, action) {
            state.messages.push(action.payload);
        },
        setRoomId(state,action){
            state.roomId = action.payload;
        },
        setSearchFriend(state,action){
            state.searchFriend = action.payload;
            sessionStorage.setItem("searchId",action.payload);
        },
        initilizeMessages(state){
            state.messages = [];
        },
        setFirstMessages(state,action){
            state.messages = action.payload
        },
        updateMessagesStatus(state, action) {
            state.messages = state.messages.map(msg =>
                msg.sender === action.payload && msg.status !== "seen"
                    ? { ...msg, status: "seen" }
                    : msg
            );
        },
        setOnlineStatus(state, action) {
            state.isOnline = action.payload;
        }
        
    }
})

export const {setOnlineStatus,updateMessagesStatus,setFriend,setFirstMessages,setData,setMessages,setRoomId,setSearchFriend ,initilizeMessages} = friendSlice.actions;
export const selectFriend = state =>  state.friend.friend;

export default friendSlice.reducer;