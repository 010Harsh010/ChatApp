import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import userAuth from "./Server/user.js";
import { useDispatch } from 'react-redux';
import {setUser}  from './context/user/userSlice.js';

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = new userAuth();

  useEffect(() => {
  const checkUser = async () => {
    try {
      const res = await user.currentUser();
      dispatch(setUser(res.user));
      navigate("/home");
    } catch (error) {
      if (window.location.pathname === "/register") {
        navigate("/register");
        return;
      }
      navigate("/login");
    }
  };

  checkUser();
}, []);


  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
