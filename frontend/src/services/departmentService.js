import api from "./api";
import { employeeService } from "./employeeService";

const normalizeDepartment = (dept) => {
  if (!dept) return dept;
  
  const head = dept.managerId && typeof dept.managerId === 'object'
    ? dept.managerId.name
    : '';

  const parentDept = dept.parentDepartmentId && typeof dept.parentDepartmentId === 'object'
    ? dept.parentDepartmentId.name
    : '--';

  const status = dept.status === 'ACTIVE' ? 'Active' : 'Inactive';

  return {
    ...dept,
    id: dept._id || dept.id,
    head,
    parentDept,
    status
  };
};

const resolveManagerName = async (name) => {
  if (!name) return null;
  const employees = await employeeService.getAll();
  const found = employees.find(e => e.name.toLowerCase() === name.toLowerCase());
  return found ? (found._id || found.id) : null;
};

const resolveParentDeptName = async (name) => {
  if (!name || name === '--' || name === 'None') return null;
  const res = await api.get('/departments');
  const departments = res.data.data.departments || [];
  const found = departments.find(d => d.name.toLowerCase() === name.toLowerCase());
  return found ? (found._id || found.id) : null;
};

export const departmentService = {
  getAll: async () => {
    const res = await api.get("/departments");
    const departments = res.data.data.departments || [];
    return departments.map(normalizeDepartment);
  },

  create: async (deptData) => {
    const managerId = await resolveManagerName(deptData.head);
    const parentDepartmentId = await resolveParentDeptName(deptData.parentDept);
    
    const payload = {
      name: deptData.name,
      code: deptData.code,
      managerId,
      parentDepartmentId,
      status: deptData.status === 'Active' ? 'ACTIVE' : 'INACTIVE'
    };

    const res = await api.post("/departments", payload);
    return normalizeDepartment(res.data.data);
  },

  update: async (id, deptData) => {
    const managerId = await resolveManagerName(deptData.head);
    const parentDepartmentId = await resolveParentDeptName(deptData.parentDept);
    
    const payload = {
      name: deptData.name,
      code: deptData.code,
      managerId,
      parentDepartmentId,
      status: deptData.status === 'Active' ? 'ACTIVE' : 'INACTIVE'
    };

    const res = await api.put(`/departments/${id}`, payload);
    return normalizeDepartment(res.data.data);
  },

  delete: async (id) => {
    await api.delete(`/departments/${id}`);
    return { success: true };
  }
};
