import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import ChatProvider from "./Context/ChatContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChatProvider>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </ChatProvider>
);
