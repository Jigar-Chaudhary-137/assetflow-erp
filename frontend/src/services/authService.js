import api, { safeApiCall, getMockData } from './api';

export const authService = {
  login: async (email, password) => {
    return safeApiCall(
      () => api.post('/auth/login', { email, password }),
      () => {
        const employees = getMockData('employees');
        const user = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
        
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password.');
        }

        const token = `mock-jwt-token-for-${user.role.replace(' ', '_')}-${user.id}`;
        localStorage.setItem('assetflow_token', token);
        localStorage.setItem('assetflow_user', JSON.stringify(user));
        return { token, user };
      }
    );
  },

  getCurrentUser: async () => {
    return safeApiCall(
      () => api.get('/auth/me'),
      () => {
        const userStr = localStorage.getItem('assetflow_user');
        if (!userStr) {
          throw new Error('No active session found');
        }
        return JSON.parse(userStr);
      }
    );
  },

  logout: async () => {
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_user');
    return true;
  }
};
