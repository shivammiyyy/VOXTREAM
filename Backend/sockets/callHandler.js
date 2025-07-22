export const registerCallHandlers = (socket, io) => {
  const callerId = socket.user._id.toString();

  // === Notify user is available (used in new-connection handler)
  io.to(callerId).emit("notify-connected-socket", { socketId: socket.id });

  // === Call Request ===
  socket.on("call-request", ({ calleeId }) => {
    io.to(calleeId).emit("call-request", {
      callerId,
      socketId: socket.id,
    });
  });

  // === Call Response (accept or reject) ===
  socket.on("call-response", ({ callerId, accepted }) => {
    io.to(callerId).emit("call-response", {
      calleeId: socket.user._id,
      accepted,
    });
  });

  // === Signal Data (ICE candidates / SDP) ===
  socket.on("signal-data", ({ targetId, signal }) => {
    io.to(targetId).emit("signal-data", {
      senderId: callerId,
      signal,
    });
  });

  // === Leave Call / Room ===
  socket.on("leave-room", ({ targetId }) => {
    io.to(targetId).emit("user-left", { userId: callerId });
  });

  // === Notify chat left (optional UI enhancement) ===
  socket.on("chat-left", ({ friendId }) => {
    io.to(friendId).emit("notify-chat-left", { userId: callerId });
  });
};
