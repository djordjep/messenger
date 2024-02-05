import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { getFetchMessages } from "./api";
import { decryptMessages } from "./crypto";

export const MessageContext = createContext();

export const useMessageContext = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const user = useUser().user;

  // on currentChatId change, fetch messages
  useEffect(() => {
    console.log("MessageProvider useEffect currentChatId:", currentChatId);
    if (currentChatId) {
      getFetchMessages(currentChatId, user)
        .then(async (fetchedMessages) => {
          // decrypt messages
          const decrypred = await decryptMessages(
            fetchedMessages.messages,
            user
          );
          console.log("decrypred:", decrypred);
          setMessages(decrypred);
        })
        .catch((error) => {
          console.error("Failed to fetch messages:", error);
        });
    }
  }, [currentChatId, user]);

  const addMessage = (message) => {
    setMessages((prevMessages) => {
      console.log("MessageProvider prevMessages:", prevMessages);
      console.log("MessageProvider message:", message);
      return [...prevMessages, message];
    });
  };

  return (
    <MessageContext.Provider
      value={{ messages, addMessage, currentChatId, setCurrentChatId }}
    >
      {children}
    </MessageContext.Provider>
  );
};
