import { Button } from "@chakra-ui/button";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosBaseURL } from "../../Config/axiosBaseURL";

const Signup = () => {
  const toast = useToast();
  const navigate = useNavigate();

  /* Form State: */
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);

  /* State for Handling Hide Password Feature. */
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  /* Form Submittion Handler: */
  const submitHandler = async () => {
    setPicLoading(true);

    /* Check if all Field are Required. */
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "All Feilds are Required.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const { data } = await axiosBaseURL.post(
        "/user/register",
        {
          name,
          email,
          password,
          pic,
        },
        {
          headers: {
            "Content-type": "application/json",
          },
        }
      );

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      navigate("/chat");
    } catch (Error) {
      toast({
        title: "Error Occured!",
        description: Error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  /* Method For Uploading Picture to Cloudinary: */
  const postDetails = (pics) => {
    setPicLoading(true);

    /* No Image Found Error: */
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();

      data.append("file", pics);
      data.append("upload_preset", "talksync");
      data.append("cloud_name", "additya");

      fetch("https://api.cloudinary.com/v1_1/additya/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPicLoading(false);
          setPic(data.url.toString());
        })
        .catch((Error) => {
          console.log(Error);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Image Format Must be .jpeg or .png!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setPicLoading(false);
      return;
    }
  };

  return (
    <VStack spacing="5px">
      {/* First Name: */}
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

      {/* Email: */}
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
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
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* Confirm Password: */}
      <FormControl id="password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* Picture: */}
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      {/* Sign-up Button: */}
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={picLoading}>
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
