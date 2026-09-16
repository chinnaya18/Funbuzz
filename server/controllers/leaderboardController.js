const { getLeaderboardData } = require('./scoreController');

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await getLeaderboardData();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
