import api, { safeApiCall, getMockData, saveMockData, logMockActivity, triggerMockNotification } from './api';
import { ASSET_STATUS, BOOKING_STATUS } from '../constants';

export const bookingService = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/bookings'),
      () => getMockData('bookings')
    );
  },

  create: async (bookingData) => {
    return safeApiCall(
      () => api.post('/bookings', bookingData),
      () => {
        const { assetId, employeeId, startDate, endDate, purpose } = bookingData;
        
        const assets = getMockData('assets');
        const asset = assets.find(a => a.id === assetId);
        if (!asset) throw new Error('Asset not found');

        // Rule: Booking cannot overlap
        const bookings = getMockData('bookings');
        const overlapping = bookings.find(b => {
          if (b.assetId !== assetId) return false;
          if (b.status === BOOKING_STATUS.REJECTED || b.status === BOOKING_STATUS.COMPLETED) return false;
          
          // Overlap check
          const bStart = new Date(b.startDate);
          const bEnd = new Date(b.endDate);
          const reqStart = new Date(startDate);
          const reqEnd = new Date(endDate);

          return reqStart < bEnd && reqEnd > bStart;
        });

        if (overlapping) {
          throw new Error('This asset has an overlapping reservation for the requested dates.');
        }

        const employees = getMockData('employees');
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) throw new Error('Employee not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };

        const newBooking = {
          id: `book-${Date.now()}`,
          assetId,
          assetTag: asset.assetTag,
          assetName: asset.name,
          employeeId,
          employeeName: employee.name,
          startDate,
          endDate,
          purpose,
          status: BOOKING_STATUS.PENDING
        };

        bookings.unshift(newBooking);
        saveMockData('bookings', bookings);

        logMockActivity(
          currentUser.name,
          'Booking Requested',
          'Booking',
          asset.assetTag,
          `Booked "${asset.name}" from ${startDate} to ${endDate}.`
        );

        // Notify Admins
        const managers = employees.filter(e => e.role === 'Admin' || e.role === 'Asset Manager');
        managers.forEach(mgr => {
          triggerMockNotification(
            mgr.id,
            'New Booking Request Pending',
            `${employee.name} requested booking for "${asset.name}" (${startDate} to ${endDate}).`
          );
        });

        return newBooking;
      }
    );
  },

  approve: async (bookingId) => {
    return safeApiCall(
      () => api.post(`/bookings/${bookingId}/approve`),
      () => {
        const bookings = getMockData('bookings');
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) throw new Error('Booking not found');

        const booking = bookings[index];
        booking.status = BOOKING_STATUS.APPROVED;
        saveMockData('bookings', bookings);

        // Update asset status to Reserved
        const assets = getMockData('assets');
        const assetIndex = assets.findIndex(a => a.id === booking.assetId);
        if (assetIndex !== -1) {
          const asset = assets[assetIndex];
          if (asset.status === ASSET_STATUS.AVAILABLE) {
            asset.status = ASSET_STATUS.RESERVED;
            saveMockData('assets', assets);
          }
        }

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        logMockActivity(
          currentUser.name,
          'Booking Approved',
          'Booking',
          booking.assetTag,
          `Approved reservation for ${booking.employeeName} (${booking.startDate} to ${booking.endDate}).`
        );

        triggerMockNotification(
          booking.employeeId,
          'Booking Request Approved',
          `Your booking for "${booking.assetName}" has been approved for ${booking.startDate} to ${booking.endDate}.`
        );

        return booking;
      }
    );
  },

  reject: async (bookingId) => {
    return safeApiCall(
      () => api.post(`/bookings/${bookingId}/reject`),
      () => {
        const bookings = getMockData('bookings');
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) throw new Error('Booking not found');

        const booking = bookings[index];
        booking.status = BOOKING_STATUS.REJECTED;
        saveMockData('bookings', bookings);

        // Check if other active bookings exist for this asset; if not, restore asset status to Available
        const assets = getMockData('assets');
        const assetIndex = assets.findIndex(a => a.id === booking.assetId);
        if (assetIndex !== -1) {
          const asset = assets[assetIndex];
          if (asset.status === ASSET_STATUS.RESERVED) {
            const hasOtherReservations = bookings.some(b => 
              b.assetId === booking.assetId && 
              b.id !== bookingId && 
              (b.status === BOOKING_STATUS.APPROVED || b.status === BOOKING_STATUS.PENDING)
            );
            if (!hasOtherReservations) {
              asset.status = ASSET_STATUS.AVAILABLE;
              saveMockData('assets', assets);
            }
          }
        }

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        logMockActivity(
          currentUser.name,
          'Booking Rejected',
          'Booking',
          booking.assetTag,
          `Rejected reservation for ${booking.employeeName}.`
        );

        triggerMockNotification(
          booking.employeeId,
          'Booking Request Rejected',
          `Your booking for "${booking.assetName}" was declined.`
        );

        return booking;
      }
    );
  }
};
