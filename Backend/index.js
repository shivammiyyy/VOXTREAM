import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import chatRoutes from "./routes/chat.routes.js";

// Socket Handlers
import { registerChatHandlers } from "./sockets/chatHandler.js";
import { registerCallHandlers } from "./sockets/callHandler.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

// === Socket.IO Setup ===
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// === MongoDB Connection ===
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// === Middleware ===
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// === API Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chat", chatRoutes);

// === Socket.IO Auth Middleware ===
io.use((socket, next) => {
  const token = socket.handshake.headers.cookie
    ?.split("; ")
    ?.find(row => row.startsWith("access_token="))
    ?.split("=")[1];
  if (!token) return next(new Error("Unauthorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = { _id: decoded.userId };
    next();
  } catch {
    return next(new Error("Invalid token"));
  }
});

// === Socket.IO Event Handlers ===
io.on("connection", socket => {
  console.log("🔌 Socket connected:", socket.id);
  
  // *** MAJOR FIX ***
  // The user joins a room named after their own user ID.
  // This allows us to send events directly to this user using `io.to(userId).emit(...)`.
  // This is essential for call signaling (e.g., 'call-request').
  const userId = socket.user._id.toString();
  socket.join(userId);
  console.log(`✅ User ${userId} joined their personal room: ${userId}`);


  // Register all other event handlers
  registerChatHandlers(socket, io);
  registerCallHandlers(socket, io);
  
  // Optional: Handle the 'new-connection' event if you want to track online status
  socket.on("new-connection", () => {
    // This event is sent from the frontend. You can use it to broadcast presence.
    // For example, notify friends that this user is online.
    console.log(`User ${userId} signaled a new connection.`);
    // Example: io.to(friendsList).emit('friend-online', { userId });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    // You could also emit a 'friend-offline' event here.
  });
});

// === Start Server ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});