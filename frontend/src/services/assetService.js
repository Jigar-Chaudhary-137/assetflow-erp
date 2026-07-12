import api from './api';
import { categoryService } from './categoryService';
import { departmentService } from './departmentService';

const mapStatusToFrontend = (status) => {
  const map = {
    'AVAILABLE': 'Available',
    'ALLOCATED': 'Allocated',
    'RESERVED': 'Reserved',
    'UNDER_MAINTENANCE': 'Under Maintenance',
    'LOST': 'Lost',
    'RETIRED': 'Retired',
    'DISPOSED': 'Disposed'
  };
  return map[status] || status;
};

const mapStatusToBackend = (status) => {
  const map = {
    'Available': 'AVAILABLE',
    'Allocated': 'ALLOCATED',
    'Reserved': 'RESERVED',
    'Under Maintenance': 'UNDER_MAINTENANCE',
    'Lost': 'LOST',
    'Retired': 'RETIRED',
    'Disposed': 'DISPOSED'
  };
  return map[status] || status;
};

const normalizeAsset = (asset) => {
  if (!asset) return asset;
  
  const categoryName = asset.categoryId && typeof asset.categoryId === 'object'
    ? asset.categoryId.name
    : asset.category; // fallback
    
  const departmentName = asset.departmentId && typeof asset.departmentId === 'object'
    ? asset.departmentId.name
    : asset.department; // fallback

  const locationStr = asset.location && typeof asset.location === 'object'
    ? `${asset.location.building || ''} - Floor ${asset.location.floor || ''} - Room ${asset.location.room || ''}`.replace(/\s*-\s*Floor\s*-\s*/, ' - ').replace(/\s*-\s*Room\s*-\s*/, ' - ')
    : asset.location;

  return {
    ...asset,
    id: asset._id || asset.id,
    category: categoryName || 'Uncategorized',
    department: departmentName || 'Unassigned',
    location: locationStr || 'Unknown',
    status: mapStatusToFrontend(asset.status)
  };
};

const resolveCategoryName = async (name) => {
  if (!name) return null;
  const categories = await categoryService.getAll();
  const found = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  return found ? (found._id || found.id) : null;
};

const resolveDepartmentName = async (name) => {
  if (!name || name === 'Unassigned') return null;
  const departments = await departmentService.getAll();
  const found = departments.find(d => d.name.toLowerCase() === name.toLowerCase() || d.code.toLowerCase() === name.toLowerCase());
  return found ? (found._id || found.id) : null;
};

const parseLocation = (locStr) => {
  if (!locStr) return { building: 'Unknown', floor: 1, room: 'Unknown' };
  if (typeof locStr === 'object') return locStr;
  const parts = locStr.split('-').map(p => p.trim());
  const building = parts[0] || 'Unknown';
  let floor = 1;
  let room = 'Unknown';
  if (parts.length > 1) {
    const floorMatch = parts[1].match(/\d+/);
    if (floorMatch) floor = parseInt(floorMatch[0]);
  }
  if (parts.length > 2) {
    room = parts[2];
  }
  return { building, floor, room };
};

export const assetService = {
  getAll: async (filters = {}) => {
    // If filters have name category/status, convert them
    const queryParams = { ...filters };
    if (filters.category) {
      const catId = await resolveCategoryName(filters.category);
      if (catId) {
        queryParams.categoryId = catId;
        delete queryParams.category;
      }
    }
    if (filters.status) {
      queryParams.status = mapStatusToBackend(filters.status);
    }
    
    // We want to fetch all (no pagination limit of 10) for page listings if needed, or pass limit 100
    queryParams.limit = 100;

    const res = await api.get('/assets', { params: queryParams });
    const assets = res.data.data.assets || [];
    return assets.map(normalizeAsset);
  },

  getById: async (id) => {
    const res = await api.get(`/assets/${id}`);
    return normalizeAsset(res.data.data);
  },

  create: async (assetData) => {
    const catId = await resolveCategoryName(assetData.category);
    const deptId = await resolveDepartmentName(assetData.department);
    const locationObj = parseLocation(assetData.location);

    const payload = {
      assetTag: assetData.assetTag,
      serialNumber: assetData.serialNumber,
      name: assetData.name,
      categoryId: catId,
      departmentId: deptId,
      condition: assetData.condition || 'NEW',
      location: locationObj,
      status: mapStatusToBackend(assetData.status || 'Available'),
      bookable: assetData.bookable || false,
      specs: assetData.specs || {},
      purchaseInfo: {
        purchaseDate: assetData.purchaseDate || new Date(),
        purchaseCost: parseFloat(assetData.purchaseCost) || 0,
        vendor: assetData.vendor || 'Unknown',
        warrantyExpiration: assetData.warrantyExpiration || new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000)
      }
    };

    const res = await api.post('/assets', payload);
    return normalizeAsset(res.data.data);
  },

  update: async (id, assetData) => {
    const catId = await resolveCategoryName(assetData.category);
    const deptId = await resolveDepartmentName(assetData.department);
    const locationObj = parseLocation(assetData.location);

    const payload = {
      ...assetData,
      categoryId: catId,
      departmentId: deptId,
      location: locationObj,
      status: assetData.status ? mapStatusToBackend(assetData.status) : undefined
    };

    const res = await api.put(`/assets/${id}`, payload);
    return normalizeAsset(res.data.data);
  },

  delete: async (id) => {
    await api.delete(`/assets/${id}`);
    return { success: true };
  },

  changeStatus: async (id, status, notes = '') => {
    const backendStatus = mapStatusToBackend(status);
    const res = await api.patch(`/assets/${id}/status`, { status: backendStatus, notes });
    return normalizeAsset(res.data.data);
  }
};
