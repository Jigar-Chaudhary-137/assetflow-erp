import api, { safeApiCall, getMockData, saveMockData, logMockActivity } from './api';

export const employeeService = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/employees'),
      () => getMockData('employees')
    );
  },

  create: async (employeeData) => {
    return safeApiCall(
      () => api.post('/employees', employeeData),
      () => {
        const employees = getMockData('employees');
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };

        const newEmployee = {
          id: `emp-${Date.now()}`,
          status: 'Active',
          ...employeeData
        };

        employees.push(newEmployee);
        saveMockData('employees', employees);

        logMockActivity(
          currentUser.name,
          'Employee Account Created',
          'Employee',
          newEmployee.email,
          `Registered staff member "${newEmployee.name}" as ${newEmployee.role}.`
        );

        return newEmployee;
      }
    );
  },

  update: async (id, employeeData) => {
    return safeApiCall(
      () => api.put(`/employees/${id}`, employeeData),
      () => {
        const employees = getMockData('employees');
        const index = employees.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Employee not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        const updatedEmployee = { ...employees[index], ...employeeData };

        employees[index] = updatedEmployee;
        saveMockData('employees', employees);

        logMockActivity(
          currentUser.name,
          'Employee Account Updated',
          'Employee',
          updatedEmployee.email,
          `Updated information for employee "${updatedEmployee.name}".`
        );

        return updatedEmployee;
      }
    );
  },

  delete: async (id) => {
    return safeApiCall(
      () => api.delete(`/employees/${id}`),
      () => {
        const employees = getMockData('employees');
        const index = employees.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Employee not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        const employee = employees[index];

        employees.splice(index, 1);
        saveMockData('employees', employees);

        logMockActivity(
          currentUser.name,
          'Employee Account Deleted',
          'Employee',
          employee.email,
          `Removed employee account "${employee.name}" from system.`
        );

        return { success: true };
      }
    );
  }
};
