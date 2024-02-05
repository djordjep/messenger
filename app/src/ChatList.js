import React, { useState } from "react";
import { useFetchChats, apiSearchUserById, apiCreateChat } from "./api";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Button,
  Modal,
  Snackbar,
  Alert,
  TextField,
  ListItem,
} from "@mui/material";
import { useUser } from "./UserContext";

const ChatList = ({ onChatSelect }) => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const user = useUser().user;

  const handleNewChat = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    onChatSelect(chatId); // Notify the parent component
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const { chats, loading, error, fetchChats } = useFetchChats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleSearch = async () => {
    // API request to search user by ID (searchInput)
    const searchResponse = await apiSearchUserById(user, searchInput);

    console.log("searchResponse:", searchResponse);

    if (searchResponse.error) {
      setSnackbarMessage(searchResponse.error);
      setOpenSnackbar(true);
      return;
    }

    setSelectedParticipants([...selectedParticipants, searchResponse]);
  };

  const handleCreateChat = async (event) => {
    event.preventDefault();
    // API request to create a new chat with selectedParticipants
    // Handle response (success or error)
    const newChat = await apiCreateChat(user, selectedParticipants);

    console.log("newChat:", newChat);

    if (newChat.error) {
      setSnackbarMessage(newChat.error);
      setOpenSnackbar(true);
      return;
    }

    // Submit new chat logic here
    // On success:
    setSelectedParticipants([]);
    setSnackbarMessage("New chat created successfully");
    setOpenSnackbar(true);
    handleCloseModal();
    // Refresh chat list
    fetchChats();
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
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" sx={{ mt: 2 }}>
          Your ID: {user.userId}
        </Typography>
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          p={2}
          style={{
            backgroundColor: "white",
            margin: "20% auto",
            width: "300px",
          }}
        >
          <Typography variant="h6">Create New Chat</Typography>
          <TextField
            label="Search User ID"
            fullWidth
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            fullWidth
          >
            Search
          </Button>

          {/* if participant.length > 0, show text selected participants */}
          {selectedParticipants.length > 0 && (
            <div>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Selected Participants:</Typography>
              <List>
                {selectedParticipants.map((participant, index) => (
                  <ListItem key={index}>{participant.username}</ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCreateChat}
                fullWidth
              >
                Create Chat
              </Button>
            </div>
          )}
        </Box>
      </Modal>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChatList;
