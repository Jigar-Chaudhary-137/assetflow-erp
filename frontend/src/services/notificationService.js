import api from './api';

const normalizeNotification = (n) => {
  if (!n) return n;
  return {
    ...n,
    id: n._id || n.id,
    read: n.isRead !== undefined ? n.isRead : n.read
  };
};

export const notificationService = {
  getAll: async () => {
    const res = await api.get('/notifications');
    const list = res.data.data.notifications || [];
    return list.map(normalizeNotification);
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return normalizeNotification(res.data.data);
  },

  clearAll: async () => {
    await api.delete('/notifications');
    return { success: true };
  }
};
