import api from './api';
import { departmentService } from './departmentService';

const mapRoleToFrontend = (role) => {
  const map = {
    'ADMIN': 'Admin',
    'ASSET_MANAGER': 'Asset Manager',
    'DEPARTMENT_HEAD': 'Department Head',
    'EMPLOYEE': 'Employee'
  };
  return map[role] || role;
};

const mapRoleToBackend = (role) => {
  const map = {
    'Admin': 'ADMIN',
    'Asset Manager': 'ASSET_MANAGER',
    'Department Head': 'DEPARTMENT_HEAD',
    'Employee': 'EMPLOYEE'
  };
  return map[role] || role;
};

const mapStatusToFrontend = (status) => {
  const map = {
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'SUSPENDED': 'Suspended'
  };
  return map[status] || status;
};

const mapStatusToBackend = (status) => {
  const map = {
    'Active': 'ACTIVE',
    'Inactive': 'INACTIVE',
    'Suspended': 'SUSPENDED'
  };
  return map[status] || status;
};

const normalizeUser = (user) => {
  if (!user) return user;
  const deptCode = user.departmentId && typeof user.departmentId === 'object'
    ? (user.departmentId.code || user.departmentId.name)
    : user.department; // fallback

  return {
    ...user,
    id: user._id || user.id,
    role: mapRoleToFrontend(user.role),
    status: mapStatusToFrontend(user.status),
    department: deptCode || 'Unassigned'
  };
};

const resolveDepartmentName = async (name) => {
  if (!name || name === 'Unassigned') return null;
  const departments = await departmentService.getAll();
  const found = departments.find(d => d.name.toLowerCase() === name.toLowerCase() || d.code.toLowerCase() === name.toLowerCase());
  return found ? (found._id || found.id) : null;
};

export const employeeService = {
  getAll: async () => {
    const res = await api.get('/users');
    const users = res.data.data.users || [];
    return users.map(normalizeUser);
  },

  create: async (employeeData) => {
    const deptId = await resolveDepartmentName(employeeData.department);
    const payload = {
      username: employeeData.username || employeeData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, ''),
      email: employeeData.email,
      password: employeeData.password || 'Password123',
      name: employeeData.name,
      role: mapRoleToBackend(employeeData.role),
      departmentId: deptId,
      contactNumber: employeeData.contactNumber || employeeData.phone || ''
    };
    const res = await api.post('/auth/register', payload);
    return normalizeUser(res.data.data.user);
  },

  update: async (id, employeeData) => {
    const deptId = await resolveDepartmentName(employeeData.department);
    const payload = {
      ...employeeData,
      role: employeeData.role ? mapRoleToBackend(employeeData.role) : undefined,
      status: employeeData.status ? mapStatusToBackend(employeeData.status) : undefined,
      departmentId: deptId
    };
    const res = await api.put(`/users/${id}`, payload);
    return normalizeUser(res.data.data);
  },

  delete: async (id) => {
    await api.delete(`/users/${id}`);
    return { success: true };
  }
};
