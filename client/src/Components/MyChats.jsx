import { Button, Spinner } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/toast";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useState, useEffect, useContext } from "react";

import ChatLoading from "./ChatLoading";
import GroupChatModal from "./GroupChatModal";
import NotificationBadge from "./NotificationBadge";
import { ChatContext } from "../Context/ChatContext";
import { axiosBaseURL } from "../Config/axiosBaseURL";
import { getOtherUser, getSender } from "../Config/ChatLogics";

const MyChats = ({ fetchAgain }) => {
  const toast = useToast();
  const [loggedUser, setLoggedUser] = useState("");
  const {
    chats,
    socket,
    account,
    setChats,
    selectedChat,
    notification,
    setSelectedChat,
    setNotification,
    onlineAccountList,
  } = useContext(ChatContext);

  /* Fetch All Chat For Logged In Account: */
  const fetchChats = async () => {
    try {
      const { data } = await axiosBaseURL.get("/chat", {
        headers: {
          Authorization: `Bearer ${account?.token}`,
        },
      });

      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  /* New Chat Creation Logic: */
  useEffect(() => {
    socket.on("new-chat-formed", () => {
      fetchChats();
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [account]);

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px">
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center">
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}>
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        borderRadius="lg"
        overflowY="hidden">
        {chats ? (
          <Stack overflowY="scroll">
            {chats.length === 0 && (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            )}
            {chats.map((chat) => (
              <Box
                style={{ position: "relative" }}
                onClick={() => {
                  setSelectedChat(chat);
                  setNotification(
                    notification?.filter(
                      (notif) => chat?._id !== notif?.chatID?._id
                    )
                  );
                }}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                display="flex"
                justifyContent="space-between"
                alignItems="end">
                <Box w="100%" style={{ position: "relative" }}>
                  <Box>
                    <Text>
                      <>
                        {!chat?.isGroupChat
                          ? getSender(loggedUser, chat?.users)
                          : chat?.chatName}
                      </>
                    </Text>

                    {chat?.latestMessage ? (
                      <Text fontSize="xs">
                        <b>{chat?.latestMessage?.sender?.name} : </b>
                        {chat?.latestMessage?.content?.length > 50
                          ? chat?.latestMessage?.content?.substring(0, 51) +
                            "..."
                          : chat?.latestMessage?.content}
                      </Text>
                    ) : (
                      "Start a Conversation..."
                    )}
                  </Box>

                  {/* Online Status: */}
                  {!chat?.isGroupChat &&
                    onlineAccountList?.some(
                      (acc) => acc === getOtherUser(account, chat?.users)
                    ) && (
                      <Box
                        style={{
                          height: "10px",
                          width: "10px",
                          backgroundColor: "#54B435",
                          borderRadius: "100%",
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                        }}></Box>
                    )}
                </Box>

                {/* Count of the notification: */}
                {notification?.reduce((count, notif) => {
                  count = count + (notif?.chatID?._id === chat?._id ? 1 : 0);
                  return count;
                }, 0) ? (
                  <NotificationBadge
                    value={notification?.reduce((count, notif) => {
                      count =
                        count + (notif?.chatID?._id === chat?._id ? 1 : 0);
                      return count;
                    }, 0)}
                  />
                ) : (
                  <></>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
