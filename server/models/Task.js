const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'creative'],
    default: 'work'
  },
  urgency: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  importance: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  deadline: {
    type: Date,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: isOverdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.deadline || this.completed) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(this.deadline);
  dl.setHours(0, 0, 0, 0);
  return dl < now;
});

// Virtual: priorityScore (AI engine)
taskSchema.virtual('priorityScore').get(function() {
  let score = 0;
  score += this.importance * 0.4;
  score += this.urgency * 0.3;
  if (this.deadline) {
    const now = new Date(); now.setHours(0,0,0,0);
    const dl = new Date(this.deadline); dl.setHours(0,0,0,0);
    const diff = Math.ceil((dl - now) / 86400000);
    if (diff < 0) score += 3.0;
    else if (diff === 0) score += 2.5;
    else if (diff === 1) score += 2.0;
    else if (diff <= 3) score += 1.4;
    else if (diff <= 7) score += 0.7;
    else score += 0.15;
  }
  return Math.round(score * 100) / 100;
});

module.exports = mongoose.model('Task', taskSchema);
