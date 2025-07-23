import FriendRequest from "../models/friendRequestModel.js";
import User from "../models/userModel.js";

// === Send Friend Request ===
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const alreadyFriends = req.user.friends.includes(receiverId);
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (alreadyFriends || existingRequest) {
      return res.status(400).json({ message: "Already friends or request exists" });
    }

    const newRequest = await FriendRequest.create({ sender: senderId, receiver: receiverId });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Send Friend Request Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// === Accept Friend Request ===
export const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);
    if (!request || request.receiver.toString() !== receiverId.toString()) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    await Promise.all([
      User.findByIdAndUpdate(receiverId, { $push: { friends: request.sender } }),
      User.findByIdAndUpdate(request.sender, { $push: { friends: receiverId } }),
      FriendRequest.findByIdAndDelete(requestId),
    ]);

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept Friend Request Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// === Reject/Delete Friend Request ===
export const deleteFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.body;

    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const isSender = request.sender.toString() === userId.toString();
    const isReceiver = request.receiver.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }

    await FriendRequest.findByIdAndDelete(requestId);
    res.status(200).json({ message: "Friend request deleted" });
  } catch (error) {
    console.error("Delete Friend Request Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// === Get Incoming Friend Requests ===
export const getIncomingRequests = async (req, res) => {
  try {
    const receiverId = req.user._id;

    const requests = await FriendRequest.find({ receiver: receiverId })
      .populate("sender", "-password");

    res.json(requests);
  } catch (error) {
    console.error("Fetch Requests Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOutgoingRequests = async (req, res) => {
  try {
    const senderId = req.user._id;

    const requests = await FriendRequest.find({ sender: senderId })
      .populate("receiver", "-password");

    res.json(requests);
  } catch (error) {
    console.error("Fetch Requests Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
