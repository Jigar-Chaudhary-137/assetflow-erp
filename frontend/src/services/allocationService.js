import api from './api';

const mapStatus = (alloc) => {
  if (alloc.status === 'ACTIVE' && alloc.transferStatus === 'PENDING_APPROVAL') {
    return 'Transfer Pending';
  }
  if (alloc.status === 'ACTIVE') {
    return 'Active';
  }
  return 'Returned';
};

const translateOutput = (alloc) => {
  if (!alloc) return alloc;
  return {
    ...alloc,
    id: alloc._id,
    assetTag: alloc.assetId ? alloc.assetId.assetTag : '',
    assetName: alloc.assetId ? alloc.assetId.name : '',
    employeeName: alloc.employeeId ? alloc.employeeId.name : '',
    allocatedBy: alloc.allocatedById ? alloc.allocatedById.name : '',
    allocatedDate: alloc.allocatedDate ? alloc.allocatedDate.split('T')[0] : '',
    dueDate: alloc.expectedReturnDate ? alloc.expectedReturnDate.split('T')[0] : '',
    returnedDate: alloc.actualReturnDate ? alloc.actualReturnDate.split('T')[0] : null,
    status: mapStatus(alloc),
    transferTo: alloc.transferRequestedTo,
    transferNotes: alloc.notes
  };
};

export const allocationService = {
  getAll: async () => {
    const response = await api.get('/allocations', { params: { limit: 1000 } });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return (payload.data.allocations || []).map(translateOutput);
    }
    return [];
  },

  allocate: async (allocationData) => {
    const body = {
      assetId: allocationData.assetId,
      employeeId: allocationData.employeeId,
      expectedReturnDate: allocationData.dueDate ? new Date(allocationData.dueDate) : null,
      notes: allocationData.notes || ''
    };
    const response = await api.post('/allocations', body);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to create allocation');
  },

  returnAsset: async (allocationId, notes = '') => {
    const response = await api.post(`/allocations/${allocationId}/return`, { notes });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to return asset');
  },

  initiateTransfer: async (allocationId, targetEmployeeId, notes = '') => {
    const response = await api.post(`/allocations/${allocationId}/transfer`, { targetEmployeeId, notes });
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to initiate transfer');
  },

  approveTransfer: async (allocationId) => {
    const response = await api.post(`/allocations/${allocationId}/approve-transfer`);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      // Backend returns { transfer, newAllocation }
      const newAlloc = payload.data.newAllocation;
      return translateOutput(newAlloc);
    }
    throw new Error(payload?.message || 'Failed to approve transfer');
  },

  rejectTransfer: async (allocationId) => {
    const response = await api.post(`/allocations/${allocationId}/reject-transfer`);
    const payload = response.data;
    if (payload && payload.success && payload.data) {
      return translateOutput(payload.data);
    }
    throw new Error(payload?.message || 'Failed to reject transfer');
  }
};
