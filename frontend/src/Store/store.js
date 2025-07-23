import {configureStore} from '@reduxjs/toolkit';
import userReducer from '../context/user/userSlice.js';
import friendReducer from "../context/user/friendSlice.js"
const Store = configureStore({
    reducer: {
        user: userReducer,
        friend: friendReducer
    }
});

export default Store;
