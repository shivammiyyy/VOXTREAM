import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getRecommendedUsers,
  getFriends
} from "../controllers/user.controller.js";

const router = express.Router();

// Protected routes
router.get("/recommended", protectRoute, getRecommendedUsers);
router.get("/friends", protectRoute, getFriends);

export default router;
