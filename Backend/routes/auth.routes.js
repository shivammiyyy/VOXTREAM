import express from "express";

import { protectRoute } from "../middlewares/auth.middleware.js";
import { login, logout, onBoarding, signup } from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected route
router.post("/onboarding", protectRoute, onBoarding);

export default router;
