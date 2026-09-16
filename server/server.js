require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./sockets/index');

// Route imports
const authRoutes = require('./routes/auth');
const participantRoutes = require('./routes/participants');
const questionRoutes = require('./routes/questions');
const scoreRoutes = require('./routes/scores');
const leaderboardRoutes = require('./routes/leaderboard');
const eventRoutes = require('./routes/event');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io accessible in controllers
app.set('io', io);

// Setup socket handlers
setupSocket(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/event', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Connect DB and start server
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Auto-seed if database is empty
  const User = require('./models/User');
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Database is empty, auto-seeding...');
    try {
      await require('./utils/seedData')();
      console.log('Auto-seed complete!');
    } catch (err) {
      console.error('Auto-seed failed:', err.message);
    }
  }

  server.listen(PORT, () => {
    console.log(`\n🚀 FunBuzz Server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   Socket.IO: ws://localhost:${PORT}`);
    console.log('');
  });
});
