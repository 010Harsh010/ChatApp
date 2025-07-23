import { createContext } from "react";
import { useState } from "react";
const ModeContext = createContext();
export default ModeContext;

const ModeProvider = ({ children }) => {
    const [mode, setMode] = useState("light");
    return (
        <ModeContext.Provider value={{ mode, setMode }}>
            {children}
        </ModeContext.Provider>
    );
};

export { ModeProvider };
