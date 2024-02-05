require("dotenv").config();
const http = require("http");
var https = require("https");
const app = require("./app");
const connectDB = require("./config/mongoose");
const initWebSocketServer = require("./websocket");
const fs = require("fs");
const path = require("path");
// set NODE_EXTRA_CA_CERTS environment variable to the path to the rootCA.pem file  (mkcert -CAROOT)/rootCA.pem
process.env.NODE_EXTRA_CA_CERTS = "/usr/local/share/ca-certificates/rootCA.pem";

const PORT = process.env.PORT || 4000;

var options = {
  key: fs.readFileSync(path.resolve(__dirname, "cert/local-key.pem")),
  cert: fs.readFileSync(path.resolve(__dirname, "cert/local-cert.pem")),
};

connectDB();
// const server = http.createServer(app);

const secureServer = https.createServer(options, app);

// initWebSocketServer(server);
const wss = initWebSocketServer(secureServer);

app.set("wss", wss);

secureServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
