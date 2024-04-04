import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Drawer,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useMessageContext } from "./MessageContext";
import ChatList from "./ChatList";
import MessagesList from "./MessagesList";
import { useUser } from "./UserContext";
import ErrorBoundary from "./ErrorBoundary";
import { useWebSocket } from "./wsContext";
import { decryptMessage } from "./crypto";

function Messenger() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(!selectedChatId);

  const theme = useTheme();
  // Use useMediaQuery hook to check for screen size
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const user = useUser().user;

  const { addMessage, setCurrentChatId } = useMessageContext();

  const handleMessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("New message received:", message);
    if (message.type === "chatMessage") {
      decryptMessage(message, user).then((decryptedMessage) => {
        addMessage(decryptedMessage);
      });
    }
  };

  const onWebSocketReady = useCallback((newSocket) => {
    if (!newSocket) {
      return;
    }

    newSocket.addEventListener("message", handleMessage);
  }, []);

  const { socket, sendMessage, setSocketReadyCallback } = useWebSocket();

  useEffect(() => {
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
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 1201,
            color: "common.white", // Text/icon color
            backgroundColor: "primary.main", // Button background color
            "&:hover": {
              backgroundColor: "primary.dark", // Button background color on hover
            },
          }} // Adjust color as needed
          aria-label="toggle chat list"
        >
          <MenuIcon />
        </IconButton>
      )}

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
        variant={isMobile ? "temporary" : "permanent"}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        anchor="left"
      >
        <ChatList
          onChatSelect={(chatId) => {
            setSelectedChatId(chatId);
            if (isMobile) setMobileOpen(false);
          }}
        />
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <MessagesList />
        </ErrorBoundary>

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
