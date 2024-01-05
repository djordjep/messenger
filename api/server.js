require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/mongoose");
const initWebSocketServer = require("./websocket");

const PORT = process.env.PORT || 4000;

connectDB();
const server = http.createServer(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initWebSocketServer(server);
