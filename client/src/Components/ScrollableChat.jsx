import {
  isSameUser,
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
} from "../Config/ChatLogics";
import { useRef, useContext, useEffect } from "react";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { ChatContext } from "../Context/ChatContext";

const ScrollableChat = ({
  messages,
  hasNextPage,
  fetchMessages,
  prevChatLoading,
}) => {
  const viewRef = useRef();
  const { account } = useContext(ChatContext);

  useEffect(() => {
    viewRef?.current?.scrollIntoView();
  }, [messages]);

  const messageRef = useRef();

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);

    // eslint-disable-next-line
  }, []);

  const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    if (
      rect.top - 150 >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    ) {
      hasNextPage && !prevChatLoading && fetchMessages(true);
    }
  };

  const scrollHandler = () => {
    isInViewport(messageRef.current);
  };

  return (
    <ScrollableFeed onScroll={scrollHandler}>
      {prevChatLoading && "Loading...."}
      {messages &&
        messages.map((msg, index) => (
          <div
            style={{ display: "flex" }}
            key={msg?._id}
            // ref={index === 0 ? messageRef : null}>
            ref={index === 0 ? messageRef : index === 24 ? viewRef : null}>
            {/* ref={index === 24 ? viewRef : index === 0 ? messageRef : null}> */}
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

// ref={index === 24 ? viewRef : index === 0 ? messageRef : null}>
