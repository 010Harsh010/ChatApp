import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    slide : 0,
    socketId: "",
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setSocketId: (state,action) => {
            state.socketId = action.payload
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setSlide: (state,action) => {
            state.slide = action.payload;
        }
    },
});

export const { setUser,setSlide,setSocketId } = userSlice.actions;
export const selectUser = state => state.user.user;

export default userSlice.reducer;
