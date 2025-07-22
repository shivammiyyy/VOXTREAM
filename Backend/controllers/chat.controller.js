import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

// === Save Message ===
// export const saveMessage = async (senderId, receiverId, content) => {
//   try {
//     const message = await Message.create({
//       sender: senderId,
//       receiver: receiverId,
//       content,
//       status: "sent",
//     });
//     return message;
//   } catch (error) {
//     console.error("Error saving message:", error);
//     return null;
//   }
// };

// === Get Chat History ===
export const getChatHistory = async (req, res) => {
  try {
    const { userId: receiverId } = req.params;
    const senderId = req.user._id;

    // Verify they are friends
    const user = await User.findById(senderId);
    if (!user.friends.includes(receiverId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
