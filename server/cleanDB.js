require('dotenv').config();
const connectDB = require('./config/db');
const Participant = require('./models/Participant');
const Score = require('./models/Score');
const ScoreHistory = require('./models/ScoreHistory');
const Question = require('./models/Question');
const Event = require('./models/Event');
const User = require('./models/User');

async function cleanDB() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // 1. Remove all participants
    const deletedParticipants = await Participant.deleteMany({});
    console.log(`Cleared ${deletedParticipants.deletedCount} participants`);

    // 2. Remove all scores
    const deletedScores = await Score.deleteMany({});
    console.log(`Cleared ${deletedScores.deletedCount} scores`);

    // 3. Remove all score history
    const deletedHistory = await ScoreHistory.deleteMany({});
    console.log(`Cleared ${deletedHistory.deletedCount} score history entries`);

    // 4. Reset all questions to available
    const updatedQuestions = await Question.updateMany({}, { status: 'available' });
    console.log(`Reset ${updatedQuestions.modifiedCount} questions to 'available'`);

    // 5. Reset Event to waiting
    await Event.deleteMany({});
    await Event.create({ status: 'waiting', name: 'FunBuzz Bonus Round' });
    console.log('Event reset to waiting status');

    // 6. Ensure default Admin and Scorer accounts exist
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
      console.log('Admin account created');
    }

    let scorer = await User.findOne({ username: 'scorer' });
    if (!scorer) {
      await User.create({ username: 'scorer', password: 'scorer123', role: 'scorer' });
      console.log('Scorer account created');
    }

    console.log('Database cleaned successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Clean DB error:', err);
    process.exit(1);
  }
}

cleanDB();
