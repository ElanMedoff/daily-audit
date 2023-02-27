import {
  createContext,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "#comps/Navbar";
import Home from "#src/comps/Home";
import Log from "#comps/Log";
import Report from "#comps/Report";
import { wrapperStyle } from "./App.css";

interface GlobalState {
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}
export const GlobalStateContext = createContext<GlobalState | null>(null);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const globalState = useMemo(
    () => ({ isLoggedIn, setIsLoggedIn }),
    [isLoggedIn]
  );

  return (
    <GlobalStateContext.Provider value={globalState}>
      <div className={wrapperStyle}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/report" element={<Report />}></Route>
            <Route path="/log" element={<Log />}></Route>
          </Routes>
        </Router>
      </div>
    </GlobalStateContext.Provider>
  );
}

export default App;
