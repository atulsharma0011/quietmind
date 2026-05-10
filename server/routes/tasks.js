const express = require('express');
const Task = require('../models/Task');
const Mood = require('../models/Mood');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/tasks — all tasks for user
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) { next(err); }
});

// POST /api/tasks — create task
router.post('/', async (req, res, next) => {
  try {
    const { name, category, urgency, importance, deadline } = req.body;
    if (!name) return res.status(400).json({ error: 'Task name is required.' });
    const task = await Task.create({
      user: req.user._id,
      name: name.trim(),
      category: category || 'work',
      urgency: Number(urgency) || 3,
      importance: Number(importance) || 3,
      deadline: deadline ? new Date(deadline) : null
    });
    res.status(201).json({ task });
  } catch (err) { next(err); }
});

// PATCH /api/tasks/:id — update (complete/uncomplete or edit)
router.patch('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    if (typeof req.body.completed === 'boolean') {
      task.completed = req.body.completed;
      task.completedAt = req.body.completed ? new Date() : null;
    }
    ['name', 'category', 'urgency', 'importance', 'deadline'].forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    res.json({ task });
  } catch (err) { next(err); }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted.', id: req.params.id });
  } catch (err) { next(err); }
});

// GET /api/tasks/suggest — AI suggestion
router.get('/suggest', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id, completed: false });
    const today = new Date().toISOString().split('T')[0];
    const moodEntry = await Mood.findOne({ user: req.user._id, date: today });
    const mood = moodEntry ? moodEntry.mood : null;

    if (!tasks.length) {
      return res.json({ task: null, reason: 'No pending tasks.' });
    }

    // Score and sort
    const scored = tasks.map(t => {
      let score = t.importance * 0.4 + t.urgency * 0.3;
      if (t.deadline) {
        const now = new Date(); now.setHours(0,0,0,0);
        const dl = new Date(t.deadline); dl.setHours(0,0,0,0);
        const diff = Math.ceil((dl - now) / 86400000);
        if (diff < 0) score += 3.0;
        else if (diff === 0) score += 2.5;
        else if (diff === 1) score += 2.0;
        else if (diff <= 3) score += 1.4;
        else if (diff <= 7) score += 0.7;
        else score += 0.15;
      }
      if (mood === 'stressed') {
        if (t.urgency <= 2 && t.importance <= 3) score *= 1.3;
        else if (t.urgency >= 4) score *= 0.7;
      } else if (mood === 'happy') {
        score *= 1.05;
      }
      return { task: t, score: Math.round(score * 100) / 100 };
    }).sort((a, b) => b.score - a.score);

    const { task, score } = scored[0];
    let reason = '';
    if (task.deadline) {
      const now = new Date(); now.setHours(0,0,0,0);
      const dl = new Date(task.deadline); dl.setHours(0,0,0,0);
      const diff = Math.ceil((dl - now) / 86400000);
      if (diff < 0) reason = `This task is overdue by ${Math.abs(diff)} day(s) and needs immediate attention.`;
      else if (diff === 0) reason = 'This task is due today — best to tackle it now.';
      else if (diff === 1) reason = 'Due tomorrow. Starting now gives you breathing room.';
      else reason = `Due in ${diff} days, but it's your highest priority right now (importance ${task.importance}/5).`;
    } else {
      reason = `This is your most important pending task (importance: ${task.importance}/5, urgency: ${task.urgency}/5).`;
    }
    if (mood === 'stressed') {
      reason += " Your stress level was factored in — this task was chosen because it's manageable.";
    }

    res.json({ task: { ...task.toJSON(), priorityScore: score }, reason, mood });
  } catch (err) { next(err); }
});

module.exports = router;
