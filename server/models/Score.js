const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true,
    unique: true
  },
  scores: {
    chill: { type: Number, default: 0, min: 0 },
    blaze: { type: Number, default: 0, min: 0 },
    savage: { type: Number, default: 0, min: 0 },
    brutal: { type: Number, default: 0, min: 0 },
    legendary: { type: Number, default: 0, min: 0 }
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

// Auto-calculate totalScore before saving
scoreSchema.pre('save', function(next) {
  this.totalScore =
    (this.scores.chill || 0) +
    (this.scores.blaze || 0) +
    (this.scores.savage || 0) +
    (this.scores.brutal || 0) +
    (this.scores.legendary || 0);
  next();
});

scoreSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.$set && update.$set.scores) {
    const s = update.$set.scores;
    update.$set.totalScore =
      (s.chill || 0) +
      (s.blaze || 0) +
      (s.savage || 0) +
      (s.brutal || 0) +
      (s.legendary || 0);
  }
  next();
});

module.exports = mongoose.model('Score', scoreSchema);
