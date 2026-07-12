import api, { safeApiCall, getMockData } from './api';

export const auditService = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/audit-logs'),
      () => getMockData('auditLogs')
    );
  }
};
