import express from "express";
import {
  register,
  login,
  me,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Register new user
router.post("/register", register);

// Login existing user
router.post("/login", login);

// Get current logged-in user profile (protected)
router.get("/me", protect, me);

// Update user profile (protected)
router.put("/profile", protect, updateProfile);

export default router;
