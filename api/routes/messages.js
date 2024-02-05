const express = require("express");
const router = express.Router({ mergeParams: true });
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const encryptMessage = require("../utils/encryptMessage");

const winston = require("winston");

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "debug_message_routes.log",
      level: "info",
    }),
  ],
});

// Endpoint to post a message to a chat
router.post("/", async (req, res) => {
  // disable
  return res.status(404).send("Chat not found or access denied");
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    // Check if the chat exists and the user is a participant
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res.status(404).send("Chat not found or access denied");
    }
    // encrypt message content
    const { encryptedMessage, encryptedSymmetricKeys } = await encryptMessage(
      content,
      chat.participants
    );

    // Create and save the new message
    const message = new Message({
      chat: chatId,
      sender: userId,
      content: content,
      createdAt: new Date(), // or rely on default value set in the schema
    });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

// Endpoint to get messages from a chat
router.get("/", async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Find the chat and ensure the user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    }).populate("participants", "username");

    if (!chat) {
      return res.status(404).send("Chat not found or access denied");
    }

    // Fetch messages with pagination
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username")
      .exec();

    // in chronological order
    const reversedMessages = messages.reverse();

    res.status(200).json({ chat, messages: reversedMessages });
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

module.exports = router;
