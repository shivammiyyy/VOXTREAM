import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  logoutUser,
  signupUser,
  completeOnboarding,
  getCurrentUser,
} from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user on initial mount
  useEffect(() => {
    getCurrentUser()
      .then((user) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res.user);
    return res;
  };

  const signup = async (data) => {
    const res = await signupUser(data);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const onboard = async (data) => {
    const res = await completeOnboarding(data);
    setUser(res.user);
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, onboard, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
