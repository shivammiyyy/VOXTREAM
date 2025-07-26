// This utility function should exist somewhere in your frontend utils
// import { getRoomId } from "../utils/getRoomId"; 

// This handler registration is correct.
export const registerChatHandlers = (socket, { onMessage, onHistory }) => {
  socket.on("direct-message", onMessage);
  socket.on("direct-chat-history", onHistory);
};

// *** CRITICAL FIX & REFACTOR ***

// 1. New function to join a chat room when a chat window is opened.
// This is more efficient than joining on every message.
export const joinChatRoom = (socket, friendId) => {
  socket.emit("join-room", { friendId });
};

// 2. The 'sendMessage' function is now simplified.
// It no longer handles joining the room.
export const sendMessage = (socket, receiverId, content) => {
  socket.emit("direct-message", {
    receiverId,
    content,
  });
};

// This function remains the same.
export const requestChatHistory = (socket, receiverId) => {
  socket.emit("direct-chat-history", { receiverId });
};