const mongoose = require('mongoose');

const scoreHistorySchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['chill', 'blaze', 'savage', 'brutal', 'legendary'],
    required: true
  },
  previousScore: {
    type: Number,
    required: true
  },
  newScore: {
    type: Number,
    required: true
  }
}, { timestamps: true });

scoreHistorySchema.index({ participantId: 1, createdAt: -1 });

module.exports = mongoose.model('ScoreHistory', scoreHistorySchema);
