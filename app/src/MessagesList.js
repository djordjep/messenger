import React, { useEffect, useRef } from "react";
import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { useMessageContext } from "./MessageContext";

function MessagesList() {
  const { messages } = useMessageContext();

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const colorCache = {};

  const getColorForSender = (senderId) => {
    if (colorCache[senderId]) {
      return colorCache[senderId];
    }

    let hash = 0;
    for (let i = 0; i < senderId.length; i++) {
      hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Creating a light color: we use higher numbers (200 to 255) for RGB values
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;
    const lightColor = `rgb(${200 + (r % 56)}, ${200 + (g % 56)}, ${
      200 + (b % 56)
    })`;

    colorCache[senderId] = lightColor;

    return lightColor;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll down every time messages update

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {messages &&
        typeof messages === "object" &&
        messages.length > 0 &&
        messages.map((message, index) => (
          <React.Fragment key={index}>
            <ListItem
              alignItems="flex-start"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "1px solid #ddd",
                borderRadius: "4px",
                mb: 1,
                p: 2,
                backgroundColor: getColorForSender(message.sender?._id),
              }}
            >
              <Typography
                sx={{ alignSelf: "flex-start", fontSize: "0.9em", mb: 1 }} // Top left sender
                color="text.primary"
              >
                {typeof message.sender === "object"
                  ? message.sender.username
                  : "Anonymous"}
              </Typography>
              <ListItemText
                secondary={
                  <Typography
                    sx={{ display: "block", textAlign: "center", mb: 2 }} // Center align content
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {message.content}
                  </Typography>
                }
              />
              <Typography
                sx={{ alignSelf: "flex-end", fontSize: "0.8em" }} // Bottom right date
                color="text.secondary"
              >
                {new Date(message.createdAt).toLocaleString()}
              </Typography>
            </ListItem>
          </React.Fragment>
        ))}
      <div ref={messagesEndRef} />
    </List>
  );
}

export default MessagesList;
