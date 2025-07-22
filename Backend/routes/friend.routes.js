import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriendRequest,
  getIncomingRequests
} from "../controllers/friend.controller.js";

const router = express.Router();

// All routes below are protected
router.use(protectRoute);

// Send a friend request
router.post("/send", sendFriendRequest);

// Accept a friend request
router.post("/accept", acceptFriendRequest);

// Reject/Delete a request (either sender or receiver)
router.delete("/delete", deleteFriendRequest);

// Get incoming friend requests
router.get("/incoming", getIncomingRequests);

export default router;
