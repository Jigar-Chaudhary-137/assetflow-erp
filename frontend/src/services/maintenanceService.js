import api, { safeApiCall, getMockData, saveMockData, logMockActivity, triggerMockNotification } from './api';
import { ASSET_STATUS, MAINTENANCE_STATUS } from '../constants';

export const maintenanceService = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/maintenances'),
      () => getMockData('maintenances')
    );
  },

  create: async (maintenanceData) => {
    return safeApiCall(
      () => api.post('/maintenances', maintenanceData),
      () => {
        const { assetId, issueDescription, priority, cost } = maintenanceData;
        const assets = getMockData('assets');
        const asset = assets.find(a => a.id === assetId);
        if (!asset) throw new Error('Asset not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System', id: 'sys' };

        const newRequest = {
          id: `maint-${Date.now()}`,
          assetId,
          assetTag: asset.assetTag,
          assetName: asset.name,
          requestedBy: currentUser.name,
          issueDescription,
          priority,
          cost: Number(cost) || 0,
          status: MAINTENANCE_STATUS.PENDING,
          approvedBy: null,
          startDate: null,
          endDate: null,
          notes: ''
        };

        const maintenances = getMockData('maintenances');
        maintenances.unshift(newRequest);
        saveMockData('maintenances', maintenances);

        logMockActivity(
          currentUser.name,
          'Maintenance Requested',
          'Maintenance',
          asset.assetTag,
          `Requested maintenance for "${asset.name}". Issue: "${issueDescription}".`
        );

        // Notify Admins
        const employees = getMockData('employees');
        const managers = employees.filter(e => e.role === 'Admin' || e.role === 'Asset Manager');
        managers.forEach(mgr => {
          triggerMockNotification(
            mgr.id,
            'New Maintenance Request Approval Needed',
            `Maintenance request submitted for "${asset.name}". Priority: ${priority}.`
          );
        });

        return newRequest;
      }
    );
  },

  approve: async (id) => {
    return safeApiCall(
      () => api.post(`/maintenances/${id}/approve`),
      () => {
        const maintenances = getMockData('maintenances');
        const index = maintenances.findIndex(m => m.id === id);
        if (index === -1) throw new Error('Maintenance request not found');

        const request = maintenances[index];
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        
        request.status = MAINTENANCE_STATUS.APPROVED;
        request.approvedBy = currentUser.name;
        request.startDate = new Date().toISOString().split('T')[0];
        saveMockData('maintenances', maintenances);

        // Update asset status to Under Maintenance
        const assets = getMockData('assets');
        const assetIndex = assets.findIndex(a => a.id === request.assetId);
        if (assetIndex !== -1) {
          assets[assetIndex].status = ASSET_STATUS.UNDER_MAINTENANCE;
          saveMockData('assets', assets);
        }

        logMockActivity(
          currentUser.name,
          'Maintenance Approved',
          'Maintenance',
          request.assetTag,
          `Approved maintenance for "${request.assetName}". Status set to Under Maintenance.`
        );

        return request;
      }
    );
  },

  start: async (id) => {
    return safeApiCall(
      () => api.post(`/maintenances/${id}/start`),
      () => {
        const maintenances = getMockData('maintenances');
        const index = maintenances.findIndex(m => m.id === id);
        if (index === -1) throw new Error('Maintenance request not found');

        const request = maintenances[index];
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        
        request.status = MAINTENANCE_STATUS.IN_PROGRESS;
        saveMockData('maintenances', maintenances);

        logMockActivity(
          currentUser.name,
          'Maintenance In Progress',
          'Maintenance',
          request.assetTag,
          `Started maintenance work on "${request.assetName}".`
        );

        return request;
      }
    );
  },

  complete: async (id, notes = '') => {
    return safeApiCall(
      () => api.post(`/maintenances/${id}/complete`, { notes }),
      () => {
        const maintenances = getMockData('maintenances');
        const index = maintenances.findIndex(m => m.id === id);
        if (index === -1) throw new Error('Maintenance request not found');

        const request = maintenances[index];
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        
        request.status = MAINTENANCE_STATUS.COMPLETED;
        request.endDate = new Date().toISOString().split('T')[0];
        request.notes = notes;
        saveMockData('maintenances', maintenances);

        // Return asset status to Available
        const assets = getMockData('assets');
        const assetIndex = assets.findIndex(a => a.id === request.assetId);
        if (assetIndex !== -1) {
          assets[assetIndex].status = ASSET_STATUS.AVAILABLE;
          saveMockData('assets', assets);
        }

        logMockActivity(
          currentUser.name,
          'Maintenance Completed',
          'Maintenance',
          request.assetTag,
          `Completed maintenance work on "${request.assetName}". Asset is now Available.`
        );

        return request;
      }
    );
  },

  cancel: async (id) => {
    return safeApiCall(
      () => api.post(`/maintenances/${id}/cancel`),
      () => {
        const maintenances = getMockData('maintenances');
        const index = maintenances.findIndex(m => m.id === id);
        if (index === -1) throw new Error('Maintenance request not found');

        const request = maintenances[index];
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        
        const oldStatus = request.status;
        request.status = MAINTENANCE_STATUS.CANCELLED;
        saveMockData('maintenances', maintenances);

        // Restore asset to Available if it was already marked Under Maintenance
        if (oldStatus === MAINTENANCE_STATUS.APPROVED || oldStatus === MAINTENANCE_STATUS.IN_PROGRESS) {
          const assets = getMockData('assets');
          const assetIndex = assets.findIndex(a => a.id === request.assetId);
          if (assetIndex !== -1) {
            assets[assetIndex].status = ASSET_STATUS.AVAILABLE;
            saveMockData('assets', assets);
          }
        }

        logMockActivity(
          currentUser.name,
          'Maintenance Cancelled',
          'Maintenance',
          request.assetTag,
          `Cancelled maintenance work on "${request.assetName}".`
        );

        return request;
      }
    );
  }
};
