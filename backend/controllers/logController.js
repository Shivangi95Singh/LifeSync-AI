import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import { todayKey,last90Days,lastNDays,calcStreak } from "../utils/dateHelpers.js";

// Mark a habit as completed
export const markComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();

    // Ensure habit belongs to the logged-in user
    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user._id,   // ✅ use req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Upsert a log entry (create if not exists)
    const log = await HabitLog.findOneAndUpdate(
      { userId: req.user._id, habitId, completedDate },
      { $setOnInsert: { userId: req.user._id, habitId, completedDate } },
      { upsert: true, new: true }
    );

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const unmarkComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();
     await HabitLog.findOneAndDelete({
      userId: req.user._id,
      habitId,
      completedDate,
    });
    res.json({ message: "Unmarked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getToday = async (req, res) => {
  try {
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: todayKey(),
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get logs within a date range
export const getRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    // if (!start || !end) {
    //   return res.status(400).json({ message: "Start and end dates are required" });
    // }

    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: start, $lte: end },
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get heatmap data for last 90 days
export const getHeatmap = async (req, res) => {
  try {
    const days = last90Days(); // array of YYYY-MM-DD
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: days[0], $lte: days[days.length - 1] },
    });

    // Count completions per day
    const counts = {};
    for (const d of days) counts[d] = 0;
    for (const l of logs) {
      counts[l.completedDate] = (counts[l.completedDate] || 0) + 1;
    }

    // Format for frontend heatmap
    const data = days.map(d => ({ date: d, count: counts[d] || 0 }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabitStats = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.habitId,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Fetch all logs for this habit
    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId: habit._id,
    }).sort({completedDate:-1});

    // Extract completed dates
    const dateKeys = logs.map((l) => l.completedDate);

    // Calculate streaks
    const { current, longest } = calcStreak(dateKeys);

    // Calculate completion rate (from habit creation until today)
    const createdKey=habit.createdAt.toISOString().slice(0,10);
    const today=todayKey();
    const start = new Date(createdKey);
    const end = new Date(today);
    const totalDays = Math.max(1,Math.round((end - start) / (1000 * 60 * 60 * 24))) + 1;
    const completionRate = Math.round((logs.length / totalDays) * 100);

    // Monthly breakdown (last 6 months)
    const monthly = {};
    for (const l of logs) {
      const m= l.completedDate.slice(0, 7); // YYYY-MM
      monthly[m] = (monthly[m] || 0) + 1;
    }

    res.json({
      habit,
      totalCompletions: logs.length,
      currentStreak: current,
      longestStreak: longest,
      completionRate,
      monthly,
    });
    
     
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const getAllStats = async (req, res) => {
  try {
    // Fetch all active habits for the user
    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });

    // Define the time window (last 30 days)
    const days = lastNDays(30);

    // Fetch logs for those days
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: days[0], $lte: days[days.length - 1] },
    });

    // Build stats per habit
    const perHabit = habits.map((h) => {
      const hLogs = logs.filter((l) => String(l.habitId) === String(h._id));
      const keys = hLogs.map((l) => l.completedDate).sort().reverse();
      const { current, longest } = calcStreak(keys);

      return {
        habitId: h._id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        category: h.category,
        completions30d: hLogs.length,
        currentStreak: current,
        longestStreak: longest,
      };
    });

    res.json({ perHabit, days });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
