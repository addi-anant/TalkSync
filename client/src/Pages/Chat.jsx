import { Box } from "@chakra-ui/layout";

import Chatbox from "../Components/Chatbox";
import MyChats from "../Components/MyChats";
import SideDrawer from "../Components/SideDrawer";

import { useState, useContext } from "react";
import { ChatContext } from "../Context/ChatContext";

const Chatpage = () => {
  const { account } = useContext(ChatContext);
  const [fetchAgain, setFetchAgain] =
    useState(false); /* Maintained to cause re-render. */

  return (
    <div style={{ width: "100%" }}>
      {account && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="90vh"
        p="10px">
        {account && (
          <>
            <MyChats fetchAgain={fetchAgain} />
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </>
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
