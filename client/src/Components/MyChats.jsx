import { Button, Spinner } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/toast";
import { Box, Stack } from "@chakra-ui/layout";
import { useState, useEffect, useContext } from "react";

import ChatLoading from "./ChatLoading";
import GroupChatModal from "./GroupChatModal";
import { ChatContext } from "../Context/ChatContext";
import { axiosBaseURL } from "../Config/axiosBaseURL";
import IndividualChatName from "./IndividualChatName";

const MyChats = ({ fetchAgain }) => {
  const toast = useToast();
  const [loggedUser, setLoggedUser] = useState("");
  const { chats, socket, account, setChats, selectedChat } =
    useContext(ChatContext);

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
  }, [account, fetchAgain]);

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
              <IndividualChatName
                key={chat?._id}
                chat={chat}
                loggedUser={loggedUser}
              />
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
