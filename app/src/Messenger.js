import React, { useEffect, useState, useMemo } from "react";
import { Box, Drawer, TextField, Button } from "@mui/material";
import { useMessageContext } from "./MessageContext";
import ChatList from "./ChatList";
import MessagesList from "./MessagesList";
import { useUser } from "./UserContext";
import ErrorBoundary from "./ErrorBoundary";

function Messenger() {
  const [selectedChatId, setSelectedChatId] = useState(null);

  async function fetchContacts() {
    // TODO: Fetch contacts from API
  }

  const token = useUser().user.token;
  const socket = useMemo(
    () => new WebSocket(`ws://localhost:4440?token=${token}`),
    [token]
  );
  const user = useUser().user;

  const { addMessage, setCurrentChatId } = useMessageContext(); // Add fallback value to prevent errors

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    console.log("New message received:", message);
    if (message.type === "chatMessage") {
      addMessage(message);
    }
  });

  useEffect(() => {
    if (!selectedChatId) {
      return;
    }

    const joinChatMessage = JSON.stringify({
      type: "joinChat",
      chatId: selectedChatId,
      userName: user.username,
    });

    setCurrentChatId(selectedChatId);

    socket.send(joinChatMessage);
    // Cleanup WebSocket connection when component unmounts
    return () => {
      socket.close();
    };
  }, [setCurrentChatId, selectedChatId, socket, user]);

  function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
      console.log("Sending message: ", message);
      socket.send(JSON.stringify(message));
    }
  }

  const [messageText, setMessageText] = useState("");
  function handleInputChange(event) {
    setMessageText(event.target.value);
  }

  function handleSendMessage() {
    const message = {
      type: "chatMesssage",
      content: messageText,
      // Add any other properties you need for the message
    };
    sendMessage(message);
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
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Messenger;
