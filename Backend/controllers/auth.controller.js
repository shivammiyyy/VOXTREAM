import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// === Helper: Create and Set Cookie ===
const setAuthCookie = (res, token) => {
  res.cookie("access_token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,                 // Prevent JS access (XSS protection)
    sameSite: "none",             // CSRF protection
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
  });
};

// === Signup ===
export const signup = async (req, res) => {
  const { email, fullName, username, password } = req.body;

  try {
    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a different one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      username,
      password,
      profilePic: randomAvatar,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);

    const userToReturn = await User.findById(newUser._id).select("-password");

    res.status(201).json({ success: true, user: userToReturn });
  } catch (error) {
    console.error("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === Login ===
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);

    const userToReturn = await User.findById(user._id).select("-password");

    res.status(200).json({ success: true, user: userToReturn });
  } catch (error) {
    console.error("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === Logout ===
export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true, message: "Logout successful" });
};

// === Onboarding ===
export const onBoarding = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { fullName, location, bio, hobbies } = req.body;

    if (!fullName || !bio || !hobbies || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !hobbies && "hobbies",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// === Get Current User ===
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
