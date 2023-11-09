const User = require("../models/user");
const Chat = require("../models/chat");
const asyncHandler = require("express-async-handler");

/* Fetch Chat: (Logged In Account) */
module.exports.fetchChat = asyncHandler(async (req, res) => {
  try {
    let user = await User.findById(req?.user?._id).populate({
      path: "chats",
      options: { sort: { updatedAt: -1 } }, // Sort chats by updatedAt in descending order.
    });

    user = await Chat.populate(user, {
      path: "chats.users",
    });

    user = await Chat.populate(user, {
      path: "chats.latestMessage",
    });

    const { chats } = await User.populate(user, {
      path: "chats.latestMessage.sender",
    });

    return res.status(200).send(chats);
  } catch (error) {
    res.status(400).json();
    throw new Error(error.message);
  }
});

/* Access Chat: (Create/Fetch 1 ON 1 Chat) */
module.exports.accessChat = asyncHandler(async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    console.log("userID param not provided in request.");
    return res.sendStatus(400);
  }

  /* Check if Chat Already Existed b/w the two Accounts: */
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: userID } } },
      { users: { $elemMatch: { $eq: req?.user?._id } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  /* Nested Populating Field in Model: */
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  /* If Chat Already Exist b/w the two Accounts: */
  if (isChat.length !== 0) return res.status(200).send(isChat[0]);

  /* Create New Chat b/w the two Accounts: */
  try {
    const chat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req?.user?._id, userID],
    });

    await User.findByIdAndUpdate(userID, {
      $push: { chats: chat?._id },
    });

    await User.findByIdAndUpdate(req?.user?._id, {
      $push: { chats: chat?._id },
    });

    const chatInfo = await Chat.findOne({ _id: chat?._id }).populate(
      "users",
      "-password"
    );

    return res.status(200).json(chatInfo);
  } catch (error) {
    return res.status(400).json();
  }
});

/* Create Group Chat: */
module.exports.createGroupChat = asyncHandler(async (req, res) => {
  if (!req?.body?.users || !req?.body?.name)
    return res.status(400).send({ message: "Please Fill all the feilds." });

  let users = JSON.parse(req?.body?.users);

  /* Group Formation Require More than 2 users. */
  if (users?.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat.");
  }

  /* Add Logged In Account To Group Chat: */
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req?.body?.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req?.user,
    });

    User.updateMany(
      {
        _id: {
          $in: groupChat?.users,
        },
      },
      {
        $push: { chats: groupChat?._id },
      },
      { new: true }
    ).catch((Error) => {
      console.log(`Error updating user while creating group Chat: ${Error}`);
    });

    const groupChatInfo = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(groupChatInfo);
  } catch (error) {
    res.status(400).json();
    throw new Error(error.message);
  }
});

/* Rename Group: */
module.exports.renameGroup = asyncHandler(async (req, res) => {
  const { chatID, chatName } = req.body;

  /* Rename Group: */
  const updatedChat = await Chat.findByIdAndUpdate(
    chatID,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(404).json();
  } else {
    return res.status(200).json(updatedChat);
  }
});

/* Add To Group: */
// TODO: ONLY ADMIN CAN ADD NEW ACCOUNT TO GROUP:
module.exports.addToGroup = asyncHandler(async (req, res) => {
  const { chatID, userID } = req.body;

  const addAccount = await Chat.findByIdAndUpdate(
    chatID,
    {
      $push: { users: userID },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addAccount) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    return res.status(200).json(addAccount);
  }
});

/* Remove From Group: */
// TODO: ONLY ADMIN CAN REMOVE ACCOUNT AND DON'T REMOVE ADMIN FROM GROUP CHAT:
module.exports.removeFromGroup = asyncHandler(async (req, res) => {
  const { chatID, userID } = req.body;

  const removeAccount = await Chat.findByIdAndUpdate(
    chatID,
    {
      $pull: { users: userID },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  return !removeAccount ? res.status(404) : res.json(removeAccount);
});
