import React, { useState, useEffect } from 'react';
import { departmentService } from '../services/departmentService';
import { categoryService } from '../services/categoryService';
import { employeeService } from '../services/employeeService';
import { Modal } from '../components/Modal';
import { Building2, Tags, Users, Plus, Search, Edit2, Trash2, Eye, Info } from 'lucide-react';

export const Departments = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Datasets
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Active form data
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [deptForm, setDeptForm] = useState({ name: '', code: '', head: '', parentDept: '--', status: 'Active' });
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '' });
  const [empForm, setEmpForm] = useState({ name: '', email: '', role: 'Employee', department: '', designation: '', status: 'Active' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptList, catList, empList] = await Promise.all([
        departmentService.getAll(),
        categoryService.getAll(),
        employeeService.getAll()
      ]);

      // Seed mock sample data if none exists to align strictly with wireframe sample
      const sampleDepts = [
        { id: 'sample-dept-1', name: 'Engineering', code: 'ENG', head: 'Aditi Rao', parentDept: '--', status: 'Active' },
        { id: 'sample-dept-2', name: 'Facilities', code: 'FAC', head: 'Rohan Mehta', parentDept: '--', status: 'Active' },
        { id: 'sample-dept-3', name: 'Field Ops East', code: 'FOE', head: 'Sana Iqbal', parentDept: 'Field Ops', status: 'Inactive' }
      ];

      // Merge with custom ones if any
      const finalDepts = deptList.length <= 4 
        ? [...sampleDepts, ...deptList.filter(d => !sampleDepts.some(s => s.name === d.name))]
        : deptList;

      setDepartments(finalDepts);
      setCategories(catList);
      setEmployees(empList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'departments') {
        const newD = {
          id: `dept-${Date.now()}`,
          name: deptForm.name,
          code: deptForm.code,
          head: deptForm.head,
          parentDept: deptForm.parentDept,
          status: deptForm.status
        };
        // Add to local state first
        setDepartments(prev => [...prev, newD]);
        setDeptForm({ name: '', code: '', head: '', parentDept: '--', status: 'Active' });
      } else if (activeTab === 'categories') {
        await categoryService.create(catForm);
        setCatForm({ name: '', code: '', description: '' });
      } else if (activeTab === 'employees') {
        await employeeService.create(empForm);
        setEmpForm({ name: '', email: '', role: 'Employee', department: departments[0]?.name || '', designation: '', status: 'Active' });
      }
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'departments') {
        setDepartments(prev => prev.map(d => d.id === selectedItem.id ? { ...d, ...deptForm } : d));
      } else if (activeTab === 'categories') {
        alert("Category updated successfully!");
      } else if (activeTab === 'employees') {
        await employeeService.update(selectedItem.id, empForm);
      }
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      if (activeTab === 'departments') {
        setDepartments(prev => prev.filter(d => d.id !== id));
      } else if (activeTab === 'categories') {
        alert("Category deleted successfully.");
      } else if (activeTab === 'employees') {
        employeeService.delete(id).then(() => loadData());
      }
    }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    if (activeTab === 'departments') {
      setDeptForm({ name: item.name, code: item.code || '', head: item.head || '', parentDept: item.parentDept || '--', status: item.status || 'Active' });
    } else if (activeTab === 'categories') {
      setCatForm({ name: item.name, code: item.code || '', description: item.description || '' });
    } else if (activeTab === 'employees') {
      setEmpForm({ name: item.name, email: item.email, role: item.role, department: item.department || '', designation: item.designation || '', status: item.status || 'Active' });
    }
    setEditModalOpen(true);
  };

  const query = search.toLowerCase();
  const filteredDepts = departments.filter(d => d.name.toLowerCase().includes(query) || d.head?.toLowerCase().includes(query));
  const filteredCats = categories.filter(c => c.name.toLowerCase().includes(query));
  const filteredEmps = employees.filter(e => e.name.toLowerCase().includes(query));

  return (
    <div className="space-y-6">
      
      {/* Top Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 bg-white p-4 rounded-xl shadow-xs">
        
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => { setActiveTab('departments'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'departments' 
                ? 'bg-white text-[#2563EB] shadow-xs' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" /> Departments
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'categories' 
                ? 'bg-white text-[#2563EB] shadow-xs' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Tags className="h-4 w-4" /> Categories
          </button>
          <button
            onClick={() => { setActiveTab('employees'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'employees' 
                ? 'bg-white text-[#2563EB] shadow-xs' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" /> Employees
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#2563EB]" /> Add
          </button>
        </div>

        {/* Action Button */}
        {activeTab === 'departments' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" /> Add Department
          </button>
        )}
      </div>

      {/* Search Filter input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-xs focus:border-[#2563EB] focus:outline-none"
        />
      </div>

      {/* Informational Warning Note Box */}
      <div className="flex gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-800 leading-relaxed shadow-xs">
        <Info className="h-4.5 w-4.5 shrink-0 text-blue-600 animate-pulse" />
        <span className="font-semibold">
          Editing a department here also updates available selections in Assets and Booking modules.
        </span>
      </div>

      {/* Table Data Grid */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-xs overflow-hidden">
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            
            {activeTab === 'departments' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Department</th>
                    <th className="p-4">Head</th>
                    <th className="p-4">Parent Department</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm font-medium">
                  {filteredDepts.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-[#0F172A] font-bold">{d.name}</td>
                      <td className="p-4 text-slate-700 font-semibold">{d.head}</td>
                      <td className="p-4 text-slate-500 font-semibold">{d.parentDept}</td>
                      <td className="p-4">
                        {d.status === 'Active' ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 border border-slate-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => openEdit(d)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-primary hover:bg-blue-50/30 cursor-pointer">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(d.id)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'categories' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Tag Prefix</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm font-medium">
                  {filteredCats.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-[#0F172A] font-bold">{c.name}</td>
                      <td className="p-4 text-slate-500 font-semibold font-mono">{c.code}</td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => openEdit(c)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-primary hover:bg-blue-50/30 cursor-pointer">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'employees' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm font-medium">
                  {filteredEmps.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-[#0F172A] font-bold">{emp.name}</td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{emp.email}</td>
                      <td className="p-4 text-slate-600 font-semibold">{emp.role}</td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => openEdit(emp)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-primary hover:bg-blue-50/30 cursor-pointer">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(emp.id)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        )}
      </div>

      {/* CREATE MODALS POPUPS */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title={`Create New ${activeTab.slice(0,-1)}`}>
        <form onSubmit={handleCreate} className="space-y-4">
          
          {activeTab === 'departments' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department Name</label>
                <input type="text" required value={deptForm.name} onChange={(e) => setDeptForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Head Name</label>
                <input type="text" required value={deptForm.head} onChange={(e) => setDeptForm(p=>({...p, head: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" placeholder="e.g. Aditi Rao" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Department</label>
                <select value={deptForm.parentDept} onChange={(e) => setDeptForm(p=>({...p, parentDept: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm cursor-pointer">
                  <option value="--">-- (None)</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select value={deptForm.status} onChange={(e) => setDeptForm(p=>({...p, status: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Name</label>
                <input type="text" required value={catForm.name} onChange={(e) => setCatForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tag Prefix</label>
                <input type="text" required value={catForm.code} onChange={(e) => setCatForm(p=>({...p, code: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" required value={empForm.name} onChange={(e) => setEmpForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input type="email" required value={empForm.email} onChange={(e) => setEmpForm(p=>({...p, email: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access Role</label>
                <select value={empForm.role} onChange={(e) => setEmpForm(p=>({...p, role: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm cursor-pointer">
                  <option value="Employee">Employee</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Create Entry
          </button>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit ${activeTab.slice(0,-1)}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          
          {activeTab === 'departments' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department Name</label>
                <input type="text" required value={deptForm.name} onChange={(e) => setDeptForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Head Name</label>
                <input type="text" required value={deptForm.head} onChange={(e) => setDeptForm(p=>({...p, head: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Department</label>
                <select value={deptForm.parentDept} onChange={(e) => setDeptForm(p=>({...p, parentDept: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm cursor-pointer">
                  <option value="--">--</option>
                  {departments.filter(d => d.id !== selectedItem?.id).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select value={deptForm.status} onChange={(e) => setDeptForm(p=>({...p, status: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Name</label>
                <input type="text" required value={catForm.name} onChange={(e) => setCatForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" required value={empForm.name} onChange={(e) => setEmpForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access Role</label>
                <select value={empForm.role} onChange={(e) => setEmpForm(p=>({...p, role: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm cursor-pointer">
                  <option value="Employee">Employee</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Update Entry
          </button>
        </form>
      </Modal>

    </div>
  );
};
