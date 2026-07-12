import api from './api';

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories', { params: { limit: 100 } });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return (payload.data.categories || []).map(cat => ({
        ...cat,
        id: cat._id
      }));
    }
    return [];
  },

  create: async (catData) => {
    const response = await api.post('/categories', catData);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      const cat = payload.data;
      return {
        ...cat,
        id: cat._id
      };
    }
    throw new Error(payload?.message || 'Failed to create category');
  }
};

