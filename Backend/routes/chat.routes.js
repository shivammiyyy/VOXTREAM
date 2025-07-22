import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();

// GET /api/chat/:userId → fetch chat history with a friend
router.get("/:userId", protectRoute, getChatHistory);

export default router;
