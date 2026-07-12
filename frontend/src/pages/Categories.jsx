import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { Modal } from '../components/Modal';
import { Tags, Plus } from 'lucide-react';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', code: '', description: '' });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await categoryService.create(newCat);
      setCreateModalOpen(false);
      setNewCat({ name: '', code: '', description: '' });
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" /> Asset Categories
          </h3>
          <p className="text-xs text-slate-400 mt-1">Specify taxonomy classes and unique serial tag prefixes.</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-xl bg-slate-200"></div>
          ))
        ) : categories.map(c => (
          <div key={c.id} className="rounded-xl border border-brand-border bg-brand-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 uppercase">
                {c.code}
              </span>
              <h4 className="font-bold text-brand-text text-sm mt-2">{c.name}</h4>
              {c.description && <p className="text-xs text-slate-450 mt-2 line-clamp-2">{c.description}</p>}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Asset Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category Name</label>
              <input
                type="text" required
                value={newCat.name}
                onChange={(e) => setNewCat(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Networking Hardware"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tag Prefix Code</label>
              <input
                type="text" required
                value={newCat.code}
                onChange={(e) => setNewCat(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g. NET (translates to tag AST-NET-001)"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={newCat.description}
              onChange={(e) => setNewCat(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Routers, switches, optical transceivers..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none h-20"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Create Category
          </button>
        </form>
      </Modal>

    </div>
  );
};
