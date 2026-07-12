import api from './api';

export const reportService = {
  getDashboardMetrics: async () => {
    const res = await api.get('/reports/dashboard');
    const data = res.data.data;
    
    const counts = {
      available: data.assets?.AVAILABLE || 0,
      allocated: data.assets?.ALLOCATED || 0,
      reserved: data.assets?.RESERVED || 0,
      pendingTransfers: data.operations?.pendingTransfers || 0,
      pendingMaintenance: data.operations?.pendingMaintenance || 0
    };

    const recentActivity = (data.recent?.activityLogs || []).map(log => ({
      id: log._id || log.id,
      user: log.userName || (log.userId && typeof log.userId === 'object' ? log.userId.name : 'System'),
      action: `${log.action} ${log.module}`,
      details: `${log.httpMethod} request to ${log.endpoint}`,
      timestamp: log.createdAt || new Date()
    }));

    return {
      counts,
      recentActivity
    };
  },

  getReportData: async () => {
    const res = await api.get('/reports/summary');
    return res.data.data;
  }
};
