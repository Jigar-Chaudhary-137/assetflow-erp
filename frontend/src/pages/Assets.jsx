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
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  Eye, 
  UserCheck, 
  CalendarRange, 
  Wrench,
  XCircle,
  FileCheck2,
  MapPin,
  ClipboardList
} from 'lucide-react';

export const Assets = () => {
  const { isAssetManager, user } = useAuth();
  const { fetchNotifications } = useNotifications();

  // Primary assets lists
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // Meta collections
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modals visibility toggles
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  // Form input states
  const [newAsset, setNewAsset] = useState({ name: '', model: '', serialNumber: '', category: '', department: '', location: '', purchaseDate: '', purchaseCost: 0, notes: '' });
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
      setAssets(list);
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
      
      // Auto default dropdown categories
      if (catList.length > 0) setNewAsset(prev => ({ ...prev, category: catList[0].name }));
      if (deptList.length > 0) setNewAsset(prev => ({ ...prev, department: deptList[0].name }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [search, statusFilter, categoryFilter]);

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

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetService.delete(id);
        loadAssets();
        fetchNotifications();
        if (selectedAsset?.id === id) setDetailDrawerOpen(false);
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
      setDetailDrawerOpen(false);
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
      setDetailDrawerOpen(false);
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
      setDetailDrawerOpen(false);
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
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-4 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tag, name, serial..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-brand-text placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-450" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none font-semibold focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {Object.values(ASSET_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600">
            <ClipboardList className="h-3.5 w-3.5 text-slate-450" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none font-semibold focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Create Button (Admins only) */}
          {isAssetManager && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-blue-700 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" /> Register Asset
            </button>
          )}

        </div>
      </div>

      {/* Grid container */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 w-full animate-pulse rounded-xl bg-slate-200"></div>
          ))
        ) : assets.length === 0 ? (
          <div className="col-span-full rounded-xl border border-brand-border bg-brand-card p-12 text-center">
            <XCircle className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-base font-bold text-brand-text">No Assets Found</h3>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or query strings.</p>
          </div>
        ) : (
          assets.map(asset => (
            <div 
              key={asset.id} 
              className="group relative flex flex-col justify-between rounded-xl border border-brand-border bg-brand-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              onClick={() => {
                setSelectedAsset(asset);
                setDetailDrawerOpen(true);
              }}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 tracking-wide">
                    {asset.assetTag}
                  </span>
                  <Badge status={asset.status} type="asset" />
                </div>
                
                <h3 className="mt-3 text-base font-bold text-brand-text group-hover:text-primary transition-colors line-clamp-1">
                  {asset.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{asset.model}</p>
                
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{asset.location} • {asset.department}</span>
                </div>
              </div>

              {/* Card Bottom / Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-brand-border pt-4">
                <span className="text-sm font-extrabold text-slate-700">${asset.purchaseCost}</span>
                
                {/* Actions context menu stops propagation to not trigger drawer */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Allocate action */}
                  {asset.status === ASSET_STATUS.AVAILABLE && isAssetManager && (
                    <button
                      onClick={() => openActionModal(asset, 'allocate')}
                      title="Assign/Allocate"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}

                  {/* Reserve/Book action */}
                  {asset.status === ASSET_STATUS.AVAILABLE && (
                    <button
                      onClick={() => openActionModal(asset, 'book')}
                      title="Book Reservation"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <CalendarRange className="h-4 w-4" />
                    </button>
                  )}

                  {/* Maintenance Request */}
                  {(asset.status === ASSET_STATUS.AVAILABLE || asset.status === ASSET_STATUS.ALLOCATED) && (
                    <button
                      onClick={() => openActionModal(asset, 'maintenance')}
                      title="Report Fault/Service"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      <Wrench className="h-4 w-4" />
                    </button>
                  )}

                  {/* Edit/Delete triggers (Admin only) */}
                  {isAssetManager && (
                    <>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        title="Delete Asset"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 1. Register/Create Asset Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register New Corporate Asset">
        <form onSubmit={handleCreateAsset} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Asset Name</label>
              <input
                type="text" required
                value={newAsset.name} onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. MacBook Pro M3"
                className="w-full rounded-lg border border-slate-350 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Model Spec</label>
              <input
                type="text" required
                value={newAsset.model} onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. Apple M3 Max 16GB"
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Serial Number</label>
              <input
                type="text" required
                value={newAsset.serialNumber} onChange={(e) => setNewAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                placeholder="e.g. SN-998822"
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
              <select
                value={newAsset.category} onChange={(e) => setNewAsset(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none cursor-pointer"
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Asset Tag PREFIX</label>
              <input
                type="text"
                value={newAsset.assetTag} onChange={(e) => setNewAsset(prev => ({ ...prev, assetTag: e.target.value }))}
                placeholder="Auto-assigned if blank"
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cost ($ USD)</label>
              <input
                type="number" required
                value={newAsset.purchaseCost} onChange={(e) => setNewAsset(prev => ({ ...prev, purchaseCost: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Purchase Date</label>
              <input
                type="date" required
                value={newAsset.purchaseDate} onChange={(e) => setNewAsset(prev => ({ ...prev, purchaseDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location Department</label>
              <select
                value={newAsset.department} onChange={(e) => setNewAsset(prev => ({ ...prev, department: e.target.value }))}
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none cursor-pointer"
              >
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Room/Location</label>
              <input
                type="text" required
                value={newAsset.location} onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. IT Lab Desk B"
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Internal Notes</label>
              <textarea
                value={newAsset.notes} onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Condition remarks or audit requirements"
                className="w-full rounded-lg border border-slate-355 bg-white py-2 px-3 text-sm focus:border-primary focus:outline-none h-16"
              />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Register Asset
          </button>
        </form>
      </Modal>

      {/* 2. Allocate Asset Modal */}
      <Modal isOpen={allocateModalOpen} onClose={() => setAllocateModalOpen(false)} title={`Allocate Asset: ${selectedAsset?.name}`}>
        <form onSubmit={handleAllocateAsset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assignee Staff Member</label>
            <select
              value={allocationForm.employeeId}
              onChange={(e) => setAllocationForm(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role} - {emp.department})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Return Due Date</label>
            <input
              type="date" required
              value={allocationForm.dueDate}
              onChange={(e) => setAllocationForm(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assignment Remarks</label>
            <textarea
              value={allocationForm.notes}
              onChange={(e) => setAllocationForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Work-from-home deployment clearance."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none h-20"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 cursor-pointer">
            Issue Asset
          </button>
        </form>
      </Modal>

      {/* 3. Book Asset Modal */}
      <Modal isOpen={bookModalOpen} onClose={() => setBookModalOpen(false)} title={`Book Reservation: ${selectedAsset?.name}`}>
        <form onSubmit={handleBookAsset} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date" required
                value={bookingForm.startDate}
                onChange={(e) => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date" required
                value={bookingForm.endDate}
                onChange={(e) => setBookingForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reservation Purpose</label>
              <textarea
                required
                value={bookingForm.purpose}
                onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Briefly state testing / event / presentation purpose."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none h-20"
              />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 cursor-pointer">
            Submit Booking Request
          </button>
        </form>
      </Modal>

      {/* 4. Request Maintenance Modal */}
      <Modal isOpen={maintenanceModalOpen} onClose={() => setMaintenanceModalOpen(false)} title={`Report Asset Fault: ${selectedAsset?.name}`}>
        <form onSubmit={handleRequestMaintenance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fault Description</label>
            <textarea
              required
              value={maintenanceForm.issueDescription}
              onChange={(e) => setMaintenanceForm(prev => ({ ...prev, issueDescription: e.target.value }))}
              placeholder="Detail issues (e.g. cracked screen panel, battery swelling, fluid damage)..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none h-24"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={maintenanceForm.priority}
                onChange={(e) => setMaintenanceForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              >
                {Object.values(PRIORITY_LEVELS).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estimated Cost ($ USD)</label>
              <input
                type="number"
                value={maintenanceForm.cost}
                onChange={(e) => setMaintenanceForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-amber-700 cursor-pointer">
            Submit Maintenance Ticket
          </button>
        </form>
      </Modal>

      {/* 5. Detail Side-Drawer Overlay */}
      {detailDrawerOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDetailDrawerOpen(false)}
          />
          
          {/* Drawer panel */}
          <div className="relative z-10 w-full max-w-md bg-white border-l border-slate-200 p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-350">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 tracking-wide">
                    {selectedAsset.assetTag}
                  </span>
                  <h3 className="mt-1.5 text-lg font-bold text-slate-800">{selectedAsset.name}</h3>
                </div>
                <button 
                  onClick={() => setDetailDrawerOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                >
                  <Eye className="h-5 w-5 rotate-90" />
                </button>
              </div>

              {/* Specs */}
              <div className="mt-6 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Model Specification</span>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{selectedAsset.model}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Serial Number</span>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5 font-mono">{selectedAsset.serialNumber || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">State</span>
                    <div className="mt-1">
                      <Badge status={selectedAsset.status} type="asset" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</span>
                    <p className="text-sm font-bold text-slate-700 mt-1">{selectedAsset.category}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Location</span>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedAsset.location}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cost Value</span>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">${selectedAsset.purchaseCost}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Log Remarks</span>
                  <p className="text-xs text-slate-500 mt-1 italic">{selectedAsset.notes || 'No notes filed.'}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions at Bottom of Drawer */}
            <div className="border-t border-slate-100 pt-4 flex gap-2">
              {selectedAsset.status === ASSET_STATUS.AVAILABLE && isAssetManager && (
                <button
                  onClick={() => openActionModal(selectedAsset, 'allocate')}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
                >
                  <UserCheck className="h-4 w-4" /> Allocate
                </button>
              )}
              {selectedAsset.status === ASSET_STATUS.AVAILABLE && (
                <button
                  onClick={() => openActionModal(selectedAsset, 'book')}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
                >
                  <CalendarRange className="h-4 w-4" /> Book
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
