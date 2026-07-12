import api, { safeApiCall, getMockData } from './api';
import { ASSET_STATUS, BOOKING_STATUS, MAINTENANCE_STATUS, ALLOCATION_STATUS } from '../constants';

export const reportService = {
  getDashboardMetrics: async () => {
    return safeApiCall(
      () => api.get('/reports/dashboard'),
      () => {
        const assets = getMockData('assets');
        const allocations = getMockData('allocations');
        const bookings = getMockData('bookings');
        const maintenances = getMockData('maintenances');
        const auditLogs = getMockData('auditLogs');

        // Total counters
        const totalAssets = assets.length;
        const allocatedAssets = assets.filter(a => a.status === ASSET_STATUS.ALLOCATED).length;
        const availableAssets = assets.filter(a => a.status === ASSET_STATUS.AVAILABLE).length;
        const maintenanceAssets = assets.filter(a => a.status === ASSET_STATUS.UNDER_MAINTENANCE).length;
        const reservedAssets = assets.filter(a => a.status === ASSET_STATUS.RESERVED).length;

        // Pending counters
        const pendingBookings = bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length;
        const pendingMaintenance = maintenances.filter(m => m.status === MAINTENANCE_STATUS.PENDING).length;
        const pendingTransfers = allocations.filter(a => a.status === ALLOCATION_STATUS.TRANSFER_PENDING).length;

        // Category distribution
        const categoryCounts = {};
        assets.forEach(a => {
          categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
        });

        // Department distribution
        const departmentCounts = {};
        assets.forEach(a => {
          departmentCounts[a.department] = (departmentCounts[a.department] || 0) + 1;
        });

        // Net valuation
        const totalValue = assets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);

        return {
          counts: {
            total: totalAssets,
            allocated: allocatedAssets,
            available: availableAssets,
            maintenance: maintenanceAssets,
            reserved: reservedAssets,
            pendingBookings,
            pendingMaintenance,
            pendingTransfers
          },
          totalValue,
          categoryDistribution: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
          departmentDistribution: Object.entries(departmentCounts).map(([name, value]) => ({ name, value })),
          recentActivity: auditLogs.slice(0, 5),
          pendingApprovals: {
            bookings: bookings.filter(b => b.status === BOOKING_STATUS.PENDING).slice(0, 3),
            maintenances: maintenances.filter(m => m.status === MAINTENANCE_STATUS.PENDING).slice(0, 3),
            transfers: allocations.filter(a => a.status === ALLOCATION_STATUS.TRANSFER_PENDING).slice(0, 3)
          }
        };
      }
    );
  },

  getReportData: async () => {
    return safeApiCall(
      () => api.get('/reports/summary'),
      () => {
        const assets = getMockData('assets');
        const allocations = getMockData('allocations');
        const bookings = getMockData('bookings');
        const maintenances = getMockData('maintenances');

        return {
          assets,
          allocations: allocations.filter(a => a.status === ALLOCATION_STATUS.ACTIVE),
          bookings,
          maintenances
        };
      }
    );
  }
};
