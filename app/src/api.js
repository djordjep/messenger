import { useUser } from "./UserContext";
import { useState, useEffect, useMemo } from "react";

const BASE_URL = `${process.env.REACT_APP_API_DOMAIN}`; // Adjust as per your server's address

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

const getHeaders = (user) => {
  // check user type
  if (!user.token) {
    throw new Error("Wrong param passed. User is not an instance of User");
  }

  return {
    authorization: user.token,
    "Content-Type": "application/json",
  };
};

export const useFetchChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const headers = useHeaders();

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

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { chats, loading, error, fetchChats };
};

export const getFetchMessages = async (chatId, user) => {
  if (!chatId) {
    return null;
  }

  const headers = getHeaders(user);

  try {
    const response = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
      method: "GET",
      headers: headers,
    });
    if (!response.ok)
      throw new Error("Network response error: " + response.json());
    const data = response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
};

export const postPublicKey = async (user, publicKey) => {
  const headers = getHeaders(user);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_DOMAIN}/users/${user._id}`,
      {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ publicKey }),
      }
    );
    if (!response.ok)
      throw new Error("Network response error: " + response.json());
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    console.log(error);
  }
};

export const apiSearchUserById = async (user, searchUserId) => {
  const headers = getHeaders(user);

  try {
    const response = await fetch(`${BASE_URL}/users/${searchUserId}`, {
      method: "GET",
      headers: headers,
    });
    if (!response.ok)
      throw new Error("Network response error: " + response.json());
    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
};

export const apiCreateChat = async (user, participantsO) => {
  const participants = participantsO.map((participant) => participant._id);

  const headers = getHeaders(user);
  try {
    const response = await fetch(`${BASE_URL}/chats`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ user, participants }),
    });
    if (!response.ok)
      throw new Error("Network response error: " + response.json());
    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
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
