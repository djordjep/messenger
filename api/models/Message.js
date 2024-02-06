const mongoose = require("mongoose");
const { encryptMessage } = require("../utils/encryptMessage");
const Chat = require("./Chat");

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  keys: Array,
  createdAt: { type: Date, default: Date.now },
  // Additional fields like 'readAt' can be added to track read status, etc.
});

messageSchema.pre("save", async function (next) {
  console.log("Pre save hook: Message");
  // Check if the chat exists and the user is a participant
  const chat = await Chat.findOne({
    _id: this.chat,
    participants: this.sender._id,
  });
  if (!chat) {
    throw new Error("Chat not found or access denied");
  }
  if (this.content) {
    // encrypt message content
    const { encryptedMessage, encryptedSymmetricKeys } = await encryptMessage(
      this.content,
      chat.participants
    );
    console.log("encrypted message:" + encryptedMessage);
    this.content = encryptedMessage;
    this.keys = encryptedSymmetricKeys;
  }
  next();
});

module.exports = mongoose.model("Message", messageSchema);
