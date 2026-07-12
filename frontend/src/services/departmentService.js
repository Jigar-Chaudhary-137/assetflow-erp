import api from './api';

const normalizeDepartment = (dept) => {
  if (!dept) return dept;
  return {
    ...dept,
    id: dept._id || dept.id
  };
};

export const departmentService = {
  getAll: async () => {
    const res = await api.get('/departments');
    const departments = res.data.data.departments || [];
    return departments.map(normalizeDepartment);
  },

  create: async (deptData) => {
    const res = await api.post('/departments', deptData);
    return normalizeDepartment(res.data.data);
  }
};
