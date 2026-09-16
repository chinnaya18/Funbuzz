import api from './api';

export const getLeaderboard = () =>
  api.get('/leaderboard');
