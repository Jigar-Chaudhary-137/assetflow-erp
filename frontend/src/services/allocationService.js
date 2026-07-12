import api from './api';

const normalizeAllocation = (alloc) => {
  if (!alloc) return alloc;
  
  const assetName = alloc.assetId && typeof alloc.assetId === 'object'
    ? alloc.assetId.name
    : alloc.assetName; // fallback

  const assetTag = alloc.assetId && typeof alloc.assetId === 'object'
    ? alloc.assetId.assetTag
    : alloc.assetTag; // fallback

  const employeeName = alloc.employeeId && typeof alloc.employeeId === 'object'
    ? alloc.employeeId.name
    : alloc.employeeName; // fallback

  const employeeId = alloc.employeeId && typeof alloc.employeeId === 'object'
    ? alloc.employeeId._id
    : alloc.employeeId;

  const allocatedBy = alloc.allocatedById && typeof alloc.allocatedById === 'object'
    ? alloc.allocatedById.name
    : alloc.allocatedBy; // fallback

  const statusMap = {
    'ACTIVE': 'Active',
    'RETURNED': 'Returned',
    'TRANSFERRED': 'Transferred'
  };

  // If transferStatus is pending, override status to match frontend state expectation
  let status = statusMap[alloc.status] || alloc.status;
  if (alloc.transferStatus === 'PENDING_APPROVAL') {
    status = 'Transfer Pending';
  }

  return {
    ...alloc,
    id: alloc._id || alloc.id,
    assetId: alloc.assetId && typeof alloc.assetId === 'object' ? alloc.assetId._id : alloc.assetId,
    assetTag,
    assetName,
    employeeId,
    employeeName,
    allocatedBy: allocatedBy || 'System',
    allocatedDate: alloc.allocatedDate ? new Date(alloc.allocatedDate).toISOString().split('T')[0] : alloc.createdAt ? new Date(alloc.createdAt).toISOString().split('T')[0] : '',
    dueDate: alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toISOString().split('T')[0] : '',
    returnedDate: alloc.actualReturnDate ? new Date(alloc.actualReturnDate).toISOString().split('T')[0] : null,
    status,
    transferTo: alloc.transferRequestedTo
  };
};

export const allocationService = {
  getAll: async () => {
    const res = await api.get('/allocations');
    const allocations = res.data.data.allocations || [];
    return allocations.map(normalizeAllocation);
  },

  allocate: async (allocationData) => {
    const payload = {
      assetId: allocationData.assetId,
      employeeId: allocationData.employeeId,
      expectedReturnDate: allocationData.dueDate || undefined,
      notes: allocationData.notes
    };
    const res = await api.post('/allocations', payload);
    return normalizeAllocation(res.data.data);
  },

  returnAsset: async (allocationId, notes = '') => {
    const res = await api.post(`/allocations/${allocationId}/return`, { notes });
    return normalizeAllocation(res.data.data);
  },

  initiateTransfer: async (allocationId, targetEmployeeId, notes = '') => {
    const res = await api.post(`/allocations/${allocationId}/transfer`, { 
      transferRequestedTo: targetEmployeeId, 
      notes 
    });
    return normalizeAllocation(res.data.data);
  },

  approveTransfer: async (allocationId) => {
    const res = await api.patch(`/allocations/${allocationId}/transfer/approve`);
    return normalizeAllocation(res.data.data.newAllocation);
  },

  rejectTransfer: async (allocationId) => {
    const res = await api.patch(`/allocations/${allocationId}/transfer/reject`);
    return normalizeAllocation(res.data.data);
  }
};
