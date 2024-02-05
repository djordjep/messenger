const express = require("express");
const User = require("./models/User");
const cors = require("cors");
const authenticateToken = require("./middleware/auth");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const contactsRoutes = require("./routes/contacts");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
// add multiple origins in cors
app.use(
  cors({
    origin: [
      "https://192.168.1.19",
      "https://workable-rooster-on.ngrok-free.app",
    ],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from my messenger app backend!!!!!!!!!!!!!!!!!!");
});

app.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, publicKey } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword, publicKey });
    await user.save();

    res.status(201).send('{"message" : "User created"}');
  } catch (error) {
    console.log(error);
    res.status(500).send('{"message" : "Error registering new user"}');
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res
        .status(200)
        .json({ token, userId: user._id, username: user.username });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("Error logging in user");
  }
});

app.use("/users", authenticateToken, userRoutes);
app.use("/chats", authenticateToken, chatRoutes);
app.use("/chats/:chatId/messages", authenticateToken, messageRoutes);
app.use("/users/:userId/contacts", authenticateToken, contactsRoutes);

module.exports = app;
