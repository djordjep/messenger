import { useUser } from "./UserContext";
import { useState, useEffect, useMemo } from "react";

const BASE_URL = `${process.env.REACT_APP_API_DOMAIN}/api`; // Adjust as per your server's address

const useAuthToken = () => {
  // get token from user context
  const { user } = useUser();
  try {
    return user.token;
  } catch (error) {
    console.log(error);
  }
};

const useHeaders = () => {
  const authToken = useAuthToken();
  const headers = useMemo(
    () => ({
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    }),
    [authToken]
  );
  return headers;
};

export const useFetchChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const headers = useHeaders();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`${BASE_URL}/chats`, {
          method: "GET",
          headers: headers,
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setChats(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [headers]);

  return { chats, loading, error };
};

export const getFetchMessages = async (chatId, user) => {
  if (!chatId) {
    return null;
  }

  const token = user.token;

  const headers = {
    authorization: token,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
      method: "GET",
      headers: headers,
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const data = response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
};

export const useCreateChat = async (participants) => {
  const authToken = useAuthToken();
  const response = await fetch(`${BASE_URL}/chats`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ participants }),
  });
  return response.json();
};

export const useSendMessage = async (chatId, content) => {
  const authToken = useAuthToken();
  const response = await fetch(`${BASE_URL}/messages/${chatId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  return response.json();
};

export const useFetchUsers = async () => {
  const authToken = useAuthToken();
  const response = await fetch(`${BASE_URL}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
