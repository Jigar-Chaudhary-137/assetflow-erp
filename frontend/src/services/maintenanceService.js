import api from './api';

const mapStatusToFrontend = (status) => {
  const map = {
    'PENDING': 'Pending',
    'SCHEDULED': 'Scheduled',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled'
  };
  return map[status] || status;
};

const normalizeMaintenance = (m) => {
  if (!m) return m;
  const assetName = m.assetId && typeof m.assetId === 'object' ? m.assetId.name : m.assetName;
  const assetTag = m.assetId && typeof m.assetId === 'object' ? m.assetId.assetTag : m.assetTag;
  const requestedBy = m.reportedById && typeof m.reportedById === 'object' ? m.reportedById.name : m.requestedBy;
  
  return {
    ...m,
    id: m._id || m.id,
    assetId: m.assetId && typeof m.assetId === 'object' ? m.assetId._id : m.assetId,
    assetName,
    assetTag,
    requestedBy: requestedBy || 'System',
    status: mapStatusToFrontend(m.status),
    startDate: m.startedAt ? new Date(m.startedAt).toISOString().split('T')[0] : null,
    endDate: m.completionDate ? new Date(m.completionDate).toISOString().split('T')[0] : null
  };
};

export const maintenanceService = {
  getAll: async () => {
    const res = await api.get('/maintenances');
    const list = res.data.data.maintenances || [];
    return list.map(normalizeMaintenance);
  },

  create: async (maintenanceData) => {
    const payload = {
      assetId: maintenanceData.assetId,
      issueDescription: maintenanceData.issueDescription,
      priority: (maintenanceData.priority || 'MEDIUM').toUpperCase(),
      estimatedCost: Number(maintenanceData.cost) || 0
    };
    const res = await api.post('/maintenances', payload);
    return normalizeMaintenance(res.data.data);
  },

  approve: async (id) => {
    const res = await api.patch(`/maintenances/${id}/status`, { 
      status: 'SCHEDULED',
      scheduledDate: new Date()
    });
    return normalizeMaintenance(res.data.data);
  },

  start: async (id) => {
    const res = await api.patch(`/maintenances/${id}/status`, { 
      status: 'IN_PROGRESS'
    });
    return normalizeMaintenance(res.data.data);
  },

  complete: async (id, notes = '') => {
    const res = await api.patch(`/maintenances/${id}/status`, { 
      status: 'COMPLETED',
      resolutionDetails: notes
    });
    return normalizeMaintenance(res.data.data);
  },

  cancel: async (id) => {
    const res = await api.patch(`/maintenances/${id}/status`, { 
      status: 'CANCELLED'
    });
    return normalizeMaintenance(res.data.data);
  }
};
