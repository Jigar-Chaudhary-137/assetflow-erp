import api from './api';

const normalizeCategory = (cat) => {
  if (!cat) return cat;
  return {
    ...cat,
    id: cat._id || cat.id
  };
};

export const categoryService = {
  getAll: async () => {
    const res = await api.get('/categories');
    const categories = res.data.data.categories || [];
    return categories.map(normalizeCategory);
  },

  create: async (catData) => {
    const res = await api.post('/categories', catData);
    return normalizeCategory(res.data.data);
  }
};
