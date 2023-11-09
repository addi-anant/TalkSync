import "./styles.css";
import { Box } from "@chakra-ui/layout";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getOtherUser, getSender, getSenderFull } from "../Config/ChatLogics";
import { IconButton, Image, Spinner, useToast } from "@chakra-ui/react";

import TalkSync from "../TalkSync.png";

import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import { ChatContext } from "../Context/ChatContext";
import { axiosBaseURL } from "../Config/axiosBaseURL";
import { useEffect, useState, useContext } from "react";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import InputPanel from "./InputPanel";

let selectedChatCompare;

const IndividualChat = ({ setFetchAgain }) => {
  const toast = useToast();

  // const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  // const [newMessage, setNewMessage] = useState("");
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
        `/message/fetch/${selectedChat?._id}`,
        {
          headers: {
            Authorization: `Bearer ${account?.token}`,
          },
        }
      );

      if (data.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(false);
      setMessages(data);

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
    setMessages([]);
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  /* Realtime Recieve Message Logic: */
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        /* If No Chat is Selected or When the selectedChat !== Chat for which the New Message is, Then Only Display Notification. */
        !selectedChatCompare ||
        selectedChatCompare?._id !== newMessageRecieved?.chatID?._id
      ) {
        if (!notification?.includes(newMessageRecieved)) {
          setNotification((prev) => [newMessageRecieved, ...prev]);
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }

      setFetchAgain((prev) => !prev);
    });

    // eslint-disable-next-line
  }, []);

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
            <InputPanel
              istyping={istyping}
              setFetchAgain={setFetchAgain}
              setMessages={setMessages}
              socketConnected={socketConnected}
            />
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
