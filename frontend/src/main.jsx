import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import { ModeProvider } from "./context/ModeContext.jsx";
import { SideProvider } from "./context/SlideBarContext.jsx";
import  SocketProvider  from "./context/SocketContext.jsx";
import { Provider } from "react-redux";
import Store from "./Store/store.js"
import Register from "./pages/Register.jsx";
import Setting from "./components/Setting.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register/>,
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
    <Provider store={Store}>
    <SocketProvider>
      <SideProvider>
        <ModeProvider>
          <RouterProvider router={router} />
        </ModeProvider>
      </SideProvider>
    </SocketProvider>
    </Provider>
);
