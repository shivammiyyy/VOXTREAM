export const registerConnectionHandlers = (
  socket,
  { onNotify, onChatLeft, onSocketConnected, onDisconnect }
) => {
  socket.on("notify-connected-socket", onSocketConnected);
  socket.on("notify-chat-left", onChatLeft);
  socket.on("notification", onNotify);
  socket.on("disconnect", onDisconnect);
};

export const emitNewConnection = (socket, userId) => {
  socket.emit("new-connection", { userId });
};

export const emitChatLeft = (socket, friendId) => {
  socket.emit("chat-left", { friendId });
};
