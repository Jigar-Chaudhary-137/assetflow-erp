import api, { safeApiCall, getMockData, saveMockData, logMockActivity } from './api';

export const departmentService = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/departments'),
      () => getMockData('departments')
    );
  },

  create: async (deptData) => {
    return safeApiCall(
      () => api.post('/departments', deptData),
      () => {
        const departments = getMockData('departments');
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };

        const newDept = {
          id: `dept-${Date.now()}`,
          ...deptData
        };

        departments.push(newDept);
        saveMockData('departments', departments);

        logMockActivity(
          currentUser.name,
          'Department Created',
          'Department',
          newDept.code,
          `Registered department "${newDept.name}" with code "${newDept.code}".`
        );

        return newDept;
      }
    );
  }
};
