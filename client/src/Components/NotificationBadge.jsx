import "./styles.css";
import { Box } from "@chakra-ui/react";

const NotificationBadge = () => {
  return (
    <Box>
      <div
        style={{
          position: "absolute",
          right: "16px",
          bottom: "8px",
          borderRadius: "100%",
          height: "20px",
          width: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#39A7FF",
          color: "white",
          fontSize: "12px",
        }}></div>
    </Box>
  );
};

export default NotificationBadge;
