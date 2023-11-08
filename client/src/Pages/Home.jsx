import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../Components/authentication/Login";
import Signup from "../Components/authentication/Signup";

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    !userInfo && navigate("/");
  }, [navigate]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        p={3}
        d="flex"
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
        justifyContent="center">
        <Text fontSize="4xl" fontFamily="Work sans">
          TaskSync
        </Text>
      </Box>
      <Box p={4} bg="white" w="100%" borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
