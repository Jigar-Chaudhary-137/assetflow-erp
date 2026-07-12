export const ROLES = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'Asset Manager',
  DEPARTMENT_HEAD: 'Department Head',
  EMPLOYEE: 'Employee'
};

export const ASSET_STATUS = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  RETURNED: 'Returned',
  RESERVED: 'Reserved',
  UNDER_MAINTENANCE: 'Under Maintenance',
  LOST: 'Lost',
  RETIRED: 'Retired',
  DISPOSED: 'Disposed'
};

export const ALLOCATION_STATUS = {
  ACTIVE: 'Active',
  RETURNED: 'Returned',
  TRANSFER_PENDING: 'Transfer Pending'
};

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ACTIVE: 'Active',
  COMPLETED: 'Completed'
};

export const MAINTENANCE_STATUS = {
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

// Help map badges color class
export const ASSET_STATUS_COLORS = {
  [ASSET_STATUS.AVAILABLE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [ASSET_STATUS.ALLOCATED]: 'bg-blue-50 text-blue-700 border-blue-200',
  [ASSET_STATUS.RETURNED]: 'bg-teal-50 text-teal-700 border-teal-200',
  [ASSET_STATUS.RESERVED]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [ASSET_STATUS.UNDER_MAINTENANCE]: 'bg-amber-50 text-amber-700 border-amber-200',
  [ASSET_STATUS.LOST]: 'bg-rose-50 text-rose-700 border-rose-200',
  [ASSET_STATUS.RETIRED]: 'bg-slate-100 text-slate-700 border-slate-300',
  [ASSET_STATUS.DISPOSED]: 'bg-gray-100 text-gray-500 border-gray-200'
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
  [BOOKING_STATUS.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [BOOKING_STATUS.REJECTED]: 'bg-rose-50 text-rose-700 border-rose-200',
  [BOOKING_STATUS.ACTIVE]: 'bg-blue-50 text-blue-700 border-blue-200',
  [BOOKING_STATUS.COMPLETED]: 'bg-slate-100 text-slate-700 border-slate-300'
};

export const MAINTENANCE_STATUS_COLORS = {
  [MAINTENANCE_STATUS.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
  [MAINTENANCE_STATUS.APPROVED]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [MAINTENANCE_STATUS.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
  [MAINTENANCE_STATUS.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [MAINTENANCE_STATUS.CANCELLED]: 'bg-slate-100 text-slate-500 border-slate-300'
};
