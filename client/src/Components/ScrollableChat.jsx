import {
  isSameUser,
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
} from "../Config/ChatLogics";
import { useContext } from "react";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { ChatContext } from "../Context/ChatContext";

const ScrollableChat = ({ messages }) => {
  const { account } = useContext(ChatContext);

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((msg, index) => (
          <div style={{ display: "flex" }} key={msg?._id}>
            {(isSameSender(messages, msg, index, account?._id) ||
              isLastMessage(messages, index, account?._id)) && (
              <Tooltip
                label={msg?.sender?.name}
                placement="bottom-start"
                hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={msg?.sender?.name}
                  src={msg?.sender?.pic}
                />
              </Tooltip>
            )}

            <span
              style={{
                backgroundColor: `${
                  msg?.sender?._id === account?._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(
                  messages,
                  msg,
                  index,
                  account?._id
                ),
                marginTop: isSameUser(messages, msg, index, account?._id)
                  ? 3
                  : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}>
              {msg?.content}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
