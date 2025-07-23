import API from "./axios";

// Get users not friends + no requests
export const getRecommendedUsers = async () => {
  const res = await API.get("/users/recommended");
  return res.data.users;
};

// Get friend list of current user
export const getFriends = async () => {
  const res = await API.get("/users/friends");
  return res.data.friends;
};
