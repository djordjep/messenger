const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  name: String,
  // You can add more fields as needed
});

module.exports = mongoose.model("Chat", chatSchema);
