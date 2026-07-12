import api from './api';
import { categoryService } from './categoryService';
import { departmentService } from './departmentService';

const parseLocation = (locStr) => {
  if (!locStr) return { building: 'HQ', floor: 1, room: 'General' };
  const parts = locStr.split(/[-–—|]/).map(s => s.trim()).filter(Boolean);
  const building = parts[0] || 'HQ';
  let floor = 1;
  let room = 'General';
  if (parts.length === 2) {
    const floorMatch = parts[1].match(/\d+/);
    if (floorMatch) floor = parseInt(floorMatch[0]);
    room = parts[1];
  } else if (parts.length >= 3) {
    const floorMatch = parts[1].match(/\d+/);
    if (floorMatch) floor = parseInt(floorMatch[0]);
    room = parts.slice(2).join(' - ');
  }
  return { building, floor, room };
};

const formatLocation = (locObj) => {
  if (!locObj) return '';
  if (typeof locObj === 'string') return locObj;
  const parts = [];
  if (locObj.building) parts.push(locObj.building);
  if (locObj.floor !== undefined && locObj.floor !== null) parts.push(`Floor ${locObj.floor}`);
  if (locObj.room) parts.push(locObj.room);
  return parts.join(' - ');
};

const translateOutput = (asset) => {
  if (!asset) return asset;
  
  // Mongoose Map might be serialized as an object or ES6 Map
  let specsObj = {};
  if (asset.specs) {
    if (asset.specs instanceof Map) {
      specsObj = Object.fromEntries(asset.specs);
    } else {
      specsObj = asset.specs;
    }
  }

  return {
    ...asset,
    id: asset._id,
    category: asset.categoryId ? (typeof asset.categoryId === 'object' ? asset.categoryId.name : '') : '',
    department: asset.departmentId ? (typeof asset.departmentId === 'object' ? asset.departmentId.name : '') : '',
    model: specsObj.model || '',
    location: formatLocation(asset.location),
    purchaseDate: asset.purchaseInfo && asset.purchaseInfo.purchaseDate ? asset.purchaseInfo.purchaseDate.split('T')[0] : '',
    purchaseCost: asset.purchaseInfo ? asset.purchaseInfo.purchaseCost : 0,
    specs: specsObj
  };
};

const translateInput = async (assetData) => {
  const [categories, departments] = await Promise.all([
    categoryService.getAll(),
    departmentService.getAll()
  ]);

  const categoryObj = categories.find(c => c.name.toLowerCase() === (assetData.category || '').toLowerCase());
  const departmentObj = departments.find(d => d.name.toLowerCase() === (assetData.department || '').toLowerCase());

  if (!categoryObj) {
    throw new Error(`Category "${assetData.category}" not found in database`);
  }

  const specs = {
    ...(assetData.specs || {}),
    model: assetData.model || ''
  };

  return {
    name: assetData.name,
    assetTag: assetData.assetTag,
    serialNumber: assetData.serialNumber,
    categoryId: categoryObj.id,
    departmentId: departmentObj ? departmentObj.id : null,
    location: parseLocation(assetData.location),
    status: assetData.status || 'AVAILABLE',
    bookable: assetData.bookable !== undefined ? assetData.bookable : false,
    condition: assetData.condition || 'GOOD',
    specs,
    purchaseInfo: {
      purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : null,
      purchaseCost: assetData.purchaseCost !== undefined ? Number(assetData.purchaseCost) : null,
      vendor: assetData.vendor || null,
      warrantyExpiration: assetData.warrantyExpiration ? new Date(assetData.warrantyExpiration) : null
    }
  };
};

export const assetService = {
  getAll: async (filters = {}) => {
    // Map category/department filters if present
    const apiParams = {
      search: filters.search
    };

    if (filters.status) {
      apiParams.status = filters.status.toUpperCase().replace(' ', '_');
    }

    if (filters.category) {
      const categories = await categoryService.getAll();
      const match = categories.find(c => c.name.toLowerCase() === filters.category.toLowerCase());
      if (match) apiParams.categoryId = match.id;
    }

    const response = await api.get('/assets', { params: { ...apiParams, limit: 1000 } });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return (payload.data.assets || []).map(translateOutput);
    }
    return [];
  },

  getById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Asset not found');
  },

  create: async (assetData) => {
    const payloadData = await translateInput(assetData);
    const response = await api.post('/assets', payloadData);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to create asset');
  },

  update: async (id, assetData) => {
    const payloadData = await translateInput(assetData);
    const response = await api.put(`/assets/${id}`, payloadData);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to update asset');
  },

  delete: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    const payload = response.data;
    if (payload && payload.success) {
      return { success: true };
    }
    throw new Error(payload?.message || 'Failed to delete asset');
  },

  changeStatus: async (id, status, notes = '') => {
    const backendStatus = status.toUpperCase().replace(' ', '_');
    const response = await api.patch(`/assets/${id}/status`, { status: backendStatus, notes });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to change asset status');
  }
};
