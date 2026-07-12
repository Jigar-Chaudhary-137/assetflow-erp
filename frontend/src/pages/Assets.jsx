import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';
import { allocationService } from '../services/allocationService';
import { bookingService } from '../services/bookingService';
import { maintenanceService } from '../services/maintenanceService';
import { categoryService } from '../services/categoryService';
import { departmentService } from '../services/departmentService';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ASSET_STATUS, PRIORITY_LEVELS } from '../constants';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  UserCheck, 
  CalendarRange, 
  Wrench,
  XCircle,
  MapPin,
  SlidersHorizontal,
  ClipboardList
} from 'lucide-react';

export const Assets = () => {
  const { isAssetManager, user } = useAuth();
  const { fetchNotifications } = useNotifications();

  // List States
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state values
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Selected & Drawer States
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // Meta collections
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modals Visibility
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  // Form schemas
  const [newAsset, setNewAsset] = useState({ name: '', model: '', serialNumber: '', category: '', department: '', location: '', purchaseDate: '', purchaseCost: 0, notes: '' });
  const [editForm, setEditForm] = useState({ name: '', model: '', serialNumber: '', category: '', department: '', location: '', purchaseDate: '', purchaseCost: 0, notes: '', status: '' });
  const [allocationForm, setAllocationForm] = useState({ employeeId: '', dueDate: '', notes: '' });
  const [bookingForm, setBookingForm] = useState({ startDate: '', endDate: '', purpose: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ issueDescription: '', priority: 'Medium', cost: 0 });

  const loadAssets = async () => {
    try {
      setLoading(true);
      const list = await assetService.getAll({
        search,
        status: statusFilter,
        category: categoryFilter
      });
      
      // Additional local department filter
      let filteredList = list;
      if (deptFilter) {
        filteredList = list.filter(a => a.department === deptFilter);
      }
      setAssets(filteredList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [empList, catList, deptList] = await Promise.all([
        employeeService.getAll(),
        categoryService.getAll(),
        departmentService.getAll()
      ]);
      setEmployees(empList);
      setCategories(catList);
      setDepartments(deptList);
      
      if (catList.length > 0) setNewAsset(prev => ({ ...prev, category: catList[0].name }));
      if (deptList.length > 0) setNewAsset(prev => ({ ...prev, department: deptList[0].name }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [search, statusFilter, categoryFilter, deptFilter]);

  useEffect(() => {
    loadMetadata();
  }, []);

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await assetService.create(newAsset);
      setCreateModalOpen(false);
      setNewAsset({ name: '', model: '', serialNumber: '', category: categories[0]?.name || '', department: departments[0]?.name || '', location: '', purchaseDate: '', purchaseCost: 0, notes: '' });
      loadAssets();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditAssetSubmit = async (e) => {
    e.preventDefault();
    try {
      await assetService.update(selectedAsset.id, editForm);
      if (editForm.status !== selectedAsset.status) {
        await assetService.changeStatus(selectedAsset.id, editForm.status);
      }
      setEditModalOpen(false);
      loadAssets();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetService.delete(id);
        loadAssets();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAllocateAsset = async (e) => {
    e.preventDefault();
    try {
      await allocationService.allocate({
        assetId: selectedAsset.id,
        ...allocationForm
      });
      setAllocateModalOpen(false);
      setAllocationForm({ employeeId: '', dueDate: '', notes: '' });
      loadAssets();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBookAsset = async (e) => {
    e.preventDefault();
    try {
      await bookingService.create({
        assetId: selectedAsset.id,
        employeeId: user.id,
        ...bookingForm
      });
      setBookModalOpen(false);
      setBookingForm({ startDate: '', endDate: '', purpose: '' });
      loadAssets();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRequestMaintenance = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.create({
        assetId: selectedAsset.id,
        ...maintenanceForm
      });
      setMaintenanceModalOpen(false);
      setMaintenanceForm({ issueDescription: '', priority: 'Medium', cost: 0 });
      loadAssets();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const openActionModal = (asset, actionType) => {
    setSelectedAsset(asset);
    if (actionType === 'allocate') {
      if (employees.length > 0) setAllocationForm(prev => ({ ...prev, employeeId: employees[0].id }));
      setAllocateModalOpen(true);
    }
    if (actionType === 'book') setBookModalOpen(true);
    if (actionType === 'maintenance') setMaintenanceModalOpen(true);
    if (actionType === 'view') setDetailDrawerOpen(true);
    if (actionType === 'edit') {
      setEditForm({
        name: asset.name,
        model: asset.model,
        serialNumber: asset.serialNumber || '',
        category: asset.category,
        department: asset.department,
        location: asset.location,
        purchaseDate: asset.purchaseDate,
        purchaseCost: asset.purchaseCost,
        notes: asset.notes || '',
        status: asset.status
      });
      setEditModalOpen(true);
    }
  };

  // Custom visual badge mapper matching table wireframe criteria
  const getWireframeBadge = (status) => {
    if (status === ASSET_STATUS.AVAILABLE) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
          Available
        </span>
      );
    }
    if (status === ASSET_STATUS.ALLOCATED) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Allocated
        </span>
      );
    }
    if (status === ASSET_STATUS.UNDER_MAINTENANCE) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-250">
          Maintenance
        </span>
      );
    }
    if (status === ASSET_STATUS.LOST) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-250">
          Lost
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300">
        Retired
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
        
        {/* Search Input supporting Name, Serial, QR Tag */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset name, serial number, or QR tag..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-[#0F172A] placeholder-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Action button */}
        {isAssetManager && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-all shrink-0 w-full md:w-auto justify-center"
          >
            <Plus className="h-4 w-4" /> Register Asset
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-[#E2E8F0] p-3 rounded-xl shadow-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Filters:</span>
        
        {/* Category filter */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs">
          <ClipboardList className="h-3.5 w-3.5 text-slate-450" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent border-none font-semibold focus:outline-none text-slate-700 cursor-pointer">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-450" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent border-none font-semibold focus:outline-none text-slate-700 cursor-pointer">
            <option value="">All Statuses</option>
            {Object.values(ASSET_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Department filter */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs">
          <MapPin className="h-3.5 w-3.5 text-slate-450" />
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="bg-transparent border-none font-semibold focus:outline-none text-slate-700 cursor-pointer">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Asset Data Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-xs overflow-hidden">
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 rounded-xl text-slate-400 font-semibold flex flex-col items-center justify-center">
            <XCircle className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            No assets matched search queries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Asset ID</th>
                  <th className="p-4">Asset Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm font-medium">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold font-mono text-[#0F172A] text-xs">{asset.assetTag}</td>
                    <td className="p-4 text-[#0F172A] font-bold">{asset.name}</td>
                    <td className="p-4 text-slate-500 font-semibold">{asset.category}</td>
                    <td className="p-4">{getWireframeBadge(asset.status)}</td>
                    <td className="p-4 text-slate-500 text-xs">{asset.location}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        {/* Quick Allocation action if available */}
                        {asset.status === ASSET_STATUS.AVAILABLE && isAssetManager && (
                          <button onClick={() => openActionModal(asset, 'allocate')} className="rounded-lg border border-slate-200 bg-white p-1.5 text-emerald-600 hover:bg-emerald-50 cursor-pointer" title="Allocate">
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => openActionModal(asset, 'view')} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 cursor-pointer" title="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {isAssetManager && (
                          <>
                            <button onClick={() => openActionModal(asset, 'edit')} className="rounded-lg border border-slate-200 bg-white p-1.5 text-primary hover:bg-blue-50/30 cursor-pointer" title="Edit specifications">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteAsset(asset.id)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer" title="Delete record">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register Asset">
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Name</label>
              <input type="text" required value={newAsset.name} onChange={(e) => setNewAsset(prev=>({...prev, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" placeholder="e.g. Dell Monitor" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model Spec</label>
              <input type="text" required value={newAsset.model} onChange={(e) => setNewAsset(prev=>({...prev, model: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serial Number</label>
              <input type="text" required value={newAsset.serialNumber} onChange={(e) => setNewAsset(prev=>({...prev, serialNumber: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
              <select value={newAsset.category} onChange={(e) => setNewAsset(prev=>({...prev, category: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Tag</label>
              <input type="text" value={newAsset.assetTag} onChange={(e) => setNewAsset(prev=>({...prev, assetTag: e.target.value}))} placeholder="AST-XXXX" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valuation Cost ($)</label>
              <input type="number" required value={newAsset.purchaseCost} onChange={(e) => setNewAsset(prev=>({...prev, purchaseCost: Number(e.target.value)}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
              <select value={newAsset.department} onChange={(e) => setNewAsset(prev=>({...prev, department: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer">
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room/Location</label>
              <input type="text" required value={newAsset.location} onChange={(e) => setNewAsset(prev=>({...prev, location: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Register Asset
          </button>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Asset: ${selectedAsset?.name}`}>
        <form onSubmit={handleEditAssetSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Name</label>
              <input type="text" required value={editForm.name} onChange={(e) => setEditForm(prev=>({...prev, name: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model Spec</label>
              <input type="text" required value={editForm.model} onChange={(e) => setEditForm(prev=>({...prev, model: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serial Number</label>
              <input type="text" required value={editForm.serialNumber} onChange={(e) => setEditForm(prev=>({...prev, serialNumber: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm(prev=>({...prev, status: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer">
                {Object.values(ASSET_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
              <input type="text" required value={editForm.location} onChange={(e) => setEditForm(prev=>({...prev, location: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Update Asset
          </button>
        </form>
      </Modal>

      {/* ALLOCATE MODAL */}
      <Modal isOpen={allocateModalOpen} onClose={() => setAllocateModalOpen(false)} title={`Allocate Asset: ${selectedAsset?.name}`}>
        <form onSubmit={handleAllocateAsset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assignee Employee</label>
            <select value={allocationForm.employeeId} onChange={(e) => setAllocationForm(prev=>({...prev, employeeId: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer">
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Return Due Date</label>
            <input type="date" required value={allocationForm.dueDate} onChange={(e) => setAllocationForm(prev=>({...prev, dueDate: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Remarks</label>
            <textarea value={allocationForm.notes} onChange={(e) => setAllocationForm(prev=>({...prev, notes: e.target.value}))} className="w-full rounded-lg border border-slate-300 p-2 text-sm h-16" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-650 py-2.5 text-sm font-bold text-white hover:bg-emerald-705 cursor-pointer">
            Issue Allocation
          </button>
        </form>
      </Modal>

      {/* VIEW DRAWERS OVERLAY */}
      {detailDrawerOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setDetailDrawerOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white border-l border-slate-200 p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 tracking-wide uppercase">
                    {selectedAsset.assetTag}
                  </span>
                  <h3 className="mt-1.5 text-lg font-bold text-slate-800">{selectedAsset.name}</h3>
                </div>
                <button onClick={() => setDetailDrawerOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-650 font-bold">
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Model Specification</span>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.model}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Serial Number</span>
                  <p className="font-semibold text-slate-700 font-mono mt-0.5">{selectedAsset.serialNumber || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Status</span>
                    <div className="mt-1">{getWireframeBadge(selectedAsset.status)}</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</span>
                    <p className="font-semibold text-slate-700 mt-1">{selectedAsset.category}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Department Location</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedAsset.location} • {selectedAsset.department}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Purchase Value</span>
                    <p className="font-bold text-slate-700 mt-0.5">${selectedAsset.purchaseCost}</p>
                  </div>
                </div>
                {selectedAsset.notes && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Specifications Notes</span>
                    <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">"{selectedAsset.notes}"</p>
                  </div>
                )}
              </div>
            </div>
            
            <button onClick={() => setDetailDrawerOpen(false)} className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-750 cursor-pointer">
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
