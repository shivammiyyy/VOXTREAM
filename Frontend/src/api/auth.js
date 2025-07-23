import API from "./axios";

// Signup a new user
export const signupUser = async (userData) => {
  const res = await API.post("/auth/signup", userData);
  return res.data;
};

// Login with credentials
export const loginUser = async (credentials) => {
  const res = await API.post("/auth/login", credentials);
  return res.data;
};

// Logout user
export const logoutUser = async () => {
  await API.post("/auth/logout");
};

// Onboarding info (bio, hobbies, etc.)
export const completeOnboarding = async (profileData) => {
  const res = await API.post("/auth/onboarding", profileData);
  return res.data;
};

// Get current user from cookie session
export const getCurrentUser = async () => {
  const res = await API.get("/auth/me");
  return res.data.user;
};
