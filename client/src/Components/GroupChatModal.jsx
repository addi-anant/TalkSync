import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
} from "@chakra-ui/react";

import UserListItem from "./UserListItem";
import UserBadgeItem from "./UserBadgeItem";
import { useState, useContext } from "react";
import { axiosBaseURL } from "../Config/axiosBaseURL";
import { ChatContext } from "../Context/ChatContext";

const GroupChatModal = ({ children }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { account, chats, socket, setChats } = useContext(ChatContext);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupChatName, setGroupChatName] = useState();
  const [searchResult, setSearchResult] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  /* Add user to the set of Group Members: */
  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "user already part of the group.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  /* Search people: */
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const { data } = await axiosBaseURL.get(
        `/user/get-all-user?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${account?.token}`,
          },
        }
      );

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  /* Remove user from Group: */
  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  /* Create Group Handler: */
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "All Fields are required.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const { data } = await axiosBaseURL.post(
        `/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((user) => user?._id)),
        },
        {
          headers: {
            Authorization: `Bearer ${account?.token}`,
          },
        }
      );

      socket.emit("new-chat-initiated", {
        chatInfo: data,
        account: account?._id,
      });

      setChats([data, ...chats]);
      onClose();

      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center">
            Create Group Chat
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add People eg: John, Piyush, Jane"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((user) => (
                <UserBadgeItem
                  key={user?._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>

            {loading
              ? "Loading"
              : searchResult
                  ?.slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleGroup(user)}
                    />
                  ))}
          </ModalBody>

          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
