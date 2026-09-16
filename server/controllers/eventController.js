const Event = require('../models/Event');
const Score = require('../models/Score');
const Question = require('../models/Question');

// Get event status
exports.getStatus = async (req, res) => {
  try {
    let event = await Event.findOne();
    if (!event) {
      event = await Event.create({ status: 'waiting' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update event status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['waiting', 'running', 'paused', 'ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid event status' });
    }

    let event = await Event.findOne();
    if (!event) {
      event = await Event.create({ status });
    } else {
      event.status = status;
      await event.save();
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('event:statusChanged', { status });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset event — reset scores and questions but keep participants
exports.resetEvent = async (req, res) => {
  try {
    // Reset event status
    let event = await Event.findOne();
    if (event) {
      event.status = 'waiting';
      await event.save();
    }

    // Reset all scores to 0
    await Score.updateMany({}, {
      $set: {
        'scores.chill': 0,
        'scores.blaze': 0,
        'scores.savage': 0,
        'scores.brutal': 0,
        'scores.legendary': 0,
        totalScore: 0
      }
    });

    // Reset all questions to available
    await Question.updateMany({}, { status: 'available' });

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      io.emit('event:statusChanged', { status: 'waiting' });
      io.emit('leaderboard:updated', []);
    }

    res.json({ message: 'Event reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
