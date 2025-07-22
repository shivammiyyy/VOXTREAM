import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export const registerChatHandlers = (socket, io) => {
  const senderId = socket.user._id.toString();

  // === Direct Message ===
  socket.on("direct-message", async ({ receiverId, content }) => {
    try {
      // Verify sender and receiver are friends
      const sender = await User.findById(senderId);
      if (!sender.friends.includes(receiverId)) {
        return socket.emit("error", { message: "You are not friends with this user" });
      }

      // Save to DB
      const message = await Message.create({ sender: senderId, receiver: receiverId, content });

      // Emit to receiver if connected
      io.to(receiverId).emit("direct-message", {
        senderId,
        content,
        timestamp: message.timestamp,
      });
    } catch (err) {
      console.error("Socket direct-message error:", err);
      socket.emit("error", { message: "Message failed to send" });
    }
  });

  // === Direct Chat History ===
  socket.on("direct-chat-history", async ({ receiverId }) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).sort({ timestamp: 1 });

      socket.emit("direct-chat-history", { receiverId, messages });
    } catch (err) {
      console.error("Chat history error:", err);
      socket.emit("error", { message: "Failed to load chat history" });
    }
  });
};
