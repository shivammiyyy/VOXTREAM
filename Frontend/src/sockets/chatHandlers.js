import { getRoomId } from "../utils/getRoomId";

export const registerChatHandlers = (socket, { onMessage, onHistory }) => {
  socket.on("direct-message", onMessage);
  socket.on("direct-chat-history", onHistory);
};

export const sendMessage = (socket, receiverId, content, senderId) => {
  const roomId = getRoomId(senderId, receiverId);
  socket.emit("join-room", { friendId: roomId });

  socket.emit("direct-message", {
    receiverId,
    content,
  });
};

export const requestChatHistory = (socket, receiverId) => {
  socket.emit("direct-chat-history", { receiverId });
};
