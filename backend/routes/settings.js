import express from 'express'
import Settings from '../models/Settings.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id })
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings({ user: req.user._id })
      await settings.save()
    }
    
    res.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user settings
router.put('/', auth, async (req, res) => {
  try {
    console.log('Received settings update request:', req.body) // Debug log

    const {
      workDuration,
      breakDuration,
      longBreakDuration,
      sessionsUntilLongBreak,
      notifications,
      sound
    } = req.body

    let settings = await Settings.findOne({ user: req.user._id })
    
    if (!settings) {
      settings = new Settings({ user: req.user._id })
    }

    // Update fields if they exist in the request
    if (workDuration !== undefined) settings.workDuration = workDuration
    if (breakDuration !== undefined) settings.breakDuration = breakDuration
    if (longBreakDuration !== undefined) settings.longBreakDuration = longBreakDuration
    if (sessionsUntilLongBreak !== undefined) settings.sessionsUntilLongBreak = sessionsUntilLongBreak
    if (notifications !== undefined) settings.notifications = notifications
    if (sound !== undefined) settings.sound = sound

    console.log('Saving settings:', settings) // Debug log
    await settings.save()
    console.log('Settings saved successfully') // Debug log

    res.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

export default router 