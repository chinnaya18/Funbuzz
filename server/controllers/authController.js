const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Participant = require('../models/Participant');

// Admin & Scorer login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || 'admin', username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role || 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Scorer / Mark Provider specific login
exports.scorerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ 
      username: username.toLowerCase().trim(),
      role: { $in: ['scorer', 'admin'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or not authorized as Mark Provider' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Participant login — supports Roll Number + Name OR Roll Number + Passcode
exports.participantLogin = async (req, res) => {
  try {
    const { name, rollNumber, pass, passcode, password } = req.body;
    const passInput = pass || passcode || password;

    if (!rollNumber) {
      return res.status(400).json({ message: 'Roll Number is required' });
    }

    const participant = await Participant.findOne({
      rollNumber: rollNumber.toUpperCase().trim()
    });

    if (!participant) {
      return res.status(404).json({ message: `Participant with Roll No "${rollNumber.toUpperCase()}" not found` });
    }

    // If name is supplied, verify it matches
    if (name && name.trim()) {
      if (participant.name.toLowerCase() !== name.trim().toLowerCase()) {
        return res.status(401).json({ message: 'Name does not match this Roll Number' });
      }
    }

    // If pass is supplied, verify it matches
    if (passInput && passInput.trim()) {
      const storedPass = participant.passcode || 'funbuzz2026';
      if (storedPass.toLowerCase() !== passInput.trim().toLowerCase()) {
        return res.status(401).json({ message: 'Invalid event pass code' });
      }
    }

    const token = jwt.sign(
      { id: participant._id, role: 'participant', name: participant.name, rollNumber: participant.rollNumber },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: participant._id,
        name: participant.name,
        rollNumber: participant.rollNumber,
        passcode: participant.passcode || 'funbuzz2026',
        role: 'participant'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get demo accounts for quick testing/seeding reference across all modules
exports.getDemoAccounts = async (req, res) => {
  try {
    const participants = await Participant.find({}).limit(6).select('name rollNumber passcode');
    const admins = await User.find({ role: 'admin' }).select('username role');
    const scorers = await User.find({ role: 'scorer' }).select('username role');
    
    res.json({
      admins: admins.map(u => ({ username: u.username, pass: u.username === 'admin' ? 'admin123' : 'superadmin123' })),
      scorers: scorers.map(u => ({ username: u.username, pass: u.username === 'scorer' ? 'scorer123' : 'evaluator123' })),
      participants: participants.map(p => ({
        name: p.name,
        rollNumber: p.rollNumber,
        passcode: p.passcode || 'pass101'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
