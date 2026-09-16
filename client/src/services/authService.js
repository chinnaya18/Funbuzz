import api from './api';

export const adminLogin = (username, password) =>
  api.post('/auth/admin/login', { username, password });

export const scorerLogin = (username, password) =>
  api.post('/auth/scorer/login', { username, password });

export const participantLogin = (name, rollNumber, pass) =>
  api.post('/auth/participant/login', { name, rollNumber, pass });

export const getDemoAccounts = () =>
  api.get('/auth/demo-accounts');

export const logout = () =>
  api.post('/auth/logout');
