import "./styles.css";
import { Box } from "@chakra-ui/layout";

import { useContext } from "react";
import IndividualChat from "./IndividualChat";
import { ChatContext } from "../Context/ChatContext";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = useContext(ChatContext);

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDirection="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px">
      <IndividualChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
