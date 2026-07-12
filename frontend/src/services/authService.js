import api from './api';

const mapRole = (role) => {
  if (!role) return role;
  const upper = role.toUpperCase();
  if (upper === 'ADMIN') return 'Admin';
  if (upper === 'ASSET_MANAGER') return 'Asset Manager';
  if (upper === 'DEPARTMENT_HEAD') return 'Department Head';
  if (upper === 'EMPLOYEE') return 'Employee';
  return role;
};

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      const { user, accessToken } = payload.data;
      const normalizedUser = {
        ...user,
        id: user._id,
        role: mapRole(user.role)
      };
      localStorage.setItem('assetflow_token', accessToken);
      localStorage.setItem('assetflow_user', JSON.stringify(normalizedUser));
      return { token: accessToken, user: normalizedUser };
    }
    throw new Error(payload?.message || 'Login failed');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      const user = payload.data;
      const normalizedUser = {
        ...user,
        id: user._id,
        role: mapRole(user.role)
      };
      localStorage.setItem('assetflow_user', JSON.stringify(normalizedUser));
      return normalizedUser;
    }
    throw new Error(payload?.message || 'Failed to get current user');
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed on backend, clearing storage anyway', err);
    }
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_user');
    return true;
  }
};

