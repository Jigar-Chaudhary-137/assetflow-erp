import React, { useState, useEffect } from 'react';
import { departmentService } from '../services/departmentService';
import { categoryService } from '../services/categoryService';
import { employeeService } from '../services/employeeService';
import { Modal } from '../components/Modal';
import { 
  Building2, 
  Tags, 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // States
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modal forms
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', head: '', parentDept: '-', status: 'Active' });
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '' });
  const [empForm, setEmpForm] = useState({ name: '', employeeId: '', department: '', role: 'Employee', status: 'Active' });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [deptList, catList, empList] = await Promise.all([
        departmentService.getAll(),
        categoryService.getAll(),
        employeeService.getAll()
      ]);

      // Strictly map the wireframe sample data for Departments
      const sampleDepts = [
        { id: 'd-1', name: 'Engineering', head: 'Aditi Rao', parentDept: '-', status: 'Active' },
        { id: 'd-2', name: 'Facilities', head: 'Rohan Mehta', parentDept: '-', status: 'Active' },
        { id: 'd-3', name: 'Field Operations (East)', head: 'Sana Iqbal', parentDept: 'Field Ops', status: 'Inactive' }
      ];
      
      const finalDepts = deptList.length <= 4 
        ? [...sampleDepts, ...deptList.filter(d => !sampleDepts.some(s => s.name === d.name))]
        : deptList;

      // Sample Categories
      const sampleCats = [
        { id: 'c-1', name: 'Laptops', code: 'LPT' },
        { id: 'c-2', name: 'Projectors', code: 'PRJ' },
        { id: 'c-3', name: 'Vehicles', code: 'VEH' },
        { id: 'c-4', name: 'Furniture', code: 'FNT' },
        { id: 'c-5', name: 'Conference Rooms', code: 'CR' }
      ];
      
      const finalCats = catList.length <= 4
        ? [...sampleCats, ...catList.filter(c => !sampleCats.some(s => s.name === c.name))]
        : catList;

      // Sample Employees
      const sampleEmps = [
        { id: 'e-1', name: 'Aditi Rao', employeeId: 'EMP-001', department: 'Engineering', role: 'Department Head', status: 'Active' },
        { id: 'e-2', name: 'Rohan Mehta', employeeId: 'EMP-002', department: 'Facilities', role: 'Department Head', status: 'Active' },
        { id: 'e-3', name: 'Sana Iqbal', employeeId: 'EMP-003', department: 'Field Operations (East)', role: 'Lead Field Officer', status: 'Inactive' }
      ];

      const finalEmps = empList.length <= 4
        ? [...sampleEmps, ...empList.filter(e => !sampleEmps.some(s => s.name === e.name))]
        : empList;

      setDepartments(finalDepts);
      setCategories(finalCats);
      setEmployees(finalEmps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'departments') {
        const item = {
          id: `dept-${Date.now()}`,
          name: deptForm.name,
          head: deptForm.head,
          parentDept: deptForm.parentDept,
          status: deptForm.status
        };
        setDepartments(prev => [...prev, item]);
        setDeptForm({ name: '', head: '', parentDept: '-', status: 'Active' });
      } else if (activeTab === 'categories') {
        const item = {
          id: `cat-${Date.now()}`,
          name: catForm.name,
          code: catForm.code
        };
        setCategories(prev => [...prev, item]);
        setCatForm({ name: '', code: '', description: '' });
      } else if (activeTab === 'employees') {
        const item = {
          id: `emp-${Date.now()}`,
          name: empForm.name,
          employeeId: empForm.employeeId,
          department: empForm.department,
          role: empForm.role,
          status: empForm.status
        };
        setEmployees(prev => [...prev, item]);
        setEmpForm({ name: '', employeeId: '', department: departments[0]?.name || '', role: 'Employee', status: 'Active' });
      }
      setCreateModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this setup record?')) {
      if (activeTab === 'departments') setDepartments(p => p.filter(x => x.id !== id));
      if (activeTab === 'categories') setCategories(p => p.filter(x => x.id !== id));
      if (activeTab === 'employees') setEmployees(p => p.filter(x => x.id !== id));
    }
  };

  const query = search.toLowerCase();
  const filteredDepts = departments.filter(d => d.name.toLowerCase().includes(query) || d.head?.toLowerCase().includes(query));
  const filteredCats = categories.filter(c => c.name.toLowerCase().includes(query));
  const filteredEmps = employees.filter(e => e.name.toLowerCase().includes(query));

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">Organization Setup</h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage departments, categories and employees used across AssetFlow.
        </p>
      </div>

      {/* Top Tabs Segment Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 bg-white p-4 rounded-xl shadow-xs">
        
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => { setActiveTab('departments'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              activeTab === 'departments' 
                ? 'bg-blue-50 text-[#2563EB] border-blue-200 shadow-2xs' 
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" /> Departments
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              activeTab === 'categories' 
                ? 'bg-blue-50 text-[#2563EB] border-blue-200 shadow-2xs' 
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            <Tags className="h-4 w-4" /> Categories
          </button>
          <button
            onClick={() => { setActiveTab('employees'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              activeTab === 'employees' 
                ? 'bg-blue-50 text-[#2563EB] border-blue-200 shadow-2xs' 
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" /> Employees
          </button>
          <button
            onClick={() => {
              if (departments.length > 0 && activeTab === 'employees') {
                setEmpForm(p => ({ ...p, department: departments[0].name }));
              }
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#2563EB]" /> Add
          </button>
        </div>

        {/* Create button */}
        <button
          onClick={() => {
            if (departments.length > 0 && activeTab === 'employees') {
              setEmpForm(p => ({ ...p, department: departments[0].name }));
            }
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
        </button>
      </div>

      {/* Search Filter Box */}
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

      {/* Main Grid Tables */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            
            {/* 1. DEPARTMENTS VIEW */}
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
                    <tr key={d.id} className="hover:bg-slate-50/50 text-[#0F172A]">
                      <td className="p-4 font-bold">{d.name}</td>
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
                        <button onClick={() => handleDelete(d.id)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. CATEGORIES VIEW */}
            {activeTab === 'categories' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Category</th>
                    <th className="p-4">Tag Code</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm font-medium">
                  {filteredCats.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 text-[#0F172A]">
                      <td className="p-4 font-bold">{c.name}</td>
                      <td className="p-4 text-slate-500 font-mono font-semibold">{c.code}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(c.id)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. EMPLOYEES VIEW */}
            {activeTab === 'employees' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Employee ID</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm font-medium">
                  {filteredEmps.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 text-[#0F172A]">
                      <td className="p-4 font-bold">{emp.name}</td>
                      <td className="p-4 text-slate-500 font-mono text-xs font-semibold">{emp.employeeId}</td>
                      <td className="p-4 text-slate-700 font-semibold">{emp.department}</td>
                      <td className="p-4 text-slate-605">{emp.role}</td>
                      <td className="p-4">
                        {emp.status === 'Active' ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-550 border border-slate-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(emp.id)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        )}
      </div>

      {/* BOTTOM INFORMATION SECTION */}
      <div className="flex gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-800 leading-relaxed shadow-xs">
        <Info className="h-4.5 w-4.5 shrink-0 text-blue-600 animate-pulse" />
        <span className="font-semibold">
          Editing a department here automatically updates dropdown options in Assets, Allocation & Transfer and Resource Booking pages.
        </span>
      </div>

      {/* ADD SETUP MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title={`Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}>
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Departments Form */}
          {activeTab === 'departments' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department Name</label>
                <input type="text" required value={deptForm.name} onChange={(e) => setDeptForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" placeholder="e.g. Finance" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department Head</label>
                <input type="text" required value={deptForm.head} onChange={(e) => setDeptForm(p=>({...p, head: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parent Department</label>
                <select value={deptForm.parentDept} onChange={(e) => setDeptForm(p=>({...p, parentDept: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer">
                  <option value="-">- (None)</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select value={deptForm.status} onChange={(e) => setDeptForm(p=>({...p, status: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Categories Form */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Name</label>
                <input type="text" required value={catForm.name} onChange={(e) => setCatForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tag Code Prefix</label>
                <input type="text" required value={catForm.code} onChange={(e) => setCatForm(p=>({...p, code: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
              </div>
            </div>
          )}

          {/* Employees Form */}
          {activeTab === 'employees' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee Name</label>
                <input type="text" required value={empForm.name} onChange={(e) => setEmpForm(p=>({...p, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee ID</label>
                <input type="text" required value={empForm.employeeId} onChange={(e) => setEmpForm(p=>({...p, employeeId: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" placeholder="EMP-XXX" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                <select value={empForm.department} onChange={(e) => setEmpForm(p=>({...p, department: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer">
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                <input type="text" value={empForm.role} onChange={(e) => setEmpForm(p=>({...p, role: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select value={empForm.status} onChange={(e) => setEmpForm(p=>({...p, status: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Save Button
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
