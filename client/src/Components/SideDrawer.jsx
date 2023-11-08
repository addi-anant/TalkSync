import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Input } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import { Avatar } from "@chakra-ui/avatar";
import { useToast } from "@chakra-ui/toast";
import { Spinner } from "@chakra-ui/spinner";
import { Tooltip } from "@chakra-ui/tooltip";
import { Box, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/hooks";
import { ChevronDownIcon } from "@chakra-ui/icons";

import ChatLoading from "./ChatLoading";
import ProfileModal from "./ProfileModal";
import UserListItem from "./UserListItem";

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../Context/ChatContext";
import { axiosBaseURL } from "../Config/axiosBaseURL";

import Logo from "../Logo.png";
import { Show } from "@chakra-ui/react";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const { chats, account, socket, setChats, setAccount, setSelectedChat } =
    useContext(ChatContext);

  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  /* Logout Handler: */
  const logout = () => {
    socket.emit("disconnection", account);
    localStorage.removeItem("userInfo");
    setSelectedChat(null);
    setAccount(null);
    navigate("/");
  };

  /* Search People: */
  const searchPeople = async () => {
    if (!search) {
      toast({
        title: "Invalid Search Query.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

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
        description: "Failed to Load the Search Result.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  /* Access Chat: */
  const accessChat = async (userID) => {
    try {
      setLoadingChat(true);

      const { data } = await axiosBaseURL.post(
        `/chat`,
        { userID },
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${account?.token}`,
          },
        }
      );

      const alreadyExistedChat = chats.find((c) => c._id === data._id);

      !alreadyExistedChat && setChats([data, ...chats]);
      !alreadyExistedChat &&
        socket.emit("new-chat-initiated", {
          chatInfo: data,
          account: account?._id,
        });

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px">
        <Tooltip label="Search People..." hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text d={{ base: "none", md: "flex" }} px={4}>
              Search People
            </Text>
          </Button>
        </Tooltip>

        <Show above="sm">
          <Box
            fontSize="2xl"
            fontFamily="Work sans"
            display="flex"
            alignItems="center">
            <Avatar mr={2} size="md" cursor="pointer" name={Logo} src={Logo} />
            TalkSync
          </Box>
        </Show>

        <div>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={account?.name}
                src={account?.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={account}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />

        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search People</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={searchPeople}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user?._id}
                  user={user}
                  handleFunction={() => accessChat(user?._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;

{
  /* <Menu>
    <MenuButton p={1}>
      <NotificationBadge />
    </MenuButton>

    <MenuList pl={2}>
      {!notification.length && "No New Messages"}
      {notification.map((notif) => (
        <MenuItem
          key={notif?._id}
          onClick={() => {
            setSelectedChat(notif?.chat);
            setNotification(notification?.filter((n) => n !== notif));
          }}>
          {notif.chat.isGroupChat
            ? `New Message in ${notif?.chat?.chatName}`
            : `New Message from ${getSender(
                account,
                notif?.chat?.users
              )}`}
        </MenuItem>
      ))}
    </MenuList>
  </Menu> */
}
