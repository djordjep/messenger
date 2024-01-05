const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/User");

// POST /api/users/:userId/contacts
// Adds a new contact to a user's contact list
router.post("/", async (req, res) => {
  try {
    const { userId } = req.params;

    const { contactId } = req.body; // ID of the user to be added as a contact

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found: " + userId);
    }

    // Add the contactId to the user's contacts if it's not already there
    if (!user.contacts.includes(contactId)) {
      user.contacts.push(contactId);
      await user.save();
    }

    res.status(200).send("Contact added");
  } catch (error) {
    res.status(500).send("Error adding contact");
  }
});

// GET /api/users/:userId/contacts
// Retrieves a user's contact list
router.get("/", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("contacts");
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user.contacts);
  } catch (error) {
    res.status(500).send("Error retrieving contacts");
  }
});

module.exports = router;
