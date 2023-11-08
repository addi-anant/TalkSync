import { useContext } from "react";
import { Box } from "@chakra-ui/react";
import { Badge } from "@chakra-ui/layout";
import { CloseIcon } from "@chakra-ui/icons";
import { ChatContext } from "../Context/ChatContext";

const UserBadgeItem = ({ user, handleFunction }) => {
  const { onlineAccountList } = useContext(ChatContext);
  return (
    <Badge
      display="flex"
      alignItems="center"
      gap="6px"
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      backgroundColor="#FFA1F5"
      cursor="pointer"
      onClick={handleFunction}>
      {onlineAccountList?.some((acc) => acc === user?._id) && (
        <Box
          style={{
            height: "10px",
            width: "10px",
            backgroundColor: "#54B435",
            borderRadius: "100%",
          }}></Box>
      )}
      {user.name}
      <CloseIcon pl={1} />
    </Badge>
  );
};

export default UserBadgeItem;
