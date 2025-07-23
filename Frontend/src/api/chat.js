import API from "./axios";

// Fetch chat history with a friend
export const getChatHistory = async (userId) => {
  const res = await API.get(`/chat/${userId}`);
  return res.data.messages;
};
