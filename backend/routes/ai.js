import express from "express";
import {
  weeklyReport,
  suggestHabits,
  recoveryPlan,
  chatAnalysis,
  morningMotivation,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protect all AI routes with authentication
router.use(protect);

// Weekly AI report
router.post("/weekly-report", weeklyReport);

// AI habit suggestions
router.post("/suggest-habits", suggestHabits);

// Recovery plan for a habit
router.post("/recovery-plan", recoveryPlan);

// Chat-based analysis/Q&A
router.post("/chat", chatAnalysis);

// Morning motivational message
router.get("/morning", morningMotivation);

export default router;
