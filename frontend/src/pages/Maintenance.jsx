import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { maintenanceService } from '../services/maintenanceService';
import { assetService } from '../services/assetService';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { MAINTENANCE_STATUS } from '../constants';
import { Wrench, Plus, Check, Play, CheckCheck, XCircle, AlertTriangle } from 'lucide-react';

export const Maintenance = () => {
  const { user, isAssetManager } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ assetId: '', issueDescription: '', priority: 'Medium', cost: 0 });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getAll();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const data = await assetService.getAll();
      setAssets(data);
      if (data.length > 0) setNewRequest(prev => ({ ...prev, assetId: data[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
    loadAssets();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.create(newRequest);
      setRequestModalOpen(false);
      setNewRequest({ assetId: assets[0]?.id || '', issueDescription: '', priority: 'Medium', cost: 0 });
      loadTickets();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve maintenance work? The asset status will become Under Maintenance.')) {
      try {
        await maintenanceService.approve(id);
        loadTickets();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleStart = async (id) => {
    try {
      await maintenanceService.start(id);
      loadTickets();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (id) => {
    const notes = window.prompt('Enter repair details / completion notes:');
    if (notes !== null) {
      try {
        await maintenanceService.complete(id, notes);
        loadTickets();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this maintenance request?')) {
      try {
        await maintenanceService.cancel(id);
        loadTickets();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const visibleTickets = user?.role === 'Employee' 
    ? tickets.filter(t => t.requestedBy === user.name) 
    : tickets;

  const priorityColors = {
    Low: 'bg-slate-100 text-slate-700',
    Medium: 'bg-amber-100 text-amber-800',
    High: 'bg-rose-100 text-rose-800 font-semibold'
  };

  return (
    <div className="space-y-6">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> Active Maintenance & Repairs
          </h3>
          <p className="text-xs text-slate-400 mt-1">Submit fault tickets and track mechanical or IT hardware repairs.</p>
        </div>

        <button
          onClick={() => setRequestModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Request Maintenance
        </button>
      </div>

      {/* Tickets Registry grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 w-full animate-pulse rounded-xl bg-slate-200"></div>
          ))
        ) : visibleTickets.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-xl border border-brand-border bg-brand-card text-slate-400 font-semibold">
            No active maintenance requests lodged.
          </div>
        ) : (
          visibleTickets.map(t => (
            <div key={t.id} className="rounded-xl border border-brand-border bg-brand-card p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-2 py-0.5">{t.assetTag}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityColors[t.priority]}`}>
                    {t.priority}
                  </span>
                </div>

                <h4 className="font-bold text-brand-text text-sm line-clamp-1">{t.assetName}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">Fault: <span className="font-medium text-slate-600 line-clamp-2">"{t.issueDescription}"</span></p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Requested by: <span className="font-semibold text-slate-600">{t.requestedBy}</span></p>
                {t.cost > 0 && <p className="text-xs text-slate-400 font-semibold">Budget: <span className="text-slate-600">${t.cost}</span></p>}
                
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400 font-semibold">Status:</span>
                  <Badge status={t.status} type="maintenance" />
                </div>

                {t.notes && (
                  <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-2 text-[11px] text-slate-500 italic">
                    <span className="font-bold not-italic block text-[10px] text-slate-400 mb-0.5">COMPLETION REMARKS:</span>
                    "{t.notes}"
                  </div>
                )}
              </div>

              {/* Action Triggers based on state and role */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                
                {/* 1. Pending Approval */}
                {t.status === MAINTENANCE_STATUS.PENDING && isAssetManager && (
                  <>
                    <button
                      onClick={() => handleApprove(t.id)}
                      className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleCancel(t.id)}
                      className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* 2. Approved */}
                {t.status === MAINTENANCE_STATUS.APPROVED && isAssetManager && (
                  <button
                    onClick={() => handleStart(t.id)}
                    className="w-full inline-flex justify-center items-center gap-1 rounded-lg bg-blue-600 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" /> Start Maintenance
                  </button>
                )}

                {/* 3. In Progress */}
                {t.status === MAINTENANCE_STATUS.IN_PROGRESS && isAssetManager && (
                  <>
                    <button
                      onClick={() => handleComplete(t.id)}
                      className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Complete
                    </button>
                    <button
                      onClick={() => handleCancel(t.id)}
                      className="flex-1 inline-flex justify-center items-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}

              </div>

            </div>
          ))
        )}
      </div>

      {/* Request Maintenance Dialog Modal */}
      <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} title="Submit Asset Maintenance Ticket">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Asset</label>
            <select
              value={newRequest.assetId}
              onChange={(e) => setNewRequest(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
            >
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag} - {asset.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issue/Fault Description</label>
            <textarea
              required
              value={newRequest.issueDescription}
              onChange={(e) => setNewRequest(prev => ({ ...prev, issueDescription: e.target.value }))}
              placeholder="Describe the hardware problem in detail (e.g. key details, serial faults)..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none h-24"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estimated Cost ($ USD)</label>
              <input
                type="number"
                value={newRequest.cost}
                onChange={(e) => setNewRequest(prev => ({ ...prev, cost: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            File Maintenance Request
          </button>
        </form>
      </Modal>

    </div>
  );
};
