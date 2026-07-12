import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { maintenanceService } from '../services/maintenanceService';
import { assetService } from '../services/assetService';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { 
  Wrench, 
  Plus, 
  User, 
  Calendar, 
  Info, 
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Clock,
  Play
} from 'lucide-react';

export const Maintenance = () => {
  const { isAssetManager } = useAuth();
  const { fetchNotifications } = useNotifications();

  // Kanban list states
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // New ticket form
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ assetId: '', issueDescription: '', priority: 'Medium', cost: 0 });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketList, assetList] = await Promise.all([
        maintenanceService.getAll(),
        assetService.getAll()
      ]);

      // Wireframe sample Kanban card items
      const sampleTickets = [
        {
          id: 'AF-0062',
          assetId: 'ast-2',
          assetTag: 'AF-0062',
          assetName: 'Projector',
          issueDescription: 'Projector bulb not turning on',
          priority: 'High',
          cost: 80,
          status: 'Pending Approval',
          requestedBy: 'Michael Scott',
          technician: '',
          notes: ''
        },
        {
          id: 'AF-003',
          assetId: 'ast-4',
          assetTag: 'AF-003',
          assetName: 'AC Unit',
          issueDescription: 'AC unit noisy compressor',
          priority: 'Medium',
          cost: 150,
          status: 'Approved',
          requestedBy: 'Sarah Jenkins',
          technician: '',
          notes: ''
        },
        {
          id: 'AF-0079',
          assetId: 'ast-5',
          assetTag: 'AF-0079',
          assetName: 'Forklift',
          issueDescription: 'General service required',
          priority: 'High',
          cost: 300,
          status: 'Technician Assigned',
          requestedBy: 'Alex Rivera',
          technician: 'R Varma',
          notes: ''
        },
        {
          id: 'AF-947',
          assetId: 'ast-1',
          assetTag: 'AF-947',
          assetName: 'Printer',
          issueDescription: 'Printer jam',
          priority: 'Low',
          cost: 50,
          status: 'In Progress',
          requestedBy: 'Jordan Vance',
          technician: 'R Varma',
          notes: 'Parts ordered'
        },
        {
          id: 'AF-873',
          assetId: 'ast-3',
          assetTag: 'AF-873',
          assetName: 'Office Chair',
          issueDescription: 'Chair repair',
          priority: 'Low',
          cost: 20,
          status: 'Completed',
          requestedBy: 'Dwight Schrute',
          technician: 'S Kumar',
          notes: 'Resolved 7 Jul',
          resolutionDate: '7 Jul'
        }
      ];

      // Merge samples with user created tickets
      const mergedTickets = ticketList.length <= 1 
        ? [...sampleTickets, ...ticketList.filter(t => !sampleTickets.some(s => s.id === t.id))]
        : ticketList;

      setTickets(mergedTickets);
      setAssets(assetList);

      if (assetList.length > 0) {
        setNewRequest(prev => ({ ...prev, assetId: assetList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.create(newRequest);
      setRequestModalOpen(false);
      setNewRequest({ assetId: assets[0]?.id || '', issueDescription: '', priority: 'Medium', cost: 0 });
      loadData();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  // Kanban status transitions logic
  const handleTransition = (ticketId, nextStatus, extra = {}) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: nextStatus,
          ...extra
        };
      }
      return t;
    }));
  };

  const handleApprove = (id) => {
    handleTransition(id, 'Approved');
  };

  const handleAssignTechnician = (id) => {
    const techName = window.prompt("Enter technician name:", "R Varma");
    if (techName) {
      handleTransition(id, 'Technician Assigned', { technician: techName });
    }
  };

  const handleStartWork = (id) => {
    handleTransition(id, 'In Progress');
  };

  const handleResolve = (id) => {
    const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    handleTransition(id, 'Completed', { 
      notes: `Resolved ${today}`,
      resolutionDate: today
    });
  };

  // Define Kanban board columns mapping
  const kanbanColumns = [
    { title: 'Pending', key: 'Pending Approval', color: 'bg-slate-400 text-white', dotColor: 'bg-slate-400' },
    { title: 'Approved', key: 'Approved', color: 'bg-blue-600 text-white', dotColor: 'bg-blue-600' },
    { title: 'Technician Assigned', key: 'Technician Assigned', color: 'bg-purple-600 text-white', dotColor: 'bg-purple-600' },
    { title: 'In Progress', key: 'In Progress', color: 'bg-orange-500 text-white', dotColor: 'bg-orange-500' },
    { title: 'Resolved', key: 'Completed', color: 'bg-emerald-600 text-white', dotColor: 'bg-emerald-600' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#2563EB]" /> Maintenance Kanban Board
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Drag-and-drop workflow tracker mapping equipment fault requests and technician repairs.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-all"
        >
          <Plus className="h-4 w-4" /> Request Maintenance
        </button>
      </div>

      {/* Kanban Board Container with horizontal scroll */}
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin select-none min-h-[500px]">
        {kanbanColumns.map(col => {
          const colTickets = tickets.filter(t => t.status === col.key);

          return (
            <div key={col.title} className="w-72 shrink-0 flex flex-col bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs">
              
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                  <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">{col.title}</span>
                </div>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {colTickets.length}
                </span>
              </div>

              {/* Column Cards content */}
              <div className="flex-1 space-y-3.5 overflow-y-auto">
                {colTickets.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">
                    No tickets in state
                  </div>
                ) : (
                  colTickets.map(t => (
                    <div 
                      key={t.id} 
                      className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                          {t.assetTag}
                        </span>
                        {t.priority === 'High' && (
                          <span className="text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded uppercase">
                            High
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-[#0F172A] text-xs line-clamp-1">{t.assetName}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {t.issueDescription}
                      </p>

                      {/* Display custom technicians and resolutions */}
                      {t.technician && (
                        <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>Tech: {t.technician}</span>
                        </div>
                      )}

                      {t.resolutionDate && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                          <CheckCircle className="h-3 w-3" />
                          <span>Resolved: {t.resolutionDate}</span>
                        </div>
                      )}

                      {t.notes && !t.resolutionDate && (
                        <p className="text-[9px] text-slate-450 italic mt-2">*{t.notes}</p>
                      )}

                      {/* Action trigger links inside card */}
                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-end gap-1.5">
                        {t.status === 'Pending Approval' && isAssetManager && (
                          <button 
                            onClick={() => handleApprove(t.id)}
                            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-[10px] font-bold px-2 py-1 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {t.status === 'Approved' && isAssetManager && (
                          <button 
                            onClick={() => handleAssignTechnician(t.id)}
                            className="rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 transition-colors cursor-pointer"
                          >
                            Assign Tech
                          </button>
                        )}
                        {t.status === 'Technician Assigned' && isAssetManager && (
                          <button 
                            onClick={() => handleStartWork(t.id)}
                            className="rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 transition-colors cursor-pointer"
                          >
                            Start Work
                          </button>
                        )}
                        {t.status === 'In Progress' && isAssetManager && (
                          <button 
                            onClick={() => handleResolve(t.id)}
                            className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 transition-colors cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Kanban Info Footer */}
      <div className="flex gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-800 leading-relaxed shadow-xs">
        <Info className="h-4.5 w-4.5 shrink-0 text-blue-600" />
        <span className="font-semibold">
          Approving a request moves the asset into maintenance status. Resolving returns it to available inventory.
        </span>
      </div>

      {/* File request modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Submit Maintenance Request">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Asset</label>
            <select
              value={newRequest.assetId}
              onChange={(e) => setNewRequest(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm cursor-pointer"
            >
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issue/Fault Summary</label>
            <textarea
              required
              value={newRequest.issueDescription}
              onChange={(e) => setNewRequest(prev => ({ ...prev, issueDescription: e.target.value }))}
              placeholder="Describe the mechanical problem..."
              className="w-full rounded-lg border border-slate-300 p-2 text-sm h-20"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Create Ticket
          </button>
        </form>
      </Modal>

    </div>
  );
};
