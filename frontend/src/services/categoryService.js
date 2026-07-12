import api, { safeApiCall, getMockData, saveMockData, logMockActivity } from './api';

export const categoryService = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/categories'),
      () => getMockData('categories')
    );
  },

  create: async (catData) => {
    return safeApiCall(
      () => api.post('/categories', catData),
      () => {
        const categories = getMockData('categories');
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };

        const newCat = {
          id: `cat-${Date.now()}`,
          ...catData
        };

        categories.push(newCat);
        saveMockData('categories', categories);

        logMockActivity(
          currentUser.name,
          'Asset Category Created',
          'Category',
          newCat.code,
          `Registered category "${newCat.name}" with tag prefix "${newCat.code}".`
        );

        return newCat;
      }
    );
  }
};
