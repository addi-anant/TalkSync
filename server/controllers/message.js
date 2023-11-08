const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");

/* Send Message: */
module.exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatID } = req.body;

  if (!content || !chatID) {
    console.log("Invalid Request.");
    return res.status(400).json();
  }

  try {
    let message = await Message.create({
      chatID: chatID,
      content: content,
      sender: req?.user?._id,
    });

    message = await message.populate("chatID");
    message = await message.populate("sender", "name pic");

    message = await User.populate(message, {
      path: "chatID.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req?.body?.chatID, { latestMessage: message });

    return res.status(200).json(message);
  } catch (error) {
    console.log(error);
    return res.status(400).json();
  }
});

/* Fetch All Messages (:chatID) */
module.exports.fetchMessages = asyncHandler(async (req, res) => {
  const { chatID } = req.params;

  try {
    const messages = await Message.find({ chatID })
      .populate("sender", "name pic email")
      .populate("chatID")
      .sort({ updatedAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
