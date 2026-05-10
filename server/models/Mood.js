const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mood: {
    type: String,
    enum: ['happy', 'neutral', 'stressed'],
    required: [true, 'Mood value is required']
  },
  date: {
    type: String, // 'YYYY-MM-DD' — one per user per day enforced via unique index
    required: true
  }
}, {
  timestamps: true
});

// Enforce one mood per user per day at the DB level
moodSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Mood', moodSchema);
