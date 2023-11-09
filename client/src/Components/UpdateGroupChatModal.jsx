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
  IconButton,
  Spinner,
} from "@chakra-ui/react";

import UserListItem from "./UserListItem";
import UserBadgeItem from "./UserBadgeItem";
import { ViewIcon } from "@chakra-ui/icons";
import { useState, useContext } from "react";
import { ChatContext } from "../Context/ChatContext";
import { axiosBaseURL } from "../Config/axiosBaseURL";

const UpdateGroupChatModal = ({ fetchMessages, setFetchAgain }) => {
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);

  const { account, selectedChat, setSelectedChat } = useContext(ChatContext);

  /* Search For Accounts: */
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
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });

      setLoading(false);
    }
  };

  /* Rename Group: */
  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);

      const { data } = await axiosBaseURL.put(
        `/chat/rename`,
        {
          chatID: selectedChat?._id,
          chatName: groupChatName,
        },
        {
          headers: {
            Authorization: `Bearer ${account?.token}`,
          },
        }
      );

      setSelectedChat(data);
      setRenameLoading(false);
      setFetchAgain((prev) => !prev);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }

    setGroupChatName("");
  };

  /* Add Account to Group: */
  const handleAddUser = async (member) => {
    if (selectedChat.users.find((user) => user?._id === member._id)) {
      toast({
        title: "The user is a part of the Group.!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat?.groupAdmin?._id !== account?._id) {
      toast({
        title: "Only admins can add new people!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosBaseURL.put(
        `/chat/add-to-group`,
        {
          userID: member?._id,
          chatID: selectedChat?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${account?.token}`,
          },
        }
      );

      setSearch("");
      setLoading(false);
      setSearchResult([]);
      setSelectedChat(data);
      setFetchAgain((prev) => !prev);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  /* Remove Account From Group: */
  const handleRemove = async (member) => {
    if (selectedChat?.groupAdmin?._id === member?._id) {
      toast({
        title: `${member?.name} is the Admin of the Group.`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (
      selectedChat?.groupAdmin?._id !== account?._id &&
      member?._id !== account?._id
    ) {
      toast({
        title: "Only Admin can remove users!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);

      const { data } = await axiosBaseURL.put(
        `/chat/remove-from-group`,
        {
          userID: member?._id,
          chatID: selectedChat?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${account?.token}`,
          },
        }
      );

      member?._id === account?._id
        ? setSelectedChat("")
        : setSelectedChat(data);

      fetchMessages();
      setLoading(false);
      setFetchAgain((prev) => !prev);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured!",
        description: error?.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setLoading(false);
    }

    setGroupChatName("");
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center">
            {selectedChat?.chatName}
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat?.users.map((user) => (
                <UserBadgeItem
                  key={user?._id}
                  user={user}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(user)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}>
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => handleRemove(account)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
