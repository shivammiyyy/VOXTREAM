import API from "./api";

// Get users not friends + no requests
export const getRecommendedUsers = async () => {
  const res = await API.get("/users/recommended", {
    withCredentials: true,
  });
  return res.data;
};


// Get friend list of current user
export const getFriends = async () => {
  const res = await API.get("/users/friends");
  return res.data.friends;
};
