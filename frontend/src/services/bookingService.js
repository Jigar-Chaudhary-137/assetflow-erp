import api from './api';

const mapStatus = (status) => {
  if (!status) return 'Pending';
  const s = status.toUpperCase();
  if (s === 'PENDING') return 'Pending';
  if (s === 'APPROVED') return 'Approved';
  if (s === 'REJECTED') return 'Rejected';
  if (s === 'CANCELLED') return 'Cancelled';
  if (s === 'COMPLETED') return 'Completed';
  return status;
};

const translateOutput = (booking) => {
  if (!booking) return booking;
  return {
    ...booking,
    id: booking._id,
    assetTag: booking.assetId ? booking.assetId.assetTag : '',
    assetName: booking.assetId ? booking.assetId.name : '',
    employeeId: booking.bookedById ? booking.bookedById._id || booking.bookedById : '',
    employeeName: booking.bookedById ? booking.bookedById.name : '',
    startDate: booking.startDate ? booking.startDate.split('T')[0] : '',
    endDate: booking.endDate ? booking.endDate.split('T')[0] : '',
    status: mapStatus(booking.status)
  };
};

export const bookingService = {
  getAll: async () => {
    const response = await api.get('/bookings', { params: { limit: 1000 } });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return (payload.data.bookings || []).map(translateOutput);
    }
    return [];
  },

  create: async (bookingData) => {
    const body = {
      assetId: bookingData.assetId,
      startDate: new Date(bookingData.startDate),
      endDate: new Date(bookingData.endDate),
      purpose: bookingData.purpose,
      notes: bookingData.notes || ''
    };
    const response = await api.post('/bookings', body);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to create booking');
  },

  approve: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/approve`);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to approve booking');
  },

  reject: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/reject`, { reason: 'Rejected by administrator' });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to reject booking');
  }
};
