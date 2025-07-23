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
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// === Mongoose Setup ===
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
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

// === WebSocket Auth Middleware ===
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

// === Socket.IO Connection ===
io.on("connection", socket => {
  console.log("🔌 New socket connected:", socket.id);

  // Register custom handlers
  registerChatHandlers(socket, io);
  registerCallHandlers(socket, io);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:${PORT}`));
io.listen(PORT+1,()=>console.log(`Socket is running`))
