import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workDuration: {
    type: Number,
    default: 25,
    min: 1,
    max: 60
  },
  breakDuration: {
    type: Number,
    default: 5,
    min: 1,
    max: 30
  },
  longBreakDuration: {
    type: Number,
    default: 15,
    min: 1,
    max: 60
  },
  sessionsUntilLongBreak: {
    type: Number,
    default: 4,
    min: 1,
    max: 10
  },
  notifications: {
    type: Boolean,
    default: true
  },
  sound: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Ensure one settings document per user
settingsSchema.index({ user: 1 }, { unique: true })

const Settings = mongoose.model('Settings', settingsSchema)

export default Settings 