const express = require('express');
const Mood = require('../models/Mood');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/moods — history (last 30 days)
router.get('/', async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceStr = since.toISOString().split('T')[0];
    const moods = await Mood.find({
      user: req.user._id,
      date: { $gte: sinceStr }
    }).sort({ date: -1 });
    res.json({ moods });
  } catch (err) { next(err); }
});

// GET /api/moods/today — today's mood
router.get('/today', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const entry = await Mood.findOne({ user: req.user._id, date: today });
    res.json({ mood: entry ? entry.mood : null });
  } catch (err) { next(err); }
});

// POST /api/moods — log mood (upsert for today)
router.post('/', async (req, res, next) => {
  try {
    const { mood } = req.body;
    if (!['happy', 'neutral', 'stressed'].includes(mood)) {
      return res.status(400).json({ error: 'Invalid mood. Must be happy, neutral, or stressed.' });
    }
    const today = new Date().toISOString().split('T')[0];
    const entry = await Mood.findOneAndUpdate(
      { user: req.user._id, date: today },
      { mood, date: today, user: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ mood: entry });
  } catch (err) { next(err); }
});

module.exports = router;
