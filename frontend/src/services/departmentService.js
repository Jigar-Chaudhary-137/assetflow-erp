import api from './api';

export const departmentService = {
  getAll: async () => {
    const response = await api.get('/departments', { params: { limit: 100 } });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return (payload.data.departments || []).map(dept => ({
        ...dept,
        id: dept._id
      }));
    }
    return [];
  },

  create: async (deptData) => {
    const response = await api.post('/departments', deptData);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      const dept = payload.data;
      return {
        ...dept,
        id: dept._id
      };
    }
    throw new Error(payload?.message || 'Failed to create department');
  }
};

