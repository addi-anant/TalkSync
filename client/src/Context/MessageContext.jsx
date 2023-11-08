import { createContext, useState } from "react";
import { axiosBaseURL } from "../Config/axiosBaseURL";

export const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  /* Fetch Message upon chat selection: */
  const fetchMessages = async (
    selectedChat,
    setLoading,
    token,
    setMessages,
    socket,
    toast
  ) => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const { data } = await axiosBaseURL.get(
        `/message/fetch-all/${selectedChat?._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat?._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const [hasMoreMessages, setHasMoreMessages] = useState();

  <MessageContext.Provider
    // value={{ fetchMessages, hasMoreMessages, setHasMoreMessages }}>
    value={{}}>
    {children}
  </MessageContext.Provider>;
};

export default MessageProvider;
