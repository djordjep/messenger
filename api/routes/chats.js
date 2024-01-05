const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");

// Endpoint to create a new chat
router.post("/", async (req, res) => {
  try {
    let { participants, name } = req.body; // Array of user IDs

    // Validate participants
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).send("Invalid participants");
    }

    // Convert participants to string for comparison (if they are ObjectIds)
    participants = participants.map((participant) => participant.toString());

    // Check if authenticated user's ID is in the participants array
    const userId = req.user._id.toString(); // Convert to string if ObjectId
    if (!participants.includes(userId)) {
      participants.push(userId); // Add authenticated user to participants if not included
    }

    if (participants.length < 2) {
      return res
        .status(400)
        .send("One or more participants are needed aside from self");
    }

    // Validate that each participant is a valid user
    const validUsers = await User.find({ _id: { $in: participants } });
    if (validUsers.length !== participants.length) {
      return res
        .status(400)
        .send("One or more participants are not valid users");
    }

    // Check for existing chat with the same participants
    const existingChat = await Chat.findOne({
      participants: { $all: participants, $size: participants.length },
    });

    if (existingChat) {
      return res
        .status(409)
        .send("A chat with the same participants already exists");
    }

    // Determine the chat name
    if (!name) {
      if (participants.length === 2) {
        // If there's only one other participant, use their name as the chat name
        const otherUserId = participants.find((id) => id !== userId.toString());
        const otherUser = await User.findById(otherUserId);
        name = otherUser ? otherUser.username : "Unknown"; // Assuming users have a username field
      } else {
        // For multiple participants, create a default group chat name
        name = `Group Chat ${Math.floor(Math.random() * 10000)}`; // Random number for uniqueness
      }
    }

    console.log(name);

    // Create and save the new chat
    const newChat = new Chat({ participants, name });
    await newChat.save();

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

// Endpoint to get all chats for a user
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all chats where the current user is a participant
    const chats = await Chat.find({ participants: userId }).populate(
      "participants",
      "username"
    );

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

// Endpoint to get a specific chat
router.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Find the chat and ensure the user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    }).populate("participants", "username");

    if (!chat) {
      return res.status(404).send("Chat not found or access denied");
    }

    // Respond with chat details and messages
    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

module.exports = router;
