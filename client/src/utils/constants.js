export const DIFFICULTIES = [
  { key: 'chill', label: 'Easy', prefix: 'E', defaultPoints: 5 },
  { key: 'blaze', label: 'Medium', prefix: 'M', defaultPoints: 10 },
  { key: 'savage', label: 'Hard', prefix: 'H', defaultPoints: 15 },
  { key: 'brutal', label: 'Hardest', prefix: 'HD', defaultPoints: 20 },
  { key: 'legendary', label: 'Supreme', prefix: 'S', defaultPoints: 25 }
];

export const EVENT_STATUSES = {
  waiting: { label: 'Waiting', color: 'text-[#A1A1A1]', bg: 'bg-[#111111] border border-[#292929]' },
  running: { label: 'LIVE', color: 'text-[#E50914]', bg: 'bg-[#E50914]/10 border border-[#E50914]/40' },
  paused: { label: 'Paused', color: 'text-[#A1A1A1]', bg: 'bg-[#111111] border border-[#292929]' },
  ended: { label: 'Ended', color: 'text-[#666666]', bg: 'bg-[#111111] border border-[#222222]' }
};

export const QUESTION_STATUSES = {
  available: { label: 'Available', color: 'bg-[#111111] hover:border-[#E50914] border-[#292929] text-white' },
  selected: { label: 'Selected', color: 'bg-[#E50914] text-white border-[#E50914]' },
  'in-progress': { label: 'In Progress', color: 'bg-[#E50914] text-white border-[#E50914]' },
  completed: { label: 'Completed', color: 'bg-[#0A0A0A] text-[#555555] border-[#1A1A1A] opacity-50' }
};

export const getDifficultyConfig = (key) => {
  return DIFFICULTIES.find(d => d.key === key) || DIFFICULTIES[0];
};
