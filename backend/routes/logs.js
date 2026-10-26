import express from "express";

import {
  markComplete,
  unmarkComplete,
  getToday,
  getRange,
  getHeatmap,
  getAllStats,
  getHabitStats
} from "../controllers/logController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Habit log actions
router.post("/", markComplete);
router.delete("/", unmarkComplete);

// Log queries
router.get("/today", getToday);
router.get("/range", getRange);
router.get("/heatmap", getHeatmap);

// Stats
router.get("/stats", getAllStats);          // dashboard summary
router.get("/stats/:habitId", getHabitStats); // single habit stats

export default router;
