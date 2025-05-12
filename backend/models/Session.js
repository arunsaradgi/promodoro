const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  type: {
    type: String,
    enum: ['work', 'break', 'longBreak'],
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'interrupted', 'aborted'],
    required: true
  },
  interruptionReason: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema); 