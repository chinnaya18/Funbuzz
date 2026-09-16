import api from './api';

export const getParticipants = (search = '') =>
  api.get(`/participants${search ? `?search=${search}` : ''}`);

export const getParticipant = (id) =>
  api.get(`/participants/${id}`);

export const createParticipant = (data) =>
  api.post('/participants', data);

export const bulkCreateParticipants = (participants) =>
  api.post('/participants/bulk', { participants });

export const updateParticipant = (id, data) =>
  api.put(`/participants/${id}`, data);

export const deleteParticipant = (id) =>
  api.delete(`/participants/${id}`);
