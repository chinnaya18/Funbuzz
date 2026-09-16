import api from './api';

export const getScores = () =>
  api.get('/scores');

export const getParticipantScore = (participantId) =>
  api.get(`/scores/${participantId}`);

export const quickAward = (participantId, difficulty, delta, note) =>
  api.post('/scores/quick-award', { participantId, difficulty, delta, note });

export const updateScore = (participantId, scores) =>
  api.put(`/scores/${participantId}`, { scores });

export const getScoreHistory = (participantId) =>
  api.get(`/scores/${participantId}/history`);
