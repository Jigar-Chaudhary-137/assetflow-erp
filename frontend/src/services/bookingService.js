import api from './api';

export const bookingService = {
  getAll: async () => {
    const userStr = localStorage.getItem('assetflow_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const endpoint = (user && (user.role === 'Admin' || user.role === 'Asset Manager'))
      ? '/bookings'
      : '/bookings/my';

    const res = await api.get(endpoint);
    const bookings = res.data.data.docs || [];
    return bookings.map(b => ({
      ...b,
      id: b._id,
      startDate: b.startTime,
      endDate: b.endTime
    }));
  },

  create: async (bookingData) => {
    const payload = {
      resourceId: bookingData.assetId,
      startTime: bookingData.startDate,
      endTime: bookingData.endDate,
      purpose: bookingData.purpose
    };
    const res = await api.post('/bookings', payload);
    const b = res.data.data;
    return {
      ...b,
      id: b._id,
      startDate: b.startTime,
      endDate: b.endTime
    };
  }
};
