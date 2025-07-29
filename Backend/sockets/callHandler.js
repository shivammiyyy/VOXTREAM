export const registerCallHandlers = (socket, io) => {
  const callerId = socket.user._id.toString();

  // Notify this user of their socket ID
  socket.on("new-connection", ({ userId }) => {
    io.to(userId).emit("notify-connected-socket", { socketId: socket.id });
  });

  // Call request sent to callee
  socket.on("call-request", ({ calleeId }) => {
    io.to(calleeId).emit("call-request", {
      callerId,
      socketId: socket.id,
    });
  });

  // Response back to caller
  socket.on("call-response", ({ callerId, accepted }) => {
    io.to(callerId).emit("call-response", {
      calleeId: socket.user._id,
      accepted,
    });
  });

  // ICE/SDP signal transfer
  socket.on("signal-data", ({ targetId, signal }) => {
    io.to(targetId).emit("signal-data", {
      senderId: callerId,
      signal,
    });
  });

  // Leave the call room
  socket.on("leave-room", ({ targetId }) => {
    io.to(targetId).emit("user-left", { userId: callerId });
  });

  // Optional chat presence notification
  socket.on("chat-left", ({ friendId }) => {
    io.to(friendId).emit("notify-chat-left", { userId: callerId });
  });
};
