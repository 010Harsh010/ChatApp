import React from "react";
import Lottie from "lottie-react";
import eye from "../assets/eye.json";
import { useState, useRef } from "react";
import users from "../Server/user.js"
import { useNavigate } from "react-router-dom";
function Login() {
  const [visible, setvisible] = useState(false);
  const data = useRef();
  const password = useRef();
  const user = new users();
  const navigate = useNavigate();

  const submitLogin = async () => {
    if (data.current.value === "" || password.current.value === "") {
      alert("Please fill all the fields");
      return;
    }
    let body;
    if (data.current.value.includes("@")) {
        body = {
            email: data.current.value,
            password: password.current.value,
        }
    }else{
        body = {
            username: data.current.value,
            password: password.current.value,
        }
    }
    try {
      let res = await user.login(body);
      if (!res){
        throw new Error("Unable to login");
      }
      navigate("/home")
    } catch (error) {
      navigate("/login")
    }
  };
  return (
    <div className="h-[100vh] w-[100%] flex justify-center  items-center bg-black">
      <div className="h-[100%] w-[0] bg-black flex flex-col justify-center items-center sm:w-[100%] sm:h-[100vh]">

      </div>
      <div className="h-[100vh] w-[100vh] bg-black flex flex-col justify-center items-center">
        <div className="h-[90%] w-[80%] bg-black border-white border-2 rounded-4xl flex flex-col justify-center items-center">
          <div className="h-[20%] w-[80%] flex justify-center items-center">
            <h1 className="text-6xl text-blue-100 font-bold font-mono">
              Login
            </h1>
          </div>
          <div className="h-[70%] w-[90%] flex flex-col justify-center items-center">
            <div className="h-[90%] w-[100%]">
              <form>
                <div className="flex flex-col justify-center">
                  <label className="h-12 font-mono ml-4 w-[100%] text-3xl mb-3 bg-black flex flex-col text-blue-100 justify-center">
                    Username / Email
                  </label>
                  <input
                    ref={data}
                    className="h-12 w-[100%] focus:bg-gray-400 hover:bg-gray-200 font-mono rounded-4xl pl-6 text-1xl font-semibold  bg-blue-50"
                    type="text"
                  />
                </div>
                <div className="flex flex-col mt-4 justify-center">
                  <div className="h-12 flex flex-row justify-between items-center">
                    <label className="font-mono h-12 ml-4  text-3xl mb-3 bg-black flex flex-col text-blue-100 justify-center">
                      Password
                    </label>
                    <Lottie
                      onClick={() => {
                        setvisible(!visible);
                      }}
                      animationData={eye}
                      className="h-20 ml-0"
                    />
                  </div>
                  <input
                    ref={password}
                    className="h-12 w-[100%] font-mono rounded-4xl focus:bg-gray-400 hover:bg-gray-200 pl-6 text-1xl font-semibold bg-blue-50"
                    type={visible ? "text" : "password"}
                  />
                  <div className="w-[100%] flex justify-end items-center mb-4 mr-4">
                    <a className="text-blue-300 mr-3 font-medium cursor-pointer">
                      forget password ?
                    </a>
                  </div>
                </div>
              </form>
              <div className="h-10 w-[100%] flex justify-end items-center mt-4">
                <button
                  onClick={() => submitLogin()}
                  className="cursor-pointer rounded-4xl w-[100%] h-[100%] bg-blue-200 text-2xl font-mono"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
