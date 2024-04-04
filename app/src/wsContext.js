import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useUser } from "./UserContext";
import { useMessageContext } from "./MessageContext";

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketReadyCallback = useRef();
  const user = useUser().user;
  const token = useUser().user.token;
  const [messageQueue, setMessageQueue] = useState([]);
  const { currentChatId } = useMessageContext();
  const [reconnectCount, setReconnectCount] = useState(0);

  const enqueueMessage = (message) => {
    console.log("Setting message in queue:", message);
    setMessageQueue((prevQueue) => [...prevQueue, message]);
  };

  const processQueue = async () => {
    console.log("Processing queue:", messageQueue);
    while (
      messageQueue.length > 0 &&
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      const message = messageQueue.shift();
      console.log("Sending message from queue:", message);
      await sendMessage(message);
    }
  };

  const setSocketReadyCallback = (callback) => {
    console.log("Setting socketReadyCallback");
    socketReadyCallback.current = callback;
  };

  const joinChat = async () => {
    if (!currentChatId) {
      return;
    }

    const joinChatMessage = {
      type: "joinChat",
      chatId: currentChatId,
      userName: user.username,
    };

    await sendMessage(joinChatMessage, user.token);
  };

  useEffect(() => {
    connectWebSocket(token);

    return () => {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    };
  }, []);

  useEffect(() => {
    // This code will run when 'socket' changes
    console.log("Socket state updated:", socket);
    if (!socket) {
      console.log(`Socket: ${socket}`);
      console.log("Socket is null, reconnecting...");
      console.log("Reconnect count:", reconnectCount);

      setReconnectCount(reconnectCount + 1);
      setTimeout(async () => await connectWebSocket(token), 3600);
      return;
    }

    // check messageQueue and send messages
    joinChat(); // join chat is sent and response recieved and logged

    processQueue(); // processQueue is is sent but response is not logged which means that event listener is not set up on socket?
  }, [socket]);

  const connectWebSocket = async (token) => {
    if (socket && socket.readyState === WebSocket.OPEN) return;
    if (socket) {
      socket.close();
    }
    return new Promise((resolve, reject) => {
      const newSocket = new WebSocket(
        `${process.env.REACT_APP_WSS_API_DOMAIN}?token=${token}`
      );

      newSocket.onopen = () => {
        console.log("WebSocket connected");
        // newSocket.addEventListener("message", (event) => {
        //   const message = JSON.parse(event.data);
        //   console.log("New message received in context:", message);
        // });
        if (socketReadyCallback.current) {
          console.log(
            "Calling socketReadyCallback and setting up event listener"
          );
          socketReadyCallback.current(newSocket);
        }
        setSocket(newSocket);
        resolve(newSocket);
      };

      newSocket.onclose = (event) => {
        console.log("WebSocket disconnected");
        setSocket(null);
      };

      newSocket.onerror = (error) => {
        console.error("WebSocket connection error:", error);
        reject(error);
      };
    });
  };

  const sendMessage = async (message) => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      enqueueMessage(message);
      await connectWebSocket(token);
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      console.log("Sending message:", message);
      socket.send(JSON.stringify(message));
    }
  };

  const value = {
    socket,
    sendMessage,
    setSocketReadyCallback,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
