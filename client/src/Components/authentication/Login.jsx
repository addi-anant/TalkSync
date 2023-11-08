import { Button } from "@chakra-ui/button";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosBaseURL } from "../../Config/axiosBaseURL";
import { ChatContext } from "../../Context/ChatContext";

const Login = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { setAccount } = useContext(ChatContext);

  /* State for Handling Hide Password Feature. */
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  /* Form State: */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* Form Submittion Handler: */
  const submitHandler = async () => {
    setLoading(true);

    /* All Fields are Required: */
    if (!email || !password) {
      toast({
        title: "All Fields are Required.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const { data } = await axiosBaseURL.post(
        "/user/login",
        { email, password },
        {
          headers: {
            "Content-type": "application/json",
          },
        }
      );

      toast({
        title: "Logged In Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setAccount(data);
      setLoading(false);
      navigate("/chat");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error?.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setLoading(false);
    }
  };

  return (
    <VStack spacing="10px">
      {/* Email: */}
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      {/* Password: */}
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Enter password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* Login Button: */}
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}>
        Login
      </Button>
    </VStack>
  );
};

export default Login;
