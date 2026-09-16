const Participant = require('../models/Participant');
const Score = require('../models/Score');

// Get all participants
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const participants = await Participant.find(query).sort({ name: 1 });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single participant
exports.getById = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    res.json(participant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create participant
exports.create = async (req, res) => {
  try {
    const { name, rollNumber } = req.body;

    if (!name || !rollNumber) {
      return res.status(400).json({ message: 'Name and Roll Number are required' });
    }

    // Check if roll number already exists
    const existing = await Participant.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'A participant with this Roll Number already exists' });
    }

    const participant = await Participant.create({
      name: name.trim(),
      rollNumber: rollNumber.toUpperCase()
    });

    // Create empty score record
    await Score.create({ participantId: participant._id });

    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk create participants
exports.bulkCreate = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'An array of participants is required' });
    }

    const created = [];
    const errors = [];

    for (const p of participants) {
      try {
        const existing = await Participant.findOne({ rollNumber: p.rollNumber?.toUpperCase() });
        if (existing) {
          errors.push(`${p.rollNumber} already exists`);
          continue;
        }

        const participant = await Participant.create({
          name: p.name?.trim(),
          rollNumber: p.rollNumber?.toUpperCase()
        });

        await Score.create({ participantId: participant._id });
        created.push(participant);
      } catch (err) {
        errors.push(`${p.rollNumber}: ${err.message}`);
      }
    }

    res.status(201).json({ created: created.length, errors });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update participant
exports.update = async (req, res) => {
  try {
    const { name, rollNumber } = req.body;
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      { name: name?.trim(), rollNumber: rollNumber?.toUpperCase() },
      { new: true, runValidators: true }
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.json(participant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete participant
exports.remove = async (req, res) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Also delete their score
    await Score.findOneAndDelete({ participantId: req.params.id });

    res.json({ message: 'Participant deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
