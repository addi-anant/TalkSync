import io from "socket.io-client";
import { createContext, useEffect, useState } from "react";

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);
  const [account, setAccount] = useState(null);
  const [notification, setNotification] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineAccountList, setOnlineAccountList] = useState([]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setAccount(userInfo);
  }, []);

  /* Handling Socket.IO Connection: */
  useEffect(() => {
    const skt = io("http://localhost:8080");
    setSocket(skt);

    return () => {
      skt.off("disconnect");
    };
  }, [account]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        socket,
        account,
        setChats,
        setAccount,
        selectedChat,
        notification,
        setSelectedChat,
        setNotification,
        onlineAccountList,
        setOnlineAccountList,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
