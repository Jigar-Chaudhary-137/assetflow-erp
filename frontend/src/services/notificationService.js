import api, { safeApiCall, getMockData, saveMockData } from './api';

export const notificationService = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/notifications'),
      () => {
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user'));
        if (!currentUser) return [];
        const notifs = getMockData('notifications');
        // Filter notifications matching recipient (or all notifications if it's admin)
        return notifs.filter(n => n.recipientId === currentUser.id || currentUser.role === 'Admin');
      }
    );
  },

  markAsRead: async (id) => {
    return safeApiCall(
      () => api.patch(`/notifications/${id}/read`),
      () => {
        const notifs = getMockData('notifications');
        const index = notifs.findIndex(n => n.id === id);
        if (index !== -1) {
          notifs[index].read = true;
          saveMockData('notifications', notifs);
          return notifs[index];
        }
        throw new Error('Notification not found');
      }
    );
  },

  clearAll: async () => {
    return safeApiCall(
      () => api.delete('/notifications'),
      () => {
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user'));
        if (!currentUser) return { success: true };
        
        let notifs = getMockData('notifications');
        if (currentUser.role === 'Admin') {
          notifs = [];
        } else {
          notifs = notifs.filter(n => n.recipientId !== currentUser.id);
        }
        
        saveMockData('notifications', notifs);
        return { success: true };
      }
    );
  }
};
