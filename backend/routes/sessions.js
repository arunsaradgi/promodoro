const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');

// Start a new session
router.post('/', auth, async (req, res) => {
  try {
    const { type, duration } = req.body;
    const session = new Session({
      user: req.user._id,
      startTime: new Date(),
      type,
      status: 'in_progress',
      duration
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// End a session
router.patch('/:id/end', auth, async (req, res) => {
  try {
    const { status, interruptionReason } = req.body;
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.endTime = new Date();
    session.status = status;
    if (interruptionReason) {
      session.interruptionReason = interruptionReason;
    }
    
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's sessions
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };
    
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await Session.find(query).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get session statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };
    
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await Session.find(query);
    
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      interruptedSessions: sessions.filter(s => s.status === 'interrupted').length,
      abortedSessions: sessions.filter(s => s.status === 'aborted').length,
      totalFocusTime: sessions.reduce((acc, session) => acc + session.duration, 0),
      averageSessionDuration: sessions.reduce((acc, session) => acc + session.duration, 0) / sessions.length || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 