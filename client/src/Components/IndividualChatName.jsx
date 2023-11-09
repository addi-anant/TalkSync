import { Box, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { ChatContext } from "../Context/ChatContext";
import { getOtherUser, getSender } from "../Config/ChatLogics";
import NotificationBadge from "./NotificationBadge";

const IndividualChatName = ({ chat, loggedUser }) => {
  const {
    account,
    selectedChat,
    notification,
    setSelectedChat,
    setNotification,
    onlineAccountList,
  } = useContext(ChatContext);

  return (
    <Box
      key={chat?._id}
      style={{ position: "relative" }}
      onClick={() => {
        setSelectedChat(chat);
        setNotification(
          notification?.filter((notif) => chat?._id !== notif?.chatID?._id)
        );
      }}
      cursor="pointer"
      bg={selectedChat?._id === chat?._id ? "#38B2AC" : "#E8E8E8"}
      color={selectedChat === chat ? "white" : "black"}
      px={3}
      py={2}
      borderRadius="lg"
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
                ? chat?.latestMessage?.content?.substring(0, 51) + "..."
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
            count = count + (notif?.chatID?._id === chat?._id ? 1 : 0);
            return count;
          }, 0)}
        />
      ) : (
        <></>
      )}
    </Box>
  );
};

export default IndividualChatName;
