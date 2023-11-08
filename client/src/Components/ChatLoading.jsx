import { Stack } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";

const ChatLoading = () => {
  return (
    <Stack>
      {Array(10)
        .fill("")
        .map((_, index) => (
          <Skeleton height="45px" key={index} />
        ))}
    </Stack>
  );
};

export default ChatLoading;
