import express from "express";
import { 
  getHabits, 
  createHabit, 
  updateHabit, 
  deleteHabit, 
  archiveHabit, 
  reorderHabits 
} from "../controllers/habitController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// CRUD routes
router.get("/", getHabits);            // Get all habits
router.post("/", createHabit);         // Create a new habit
router.put("/:id", updateHabit);       // Update a habit
router.delete("/:id", deleteHabit);    // Delete a habit

// Extra routes
router.put("/:id/archive", archiveHabit);  // Archive/unarchive a habit
router.put("/reorder", reorderHabits);     // Reorder habits

export default router;
