import api from './api';

export const getQuestions = (difficulty = '') =>
  api.get(`/questions${difficulty ? `?difficulty=${difficulty}` : ''}`);

export const getQuestion = (id) =>
  api.get(`/questions/${id}`);

export const createQuestion = (data) =>
  api.post('/questions', data);

export const updateQuestion = (id, data) =>
  api.put(`/questions/${id}`, data);

export const updateQuestionStatus = (id, status) =>
  api.put(`/questions/${id}/status`, { status });

export const deleteQuestion = (id) =>
  api.delete(`/questions/${id}`);

export const resetAllQuestions = () =>
  api.post('/questions/reset');
