import API from "./axios";

// Send a friend request
export const sendFriendRequest = async (receiverId) => {
  const res = await API.post("/friends/send", { receiverId });
  return res.data;
};

// Accept a friend request
export const acceptFriendRequest = async (requestId) => {
  const res = await API.post("/friends/accept", { requestId });
  return res.data;
};

// Reject/Delete a request
export const deleteFriendRequest = async (requestId) => {
  const res = await API.delete("/friends/delete", {
    data: { requestId },
  });
  return res.data;
};

// Get incoming requests to this user
export const getIncomingRequests = async () => {
  const res = await API.get("/friends/incoming");
  return res.data.requests;
};
