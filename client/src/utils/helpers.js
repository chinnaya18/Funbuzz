// Competition ranking: ties get same rank, next rank skips
export const calculateRanks = (entries) => {
  const sorted = [...entries].sort((a, b) => b.totalScore - a.totalScore);
  let rank = 0;
  let prevScore = null;

  return sorted.map((entry, index) => {
    if (entry.totalScore !== prevScore) {
      rank = index + 1;
      prevScore = entry.totalScore;
    }
    return { ...entry, rank };
  });
};

export const getRankEmoji = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};
