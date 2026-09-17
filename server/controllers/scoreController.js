const Score = require('../models/Score');
const ScoreHistory = require('../models/ScoreHistory');
const Participant = require('../models/Participant');

// Helper: get leaderboard data with competition ranking
async function getLeaderboardData() {
  const scores = await Score.find()
    .populate('participantId', 'name rollNumber')
    .sort({ totalScore: -1 });

  let rank = 0;
  let prevScore = null;

  return scores.map((score, index) => {
    if (score.totalScore !== prevScore) {
      rank = index + 1;
      prevScore = score.totalScore;
    }

    return {
      rank,
      participantId: score.participantId?._id,
      name: score.participantId?.name || 'Unknown',
      rollNumber: score.participantId?.rollNumber || '',
      scores: score.scores,
      totalScore: score.totalScore,
      updatedAt: score.updatedAt
    };
  });
}

// Get all scores (with participant info)
exports.getAll = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate('participantId', 'name rollNumber')
      .sort({ totalScore: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get score for a specific participant
exports.getByParticipantId = async (req, res) => {
  try {
    const score = await Score.findOne({ participantId: req.params.participantId })
      .populate('participantId', 'name rollNumber');

    if (!score) {
      return res.status(404).json({ message: 'Score record not found' });
    }

    res.json(score);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Quick award or adjust points with a single click (Chill +5, Blaze +10, Savage +15, Brutal +20, Legendary +25, or +/- delta)
exports.quickAward = async (req, res) => {
  try {
    const { participantId, difficulty = 'chill', delta = 0, note = '' } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    const currentScore = await Score.findOne({ participantId });
    if (!currentScore) {
      return res.status(404).json({ message: 'Score record not found for participant' });
    }

    const diffKey = ['chill', 'blaze', 'savage', 'brutal', 'legendary'].includes(difficulty)
      ? difficulty
      : 'chill';

    const deltaNum = Number(delta);
    let updatedScores = { ...currentScore.scores.toObject() };

    if (deltaNum >= 0) {
      const prevPoints = updatedScores[diffKey] || 0;
      updatedScores[diffKey] = prevPoints + deltaNum;
    } else {
      // Deduction / Undo logic: deduct from target category first, then cascade across any positive tiers
      let toDeduct = Math.abs(deltaNum);

      if (updatedScores[diffKey] && updatedScores[diffKey] > 0) {
        const deductFromTarget = Math.min(updatedScores[diffKey], toDeduct);
        updatedScores[diffKey] -= deductFromTarget;
        toDeduct -= deductFromTarget;
      }

      if (toDeduct > 0) {
        const tiers = ['legendary', 'brutal', 'savage', 'blaze', 'chill'];
        for (const t of tiers) {
          if (toDeduct <= 0) break;
          if (updatedScores[t] && updatedScores[t] > 0) {
            const deductAmount = Math.min(updatedScores[t], toDeduct);
            updatedScores[t] -= deductAmount;
            toDeduct -= deductAmount;
          }
        }
      }
    }

    const totalScore = (updatedScores.chill || 0) +
                       (updatedScores.blaze || 0) +
                       (updatedScores.savage || 0) +
                       (updatedScores.brutal || 0) +
                       (updatedScores.legendary || 0);

    // Save history
    await ScoreHistory.create({
      participantId,
      adminId: req.user.id,
      difficulty: diffKey,
      previousScore: prevPoints,
      newScore: newPoints,
      note: note || `Awarded by ${req.user.username || 'Mark Provider'}`
    });

    const updated = await Score.findOneAndUpdate(
      { participantId },
      { $set: { scores: updatedScores, totalScore } },
      { new: true }
    ).populate('participantId', 'name rollNumber');

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      const leaderboard = await getLeaderboardData();
      io.emit('leaderboard:updated', leaderboard);
      io.emit('score:updated', {
        participantId,
        difficulty: diffKey,
        scores: updatedScores,
        totalScore,
        delta: Number(delta)
      });
    }

    res.json({
      message: `Score updated: ${delta >= 0 ? '+' : ''}${delta} pts on ${diffKey.toUpperCase()}`,
      score: updated
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Full update participant score
exports.update = async (req, res) => {
  try {
    const { scores } = req.body;
    const { participantId } = req.params;

    if (!scores) {
      return res.status(400).json({ message: 'Scores object is required' });
    }

    const currentScore = await Score.findOne({ participantId });
    if (!currentScore) {
      return res.status(404).json({ message: 'Score record not found for this participant' });
    }

    const difficulties = ['chill', 'blaze', 'savage', 'brutal', 'legendary'];
    for (const diff of difficulties) {
      if (scores[diff] !== undefined && scores[diff] !== currentScore.scores[diff]) {
        await ScoreHistory.create({
          participantId,
          adminId: req.user.id,
          difficulty: diff,
          previousScore: currentScore.scores[diff] || 0,
          newScore: Number(scores[diff])
        });
      }
    }

    const newScores = {
      chill: scores.chill !== undefined ? Number(scores.chill) : currentScore.scores.chill,
      blaze: scores.blaze !== undefined ? Number(scores.blaze) : currentScore.scores.blaze,
      savage: scores.savage !== undefined ? Number(scores.savage) : currentScore.scores.savage,
      brutal: scores.brutal !== undefined ? Number(scores.brutal) : currentScore.scores.brutal,
      legendary: scores.legendary !== undefined ? Number(scores.legendary) : currentScore.scores.legendary
    };

    const totalScore = newScores.chill + newScores.blaze + newScores.savage + newScores.brutal + newScores.legendary;

    const updatedScore = await Score.findOneAndUpdate(
      { participantId },
      { $set: { scores: newScores, totalScore } },
      { new: true }
    ).populate('participantId', 'name rollNumber');

    const io = req.app.get('io');
    if (io) {
      const leaderboard = await getLeaderboardData();
      io.emit('leaderboard:updated', leaderboard);
      io.emit('score:updated', {
        participantId,
        scores: newScores,
        totalScore
      });
    }

    res.json(updatedScore);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get score history for a participant
exports.getHistory = async (req, res) => {
  try {
    const history = await ScoreHistory.find({ participantId: req.params.participantId })
      .populate('adminId', 'username')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports.getLeaderboardData = getLeaderboardData;
