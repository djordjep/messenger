import React, { useEffect, useState, useRef } from "react";
import { Box, Drawer, TextField, Button } from "@mui/material";
import { useMessageContext } from "./MessageContext";
import ChatList from "./ChatList";
import MessagesList from "./MessagesList";
import { useUser } from "./UserContext";
import ErrorBoundary from "./ErrorBoundary";
// import { createConnection, sendMessage, closeConnection } from "./wsService";
import { useWebSocket } from "./wsContext";

function Messenger() {
  const [selectedChatId, setSelectedChatId] = useState(null);

  const user = useUser().user;

  const { addMessage, setCurrentChatId } = useMessageContext();

  const handleMessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("New message received:", message);
    if (message.type === "chatMessage") {
      addMessage(message);
    }
  };

  const onWebSocketReady = (newSocket) => {
    console.log("onWebSocketReady");
    if (!newSocket) {
      console.log("socket is null");
      return;
    }

    newSocket.addEventListener("message", handleMessage);
  };

  const { socket, sendMessage, setSocketReadyCallback } = useWebSocket(); // this is firing twice?

  useEffect(() => {
    // if (socket) {
    //   console.log("adding event listener to socket");
    //   socket.addEventListener("message", handleMessage);
    // }
    // if (!socket) return;
    setSocketReadyCallback(onWebSocketReady);
  }, []);

  useEffect(() => {
    if (!selectedChatId) {
      return;
    }

    const joinChatMessage = {
      type: "joinChat",
      chatId: selectedChatId,
      userName: user.username,
    };

    setCurrentChatId(selectedChatId);
    sendMessage(joinChatMessage, user.token);
  }, [selectedChatId, user]);

  const [messageText, setMessageText] = useState("");
  function handleInputChange(event) {
    setMessageText(event.target.value);
  }

  function handleSendMessage() {
    const message = {
      type: "chatMesssage",
      content: messageText,
      chatId: selectedChatId,
    };
    sendMessage(message, user.token);
    setMessageText("");
  }

  const drawerWidth = 240;

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <ChatList onChatSelect={setSelectedChatId} />
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <MessagesList />
        </ErrorBoundary>

        {/* Message input */}
        {selectedChatId && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              "& > :not(style)": { m: 1 },
            }}
          >
            <TextField
              fullWidth
              label="Type a message"
              variant="outlined"
              sx={{ mr: 1 }}
              value={messageText}
              onChange={handleInputChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendMessage();
                  event.preventDefault();
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Messenger;
