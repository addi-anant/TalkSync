import { Box, FormControl, Input, Text, Toast } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { ChatContext } from "../Context/ChatContext";
import { axiosBaseURL } from "../Config/axiosBaseURL";

const InputPanel = ({
  istyping,
  setFetchAgain,
  setMessages,
  socketConnected,
}) => {
  const [typing, setTyping] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { socket, account, selectedChat } = useContext(ChatContext);

  /* Send Message Logic: */
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat?._id);

      try {
        setNewMessage("");

        const { data } = await axiosBaseURL.post(
          "/message/send",
          {
            content: newMessage,
            chatID: selectedChat?._id,
          },
          {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${account?.token}`,
            },
          }
        );

        setFetchAgain((prev) => !prev);
        setMessages((prev) => [...prev, data]);
        socket.emit("new message", data);
      } catch (error) {
        Toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  /* Typing Animation Handler: */
  const typingHandler = (event) => {
    setNewMessage(event.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat?._id);
    }

    /* Kind of Throttle Function: */
    const timerLength = 3000;
    const lastTypingTime = new Date().getTime();
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        setTyping(false);
        socket.emit("stop typing", selectedChat?._id);
      }
    }, timerLength);
  };

  return (
    <>
      <Box height="6" mt={2}>
        <Text fontSize="14" ml={10}>
          {istyping && "Typing..."}
        </Text>
      </Box>
      <FormControl onKeyDown={sendMessage} id="first-name" isRequired mt={1}>
        <Input
          variant="filled"
          bg="#E0E0E0"
          value={newMessage}
          onChange={typingHandler}
          placeholder="Enter a message.."
          autoComplete="off"
        />
      </FormControl>
    </>
  );
};

export default InputPanel;
