import React, { useState, useEffect } from 'react';
import { departmentService } from '../services/departmentService';
import { Modal } from '../components/Modal';
import { Building2, Plus, ArrowRight } from 'lucide-react';

export const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', head: '', description: '' });

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await departmentService.create(newDept);
      setCreateModalOpen(false);
      setNewDept({ name: '', code: '', head: '', description: '' });
      loadDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Company Departments
          </h3>
          <p className="text-xs text-slate-400 mt-1">Configure and manage corporate departments and heads.</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-xl bg-slate-200"></div>
          ))
        ) : departments.map(d => (
          <div key={d.id} className="rounded-xl border border-brand-border bg-brand-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 uppercase">
                  {d.code}
                </span>
                <h4 className="font-bold text-brand-text text-sm mt-2">{d.name}</h4>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Head: <span className="font-medium text-slate-600">{d.head || 'Unassigned'}</span></p>
                {d.description && <p className="text-xs text-slate-450 mt-2 line-clamp-2">{d.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Company Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department Name</label>
              <input
                type="text" required
                value={newDept.name}
                onChange={(e) => setNewDept(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sales & Marketing"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department Code</label>
              <input
                type="text" required
                value={newDept.code}
                onChange={(e) => setNewDept(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g. MKT"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department Head Name</label>
              <input
                type="text"
                value={newDept.head}
                onChange={(e) => setNewDept(prev => ({ ...prev, head: e.target.value }))}
                placeholder="e.g. Sarah Jenkins"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={newDept.description}
              onChange={(e) => setNewDept(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Corporate business developer segment."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none h-20"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Create Department
          </button>
        </form>
      </Modal>

    </div>
  );
};
