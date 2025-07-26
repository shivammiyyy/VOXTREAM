import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { getRoomId } from "../utils/getRoomId.js";

export const registerChatHandlers = (socket, io) => {
  const senderId = socket.user._id.toString();

  socket.on("join-room", ({ friendId }) => {
    const roomId = getRoomId(senderId, friendId);
    socket.join(roomId);
    console.log(`✅ User ${senderId} joined room: ${roomId}`);
  });

  socket.on("direct-message", async ({ receiverId, content }) => {
    try {
      const sender = await User.findById(senderId);
      if (!sender.friends.includes(receiverId)) {
        return socket.emit("error", { message: "You are not friends with this user" });
      }

      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
      });

      const roomId = getRoomId(senderId, receiverId);

      io.to(roomId).emit("direct-message", {
        sender: senderId,
        receiver: receiverId,
        content,
        timestamp: message.timestamp,
      });
    } catch (err) {
      console.error("Socket direct-message error:", err);
      socket.emit("error", { message: "Message failed to send" });
    }
  });

  socket.on("direct-chat-history", async ({ receiverId }) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).sort({ timestamp: 1 });

      socket.emit("direct-chat-history", {
        receiverId,
        messages,
      });
    } catch (err) {
      console.error("Chat history error:", err);
      socket.emit("error", { message: "Failed to load chat history" });
    }
  });
};
