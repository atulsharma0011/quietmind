const express = require('express');
const Task = require('../models/Task');
const Mood = require('../models/Mood');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/insights — 7-day analytics
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const [allTasks, weekMoods] = await Promise.all([
      Task.find({ user: req.user._id }),
      Mood.find({ user: req.user._id, date: { $gte: weekAgoStr } })
    ]);

    const weekTasks = allTasks.filter(t => new Date(t.createdAt) >= weekAgo);
    const completed = weekTasks.filter(t => t.completed).length;
    const total = weekTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Busiest day
    const dayMap = {};
    weekTasks.forEach(t => {
      const day = new Date(t.createdAt).toLocaleDateString('en', { weekday: 'long' });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const busiestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0] || null;

    const stressedDays = weekMoods.filter(m => m.mood === 'stressed').length;

    // Daily data for charts (last 7 days)
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const ds = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      const dayCompleted = allTasks.filter(t => t.completedAt && new Date(t.completedAt).toISOString().startsWith(ds)).length;
      const moodEntry = weekMoods.find(m => m.date === ds);
      daily.push({ day: label, completed: dayCompleted, mood: moodEntry ? moodEntry.mood : null, dateStr: ds });
    }

    // Suggestions
    const suggestions = [];
    if (rate < 50 && total > 3) suggestions.push('Try limiting yourself to just 3 tasks per day. Small wins build momentum.');
    if (stressedDays >= 3) suggestions.push('Stress appeared frequently this week. Consider lighter task loads on tough days.');
    if (rate > 80 && total >= 5) suggestions.push('Outstanding completion rate! You might have capacity for one more task per day.');
    if (total < 3) suggestions.push('Add a few more tasks this week to get clearer productivity insights.');
    if (busiestDay && busiestDay[1] >= 4) suggestions.push(`${busiestDay[0]} tends to be overloaded. Try spreading tasks more evenly.`);
    if (!suggestions.length) suggestions.push("You're maintaining a balanced, healthy workload. Keep it up.");

    // Category breakdown
    const catMap = { work: 0, personal: 0, health: 0, creative: 0 };
    weekTasks.filter(t => t.completed).forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + 1; });

    res.json({
      totalTasks: total,
      completedTasks: completed,
      completionRate: rate,
      busiestDay,
      stressedDays,
      totalMoodLogs: weekMoods.length,
      daily,
      suggestions,
      categoryBreakdown: catMap
    });
  } catch (err) { next(err); }
});

module.exports = router;
