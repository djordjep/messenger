import React, { useState } from "react";
import { useFetchChats } from "./api";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Button,
} from "@mui/material";

const ChatList = ({ onChatSelect }) => {
  const [selectedChatId, setSelectedChatId] = useState(null);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    onChatSelect(chatId); // Notify the parent component
  };

  const { chats, loading, error } = useFetchChats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleNewChat = () => {
    // Handle new chat logic here
  };

  return (
    <div>
      <Typography variant="h6" sx={{ my: 2, textAlign: "center" }}>
        Chats
      </Typography>
      <Divider />
      <List>
        {/* Replace with dynamic chat list */}
        {chats.map((chat) => (
          <ListItemButton
            key={chat._id}
            selected={chat._id === selectedChatId}
            onClick={() => handleSelectChat(chat._id)}
          >
            <ListItemText primary={chat.name} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleNewChat}
        >
          New Chat
        </Button>
      </Box>
    </div>
  );
};

export default ChatList;
