import api from './api';

export const auditService = {
  getAll: async () => {
    const res = await api.get('/activity-logs');
    const logs = res.data.data.logs || [];
    return logs.map(log => ({
      ...log,
      id: log._id || log.id
    }));
  }
};
