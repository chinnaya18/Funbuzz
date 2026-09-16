const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['waiting', 'running', 'paused', 'ended'],
    default: 'waiting'
  },
  name: {
    type: String,
    default: 'Fun Event Bonus Round'
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
