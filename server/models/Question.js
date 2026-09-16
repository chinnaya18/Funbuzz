const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['chill', 'blaze', 'savage', 'brutal', 'legendary']
  },
  questionId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  questionText: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'selected', 'completed'],
    default: 'available'
  }
}, { timestamps: true });

// Compound index to prevent duplicate question numbers per difficulty
questionSchema.index({ difficulty: 1, questionNumber: 1 }, { unique: true });

module.exports = mongoose.model('Question', questionSchema);
