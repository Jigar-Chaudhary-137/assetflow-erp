import api, { safeApiCall, getMockData, saveMockData, logMockActivity, triggerMockNotification } from './api';
import { ASSET_STATUS } from '../constants';

export const assetService = {
  getAll: async (filters = {}) => {
    return safeApiCall(
      () => api.get('/assets', { params: filters }),
      () => {
        let assets = getMockData('assets');
        
        if (filters.status) {
          assets = assets.filter(a => a.status === filters.status);
        }
        if (filters.category) {
          assets = assets.filter(a => a.category === filters.category);
        }
        if (filters.search) {
          const query = filters.search.toLowerCase();
          assets = assets.filter(a => 
            a.name.toLowerCase().includes(query) || 
            a.assetTag.toLowerCase().includes(query) ||
            (a.serialNumber && a.serialNumber.toLowerCase().includes(query))
          );
        }
        return assets;
      }
    );
  },

  getById: async (id) => {
    return safeApiCall(
      () => api.get(`/assets/${id}`),
      () => {
        const assets = getMockData('assets');
        const asset = assets.find(a => a.id === id);
        if (!asset) throw new Error('Asset not found');
        return asset;
      }
    );
  },

  create: async (assetData) => {
    return safeApiCall(
      () => api.post('/assets', assetData),
      () => {
        const assets = getMockData('assets');
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        
        const newAsset = {
          id: `ast-${Date.now()}`,
          assetTag: assetData.assetTag || `AST-${Date.now().toString().slice(-4)}`,
          status: ASSET_STATUS.AVAILABLE, // default status
          ...assetData
        };

        assets.unshift(newAsset);
        saveMockData('assets', assets);

        logMockActivity(
          currentUser.name,
          'Asset Created',
          'Asset',
          newAsset.assetTag,
          `Created asset "${newAsset.name}" in category "${newAsset.category}".`
        );

        triggerMockNotification(
          'emp-1', // Admin
          'New Asset Registered',
          `Asset ${newAsset.assetTag} (${newAsset.name}) has been registered.`
        );

        return newAsset;
      }
    );
  },

  update: async (id, assetData) => {
    return safeApiCall(
      () => api.put(`/assets/${id}`, assetData),
      () => {
        const assets = getMockData('assets');
        const index = assets.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Asset not found');
        
        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        const oldAsset = assets[index];
        const updatedAsset = { ...oldAsset, ...assetData };

        assets[index] = updatedAsset;
        saveMockData('assets', assets);

        logMockActivity(
          currentUser.name,
          'Asset Updated',
          'Asset',
          updatedAsset.assetTag,
          `Modified specifications for "${updatedAsset.name}".`
        );

        return updatedAsset;
      }
    );
  },

  delete: async (id) => {
    return safeApiCall(
      () => api.delete(`/assets/${id}`),
      () => {
        const assets = getMockData('assets');
        const index = assets.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Asset not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        const asset = assets[index];
        
        assets.splice(index, 1);
        saveMockData('assets', assets);

        logMockActivity(
          currentUser.name,
          'Asset Deleted',
          'Asset',
          asset.assetTag,
          `Permanently deleted "${asset.name}" from system.`
        );

        return { success: true };
      }
    );
  },

  changeStatus: async (id, status, notes = '') => {
    return safeApiCall(
      () => api.patch(`/assets/${id}/status`, { status, notes }),
      () => {
        const assets = getMockData('assets');
        const index = assets.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Asset not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        const asset = assets[index];
        const oldStatus = asset.status;
        asset.status = status;

        if (notes) {
          asset.notes = notes;
        }

        saveMockData('assets', assets);

        logMockActivity(
          currentUser.name,
          'Asset Status Changed',
          'Asset',
          asset.assetTag,
          `Lifecycle status changed from "${oldStatus}" to "${status}".`
        );

        return asset;
      }
    );
  }
};
