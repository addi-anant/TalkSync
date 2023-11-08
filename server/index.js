const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

/* CORS Header: */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://tasksync.vercel.app");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});

/* Handle the CORS Error. */
app.use(
  cors({
    origin: ["http://localhost:5173", "https://tasksync.vercel.app"],
    credentials: true,
  })
);
require("dotenv").config(); /* dotenv Configuration. */
app.use(express.json()); /* Allow us to recieve JSON response. */

/* Connection to MongoDB: */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connection to MongoDB established successfully.");
  })
  .catch((Error) => {
    console.log(`Connection to MongoDB failed: ${Error?.message}`);
  });

/* Routing Middleware: */
app.use(require("./routes/index.js"));

/* Error Handling middleware */
app.use(notFound);
app.use(errorHandler);

const PORT = 8080 || process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`The Server is up and running on PORT: ${PORT}`);
});

/* SOCKET.IO IMPLEMENTATION: */
const io = require("socket.io")(server, {
  pingTimeout: 60000 /* Wait time after which the connection is closed due to inactivity. */,
  cors: {
    origin: "http://localhost:5173",
  },
});

/* Maintaining Online Account List: */
let onlineAccountList = [];

/* Setting up connection: */
io.on("connection", (socket) => {
  /* Created a room for the specific user: */
  socket.on("setup", (userInfo) => {
    socket.join(userInfo?._id);
    socket.emit("connected");

    /* Handling Online Account Logic: */
    !onlineAccountList.some((account) => account === userInfo?._id) &&
      onlineAccountList.push(userInfo?._id);
    io.emit("online-account-list", onlineAccountList);
  });

  /* Upon Opening a specific chat, user joins the chat room: */
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  /* Login for Recieving & Sending Message: */
  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved?.chatID;

    /* chat?.users => Hold the list of people associated with a Chat Room: */
    if (!chat?.users) return console.log("chat.users not defined");

    chat?.users?.forEach((user) => {
      if (user?._id === newMessageRecieved?.sender?._id) return;
      socket.in(user?._id).emit("message recieved", newMessageRecieved);
    });
  });

  /* Typing Animation Logic: */
  socket.on("typing", (room) => socket.in(room).emit("typing"));

  /* Stop Typing Logic: */
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  /* New Chat Login */
  socket.on("new-chat-initiated", (info) => {
    const { chatInfo, account } = info;

    chatInfo?.users?.forEach((user) => {
      if (user?._id !== account) {
        socket.in(user?._id).emit("new-chat-formed", chatInfo);
      }
    });
  });

  /* Disconnection Logic: */
  socket.off("setup", () => {
    socket.leave(userInfo?._id);
  });

  /* Online Account Disconnection: */
  socket.on("disconnection", (userInfo) => {
    onlineAccountList = onlineAccountList.filter(
      (account) => account !== userInfo?._id
    );

    io.emit("online-account-list", onlineAccountList);
  });
});
