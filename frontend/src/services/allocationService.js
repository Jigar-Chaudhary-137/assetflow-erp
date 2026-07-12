import api, { safeApiCall, getMockData, saveMockData, logMockActivity, triggerMockNotification } from './api';
import { ASSET_STATUS, ALLOCATION_STATUS } from '../constants';

export const allocationService = {
  getAll: async () => {
    return safeApiCall(
      () => api.get('/allocations'),
      () => getMockData('allocations')
    );
  },

  allocate: async (allocationData) => {
    return safeApiCall(
      () => api.post('/allocations', allocationData),
      () => {
        const { assetId, employeeId, dueDate, notes } = allocationData;
        const assets = getMockData('assets');
        const assetIndex = assets.findIndex(a => a.id === assetId);
        
        if (assetIndex === -1) throw new Error('Asset not found');
        const asset = assets[assetIndex];

        // Rule: Asset cannot be allocated twice
        if (asset.status === ASSET_STATUS.ALLOCATED || asset.status === ASSET_STATUS.UNDER_MAINTENANCE) {
          throw new Error(`Asset is already ${asset.status.toLowerCase()} and cannot be allocated.`);
        }

        const employees = getMockData('employees');
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) throw new Error('Employee not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System', id: 'sys' };

        // Create new allocation
        const allocations = getMockData('allocations');
        const newAllocation = {
          id: `alloc-${Date.now()}`,
          assetId,
          assetTag: asset.assetTag,
          assetName: asset.name,
          employeeId,
          employeeName: employee.name,
          allocatedBy: currentUser.name,
          allocatedDate: new Date().toISOString().split('T')[0],
          dueDate,
          returnedDate: null,
          status: ALLOCATION_STATUS.ACTIVE,
          notes
        };

        allocations.unshift(newAllocation);
        saveMockData('allocations', allocations);

        // Rule: Asset status changes automatically
        asset.status = ASSET_STATUS.ALLOCATED;
        asset.department = employee.department; // Track location
        saveMockData('assets', assets);

        // Rule: Activity log maintained
        logMockActivity(
          currentUser.name,
          'Asset Allocated',
          'Allocation',
          asset.assetTag,
          `Allocated "${asset.name}" to ${employee.name}. Due on ${dueDate}.`
        );

        // Rule: Notification generated automatically
        triggerMockNotification(
          employeeId,
          'Asset Allocated to You',
          `You have been assigned "${asset.name}" (${asset.assetTag}). Due date: ${dueDate}.`
        );

        return newAllocation;
      }
    );
  },

  returnAsset: async (allocationId, notes = '') => {
    return safeApiCall(
      () => api.post(`/allocations/${allocationId}/return`, { notes }),
      () => {
        const allocations = getMockData('allocations');
        const allocIndex = allocations.findIndex(a => a.id === allocationId);
        if (allocIndex === -1) throw new Error('Allocation not found');
        
        const allocation = allocations[allocIndex];
        if (allocation.status === ALLOCATION_STATUS.RETURNED) {
          throw new Error('Asset has already been returned.');
        }

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        
        // Update allocation
        allocation.status = ALLOCATION_STATUS.RETURNED;
        allocation.returnedDate = new Date().toISOString().split('T')[0];
        allocation.notes = notes ? `${allocation.notes || ''} | Return note: ${notes}` : allocation.notes;
        saveMockData('allocations', allocations);

        // Update asset
        const assets = getMockData('assets');
        const assetIndex = assets.findIndex(a => a.id === allocation.assetId);
        if (assetIndex !== -1) {
          assets[assetIndex].status = ASSET_STATUS.AVAILABLE;
          saveMockData('assets', assets);
          
          logMockActivity(
            currentUser.name,
            'Asset Returned',
            'Allocation',
            assets[assetIndex].assetTag,
            `Asset "${assets[assetIndex].name}" returned by ${allocation.employeeName}.`
          );

          triggerMockNotification(
            allocation.employeeId,
            'Asset Return Processed',
            `Your return of "${allocation.assetName}" has been successfully logged.`
          );
        }

        return allocation;
      }
    );
  },

  initiateTransfer: async (allocationId, targetEmployeeId, notes = '') => {
    return safeApiCall(
      () => api.post(`/allocations/${allocationId}/transfer`, { targetEmployeeId, notes }),
      () => {
        const allocations = getMockData('allocations');
        const allocIndex = allocations.findIndex(a => a.id === allocationId);
        if (allocIndex === -1) throw new Error('Allocation not found');

        const allocation = allocations[allocIndex];
        const employees = getMockData('employees');
        const targetEmployee = employees.find(e => e.id === targetEmployeeId);
        if (!targetEmployee) throw new Error('Target employee not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };

        // Rule: Transfer requires approval. Put allocation in Transfer Pending status.
        allocation.status = ALLOCATION_STATUS.TRANSFER_PENDING;
        allocation.transferTo = targetEmployeeId;
        allocation.transferNotes = notes;
        saveMockData('allocations', allocations);

        logMockActivity(
          currentUser.name,
          'Transfer Requested',
          'Allocation',
          allocation.assetTag,
          `Requested transfer of "${allocation.assetName}" from ${allocation.employeeName} to ${targetEmployee.name}.`
        );

        // Trigger notification to Admin and Department Head (Manager role also)
        const managers = employees.filter(e => e.role === 'Admin' || e.role === 'Asset Manager');
        managers.forEach(mgr => {
          triggerMockNotification(
            mgr.id,
            'Asset Transfer Pending Approval',
            `${currentUser.name} requested transfer of "${allocation.assetName}" to ${targetEmployee.name}.`
          );
        });

        return allocation;
      }
    );
  },

  approveTransfer: async (allocationId) => {
    return safeApiCall(
      () => api.post(`/allocations/${allocationId}/approve-transfer`),
      () => {
        const allocations = getMockData('allocations');
        const allocIndex = allocations.findIndex(a => a.id === allocationId);
        if (allocIndex === -1) throw new Error('Allocation not found');

        const allocation = allocations[allocIndex];
        if (allocation.status !== ALLOCATION_STATUS.TRANSFER_PENDING) {
          throw new Error('Allocation is not pending transfer.');
        }

        const employees = getMockData('employees');
        const targetEmployee = employees.find(e => e.id === allocation.transferTo);
        if (!targetEmployee) throw new Error('Target employee not found');

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };

        // 1. Terminate old allocation
        allocation.status = ALLOCATION_STATUS.RETURNED;
        allocation.returnedDate = new Date().toISOString().split('T')[0];
        
        // 2. Create new allocation for target employee
        const newAllocation = {
          id: `alloc-${Date.now()}`,
          assetId: allocation.assetId,
          assetTag: allocation.assetTag,
          assetName: allocation.assetName,
          employeeId: targetEmployee.id,
          employeeName: targetEmployee.name,
          allocatedBy: currentUser.name,
          allocatedDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // 1 year out
          returnedDate: null,
          status: ALLOCATION_STATUS.ACTIVE,
          notes: `Transferred from ${allocation.employeeName}. ${allocation.transferNotes || ''}`
        };

        allocations.push(newAllocation);
        saveMockData('allocations', allocations);

        // 3. Update asset department
        const assets = getMockData('assets');
        const assetIndex = assets.findIndex(a => a.id === allocation.assetId);
        if (assetIndex !== -1) {
          assets[assetIndex].department = targetEmployee.department;
          saveMockData('assets', assets);
        }

        logMockActivity(
          currentUser.name,
          'Transfer Approved',
          'Allocation',
          allocation.assetTag,
          `Approved transfer of "${allocation.assetName}" to ${targetEmployee.name}.`
        );

        triggerMockNotification(
          allocation.employeeId,
          'Transfer Completed',
          `Your asset "${allocation.assetName}" has been successfully transferred to ${targetEmployee.name}.`
        );

        triggerMockNotification(
          targetEmployee.id,
          'Asset Allocated via Transfer',
          `Asset "${allocation.assetName}" (${allocation.assetTag}) has been transferred to you.`
        );

        return newAllocation;
      }
    );
  },

  rejectTransfer: async (allocationId) => {
    return safeApiCall(
      () => api.post(`/allocations/${allocationId}/reject-transfer`),
      () => {
        const allocations = getMockData('allocations');
        const allocIndex = allocations.findIndex(a => a.id === allocationId);
        if (allocIndex === -1) throw new Error('Allocation not found');

        const allocation = allocations[allocIndex];
        if (allocation.status !== ALLOCATION_STATUS.TRANSFER_PENDING) {
          throw new Error('Allocation is not pending transfer.');
        }

        const currentUser = JSON.parse(localStorage.getItem('assetflow_user')) || { name: 'System' };
        
        allocation.status = ALLOCATION_STATUS.ACTIVE;
        const targetId = allocation.transferTo;
        allocation.transferTo = null;
        allocation.transferNotes = null;
        saveMockData('allocations', allocations);

        logMockActivity(
          currentUser.name,
          'Transfer Rejected',
          'Allocation',
          allocation.assetTag,
          `Rejected transfer of "${allocation.assetName}" from ${allocation.employeeName}.`
        );

        triggerMockNotification(
          allocation.employeeId,
          'Transfer Request Rejected',
          `The request to transfer "${allocation.assetName}" has been rejected. It remains allocated to you.`
        );

        return allocation;
      }
    );
  }
};
