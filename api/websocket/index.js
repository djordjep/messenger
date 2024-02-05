const WebSocket = require("ws");
const Message = require("../models/Message");
const url = require("url");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const winston = require("winston");

const logger = winston.createLogger({
  transports: [
    // new winston.transports.File({
    //   filename: "debug_ws.log",
    //   level: "info",
    // }),
    new winston.transports.Console(),
  ],
});

const initWebSocketServer = (server) => {
  logger.info("initWebSocketServer");
  // listen on /ws route
  const wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("error", (error) => {
    logger.error("WebSocket server error:", error);
  });

  wss.on("connection", async (ws, req) => {
    try {
      const params = new url.URL(req.url, `http://${req.headers.host}`)
        .searchParams;
      const token = params.get("token");
      if (!token) throw new Error("No token provided");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // make user available to the rest of the code
      const user = await User.findById(decoded.userId);

      if (!user) throw new Error("User not found");

      ws.user = user; // Associate the user with the WebSocket connection
    } catch (error) {
      ws.close(); // Close the connection if authentication fails
    }

    ws.on("message", async (message) => {
      logger.info("Received message: " + message);
      try {
        const messageData = JSON.parse(message);
        // Validate messageData, e.g., check it has 'chatId', 'content', etc.

        let response = messageData;

        // Handle 'joinChat' type messages
        if (messageData.type === "joinChat") {
          ws.chatId = messageData.chatId; // Store chatId in the WebSocket connection

          ws.send(
            JSON.stringify({
              type: "joinChatSuccess",
              chatId: messageData.chatId,
              userName: messageData.userName,
            })
          );

          // Send chat history to client
          // const chatHistory = await getChatHistory(messageData.chatId);
          // ws.send(JSON.stringify(chatHistory));

          return;
        }

        if (messageData.type === "chatMesssage") {
          // Save message to DB
          savedMessage = await saveMessageToDB(messageData, ws.user, ws.chatId);

          response = savedMessage.toObject();

          response.type = "chatMessage";
        }

        // Broadcast message to relevant clients
        wss.clients.forEach((client) => {
          if (
            client.readyState === WebSocket.OPEN &&
            client.chatId === messageData.chatId
          ) {
            logger.info(
              "Broadcasting message to client: " + JSON.stringify(response)
            );
            client.send(JSON.stringify(response));
          }
        });
      } catch (error) {
        logger.error("Error handling message:", error);
      }
    });

    ws.on("error", (error) => {
      logger.error("WebSocket error:", error);
    });
  });

  return wss;
};

async function saveMessageToDB(messageData, user, chatId) {
  try {
    const message = new Message();
    message.chat = chatId;
    message.sender = user;
    message.content = messageData.content;

    return await message.save();
  } catch (error) {
    logger.error(error);
  }
}

module.exports = initWebSocketServer;
