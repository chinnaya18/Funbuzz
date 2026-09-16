const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  passcode: {
    type: String,
    default: 'funbuzz2026',
    trim: true
  }
}, { timestamps: true });

// Composite index for fast lookup during login
participantSchema.index({ name: 1, rollNumber: 1 });

module.exports = mongoose.model('Participant', participantSchema);
