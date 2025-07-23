import User from "../models/userModel.js";
import FriendRequest from "../models/friendRequestModel.js";

// === Get Recommended Users ===
// Users who are not friends and have no friend request (either direction)
export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId);
    const friendIds = user.friends.map(id => id.toString());

    const sentRequests = await FriendRequest.find({ sender: currentUserId }).select("receiver");
    const receivedRequests = await FriendRequest.find({ receiver: currentUserId }).select("sender");

    const sentIds = sentRequests.map(req => req.receiver.toString());
    const receivedIds = receivedRequests.map(req => req.sender.toString());

    const excludeIds = new Set([
      ...friendIds,
      ...sentIds,
      ...receivedIds,
      currentUserId.toString(),
    ]);

    const users = await User.find({ _id: { $nin: [...excludeIds] } })
      .select("-password")
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).json({ message: "Failed to fetch recommended users" });
  }
};


// === Get Friend List ===
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "-password")
      .select("friends");

    res.json(user.friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
};
