export const registerCallHandlers = (socket, io) => {
  // NOTE: The logic here relies on the connected user having already joined
  // a room named after their own user ID. This is now handled in index.js.
  const callerId = socket.user._id.toString();

  socket.on("call-request", ({ calleeId }) => {
    // This emit will now work because the callee joined a room with their ID on connection.
    io.to(calleeId).emit("call-request", {
      callerId,
      socketId: socket.id,
    });
  });

  socket.on("call-response", ({ callerId, accepted }) => {
    // This also works because the original caller is in their own room.
    io.to(callerId).emit("call-response", {
      calleeId: socket.user._id,
      accepted,
    });
  });

  socket.on("signal-data", ({ targetId, signal }) => {
    io.to(targetId).emit("signal-data", {
      senderId: callerId,
      signal,
    });
  });

  socket.on("leave-room", ({ targetId }) => {
    io.to(targetId).emit("user-left", { userId: callerId });
  });

  socket.on("chat-left", ({ friendId }) => {
    io.to(friendId).emit("notify-chat-left", { userId: callerId });
  });
};