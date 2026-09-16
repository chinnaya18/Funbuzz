const router = require('express').Router();
const { getLeaderboard } = require('../controllers/leaderboardController');

// Leaderboard is public (no auth needed for participants to see it)
router.get('/', getLeaderboard);

module.exports = router;
