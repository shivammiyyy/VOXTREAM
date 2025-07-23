export const registerChatHandlers = (socket, { onMessage, onHistory }) => {
  socket.on("direct-message", onMessage);
  socket.on("direct-chat-history", onHistory);
};

export const sendMessage = (socket, receiverId, content) => {
  socket.emit("direct-message", { receiverId, content });
};

export const requestChatHistory = (socket, receiverId) => {
  socket.emit("direct-chat-history", { receiverId });
};
