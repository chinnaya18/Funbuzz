import api from './api';

export const getEventStatus = () =>
  api.get('/event/status');

export const updateEventStatus = (status) =>
  api.put('/event/status', { status });

export const resetEvent = () =>
  api.post('/event/reset');
