import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { Modal } from '../components/Modal';
import { ROLES } from '../constants';
import { Users, Plus, Edit2, Trash2, Mail, Briefcase, KeyRound } from 'lucide-react';

export const Employees = () => {
  const { isAssetManager } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Dialogs Control
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: 'password123', role: ROLES.EMPLOYEE, department: '', designation: '' });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
      if (data.length > 0) setNewEmployee(prev => ({ ...prev, department: data[0].name }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await employeeService.create(newEmployee);
      setCreateModalOpen(false);
      setNewEmployee({ name: '', email: '', password: 'password123', role: ROLES.EMPLOYEE, department: departments[0]?.name || '', designation: '' });
      loadEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Delete this employee record from system?')) {
      try {
        await employeeService.delete(id);
        loadEmployees();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search/Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Employees Registry
          </h3>
          <p className="text-xs text-slate-400 mt-1">Review system staff access roles and department assignments.</p>
        </div>

        {isAssetManager && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Employee
          </button>
        )}
      </div>

      {/* Staff Registry Table */}
      <div className="rounded-xl border border-brand-border bg-brand-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold">No employees registered.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Status</th>
                  {isAssetManager && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-sm">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-brand-text">{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-medium font-mono text-xs">{emp.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        emp.role === ROLES.ADMIN ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        emp.role === ROLES.ASSET_MANAGER ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        emp.role === ROLES.DEPARTMENT_HEAD ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-semibold">{emp.department}</td>
                    <td className="p-4 text-slate-500 font-medium">{emp.designation}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-250">
                        Active
                      </span>
                    </td>
                    {isAssetManager && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register New Corporate Employee">
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text" required
              value={newEmployee.name}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. John Doe"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email" required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">System Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password" required
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Access Role</label>
              <select
                value={newEmployee.role}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              >
                {Object.values(ROLES).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <select
                value={newEmployee.department}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Designation/Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text" required
                value={newEmployee.designation}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, designation: e.target.value }))}
                placeholder="e.g. Lead Analyst"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Register Employee
          </button>
        </form>
      </Modal>

    </div>
  );
};
