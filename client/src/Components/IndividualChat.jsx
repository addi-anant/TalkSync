import "./styles.css";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FormControl } from "@chakra-ui/form-control";
import { getOtherUser, getSender, getSenderFull } from "../Config/ChatLogics";
import { IconButton, Image, Spinner, useToast } from "@chakra-ui/react";

import TalkSync from "../TalkSync.png";

import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import { ChatContext } from "../Context/ChatContext";
import { axiosBaseURL } from "../Config/axiosBaseURL";
import { useEffect, useState, useContext } from "react";
import UpdateGroupChatModal from "./UpdateGroupChatModal";

let selectedChatCompare;

const IndividualChat = ({ fetchAgain, setFetchAgain }) => {
  const toast = useToast();

  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const {
    socket,
    account,
    selectedChat,
    notification,
    setSelectedChat,
    setNotification,
    onlineAccountList,
    setOnlineAccountList,
  } = useContext(ChatContext);

  /* Socket.io Handling: */
  useEffect(() => {
    socket.emit("setup", account);

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("connected", () => setSocketConnected(true));
    socket.on("online-account-list", (onlineAccountInfo) =>
      setOnlineAccountList(onlineAccountInfo)
    );

    return () => {
      socket.off("typing");
      socket.off("stop typing");
      socket.off("coffnected");
      socket.on("online-account-list");
    };

    // eslint-disable-next-line
  }, [socket, account]);

  /* Fetch Message upon chat selection: */
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const { data } = await axiosBaseURL.get(
        `/message/fetch-all/${selectedChat?._id}`,
        {
          headers: {
            Authorization: `Bearer ${account?.token}`,
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

  /* Logic to Fetch Specific Chat Info upon selection: */
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;

    // eslint-disable-next-line
  }, [selectedChat]);

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

        setFetchAgain(!fetchAgain);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
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

  /* Realtime Recieve Message Logic: */
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        /* If No Chat is Selected or When the selectedChat !== Chat for which the New Message is, Then Only Display Notification. */
        !selectedChatCompare ||
        selectedChatCompare?._id !== newMessageRecieved?.chat?._id
      ) {
        if (!notification?.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  }); /* No dependency [] -> Will be Fired Everytime any state changes in our App.  */

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
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center">
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  <Box display="flex" style={{ position: "relative" }}>
                    {getSender(account, selectedChat?.users)}
                    {onlineAccountList?.some(
                      (acc) =>
                        acc === getOtherUser(account, selectedChat?.users)
                    ) && (
                      <Box
                        style={{
                          height: "10px",
                          width: "10px",
                          backgroundColor: "#54B435",
                          borderRadius: "100%",
                          position: "absolute",
                          top: "18px",
                          right: "-14px",
                        }}></Box>
                    )}
                  </Box>

                  <ProfileModal
                    user={getSenderFull(account, selectedChat?.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}

                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    fetchMessages={fetchMessages}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Box>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden">
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            {/* style={{ border: "1px solid black" }} */}
            <Box height="6" mt={2}>
              <Text fontSize="14" ml={10}>
                {istyping && "Typing..."}
              </Text>
            </Box>
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={1}>
              <Input
                variant="filled"
                bg="#E0E0E0"
                value={newMessage}
                onChange={typingHandler}
                placeholder="Enter a message.."
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%">
          <Box fontSize="3xl" pb={3} fontFamily="Work sans">
            <Box boxSize="sm">
              <Image src={TalkSync} alt="TalkSync Inc." />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default IndividualChat;
