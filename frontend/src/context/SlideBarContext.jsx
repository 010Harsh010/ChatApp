import {useState, createContext, Children } from "react";

const sideContext = createContext();
export default sideContext;

const SideProvider = ({children}) => {
    const [side, setSide] = useState(false);
    return (
        <sideContext.Provider value={{side, setSide}}>
            {children}
        </sideContext.Provider>
    )
};

export {SideProvider};