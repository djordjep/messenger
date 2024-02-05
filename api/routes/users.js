const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Example route: Get a list of users
router.get("/", async (req, res) => {
  // Logic to get users (admin endpoint)
  try {
    let users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

// GET /api/users/:userId - Get a user's profile
router.get("/:userId", async (req, res) => {
  // Implement logic to fetch and return the user's information
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId }).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

// PUT /api/users/:userId - Update a user's profile
router.put("/:userId", async (req, res) => {
  // Implement logic to update the user's information in the database
  try {
    const { userId } = req.params;
    const { username, password, publicKey } = req.body;

    const updateFields = {};

    if (username) {
      updateFields.username = username;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    if (publicKey) {
      updateFields.publicKey = publicKey;
    }

    const user = await User.findOneAndUpdate({ _id: userId }, updateFields);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

// DELETE /api/users/:userId - Delete a user
router.delete("/:userId", async (req, res) => {
  // Implement logic to delete the user's information from the database
  try {
    const { userId } = req.params;
    const user = await User.findOneAndDelete({ _id: userId });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

// Example route: Create a new user
router.post("/", async (req, res) => {
  // Logic to create a user
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).send("User created");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error registering new user");
  }
});

module.exports = router;
