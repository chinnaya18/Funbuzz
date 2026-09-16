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

// Serverless & static asset handling
const path = require('path');

// Ensure DB is connected for serverless function invocations
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
    } catch (err) {
      console.error('DB connect middleware error:', err.message);
    }
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve client static build files if present
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// SPA Client-side routing fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>FunBuzz</title></head>
        <body style="font-family: system-ui, sans-serif; background: #070709; color: #fff; text-align: center; padding: 60px 20px;">
          <h1 style="color: #E50914; font-size: 32px; margin-bottom: 12px;">FunBuzz Backend Active</h1>
          <p style="color: #A1A1AA; font-size: 16px;">API is operational at <code>/api</code></p>
        </body>
        </html>
      `);
    }
  });
});

// Error handler
app.use(errorHandler);

// Connect DB and start server (local / VM environments)
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
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
}

module.exports = app;
module.exports.server = server;
