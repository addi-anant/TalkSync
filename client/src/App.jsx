import "./App.css";
import Home from "./Pages/Home";
import Chat from "./Pages/Chat";
import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { ChatContext } from "./Context/ChatContext";

const App = () => {
  const { account } = useContext(ChatContext);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={!account ? <Home /> : <Chat />} />
        <Route path="/chat" element={account ? <Chat /> : <Home />} />
      </Routes>
    </div>
  );
};

export default App;
