import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { allocationService } from '../services/allocationService';
import { employeeService } from '../services/employeeService';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ALLOCATION_STATUS } from '../constants';
import { 
  Repeat, 
  CornerDownLeft, 
  ArrowLeftRight, 
  Clock, 
  Check, 
  X,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

export const Allocations = () => {
  const { user, isAssetManager, isDeptHead } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer Form State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [transferForm, setTransferForm] = useState({ targetEmployeeId: '', notes: '' });

  const loadAllocations = async () => {
    try {
      setLoading(true);
      const data = await allocationService.getAll();
      setAllocations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
      if (data.length > 0) setTransferForm(prev => ({ ...prev, targetEmployeeId: data[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAllocations();
    loadEmployees();
  }, []);

  const handleReturn = async (id) => {
    const notes = window.prompt('Add optional return condition notes:');
    if (notes !== null) {
      try {
        await allocationService.returnAsset(id, notes);
        loadAllocations();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleTransferRequest = async (e) => {
    e.preventDefault();
    try {
      await allocationService.initiateTransfer(
        selectedAllocation.id,
        transferForm.targetEmployeeId,
        transferForm.notes
      );
      setTransferModalOpen(false);
      setTransferForm({ targetEmployeeId: employees[0]?.id || '', notes: '' });
      loadAllocations();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApproveTransfer = async (id) => {
    if (window.confirm('Approve this transfer assignment?')) {
      try {
        await allocationService.approveTransfer(id);
        loadAllocations();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleRejectTransfer = async (id) => {
    if (window.confirm('Decline this transfer request?')) {
      try {
        await allocationService.rejectTransfer(id);
        loadAllocations();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Filter allocations based on Employee vs Admin scope
  const visibleAllocations = user?.role === 'Employee' 
    ? allocations.filter(a => a.employeeId === user.id) 
    : allocations;

  // Split active allocations and transfer pending approvals
  const activeAllocations = visibleAllocations.filter(a => a.status === ALLOCATION_STATUS.ACTIVE);
  const pendingTransfers = visibleAllocations.filter(a => a.status === ALLOCATION_STATUS.TRANSFER_PENDING);
  const returnedAllocations = visibleAllocations.filter(a => a.status === ALLOCATION_STATUS.RETURNED);

  return (
    <div className="space-y-6">
      
      {/* Pending Transfers Approvals (Visible to Managers/Heads/Admins) */}
      {pendingTransfers.length > 0 && (isAssetManager || isDeptHead) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
          <h3 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600 animate-pulse" /> Pending Transfer Authorizations
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingTransfers.map(t => (
              <div key={t.id} className="rounded-xl border border-amber-250 bg-white p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5">{t.assetTag}</span>
                    <Badge status={t.status} />
                  </div>
                  <h4 className="font-bold text-brand-text mt-2 text-sm">{t.assetName}</h4>
                  <p className="text-xs text-slate-500 mt-1">From: <span className="font-bold text-slate-700">{t.employeeName}</span></p>
                  <p className="text-xs text-slate-500">To: <span className="font-bold text-primary">{employees.find(e => e.id === t.transferTo)?.name}</span></p>
                  {t.transferNotes && <p className="text-xs text-slate-400 mt-2 italic bg-slate-50 p-1.5 rounded">"{t.transferNotes}"</p>}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button 
                    onClick={() => handleApproveTransfer(t.id)}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button 
                    onClick={() => handleRejectTransfer(t.id)}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <X className="h-4 w-4" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Allocations Table */}
      <div className="rounded-xl border border-brand-border bg-brand-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border p-6">
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" /> Active Assignments
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : activeAllocations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold">No active allocations listed.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Asset</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Allocated Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-sm">
                {activeAllocations.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-bold text-brand-text">{a.assetName}</p>
                      <span className="text-[10px] font-bold text-slate-400">{a.assetTag}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{a.employeeName}</td>
                    <td className="p-4 text-slate-500 font-medium">{a.allocatedDate}</td>
                    <td className="p-4 text-slate-500 font-medium">{a.dueDate}</td>
                    <td className="p-4"><Badge status={a.status} /></td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        {/* Return Action */}
                        <button
                          onClick={() => handleReturn(a.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          <CornerDownLeft className="h-3.5 w-3.5" /> Return
                        </button>
                        {/* Request Transfer Action */}
                        <button
                          onClick={() => {
                            setSelectedAllocation(a);
                            setTransferModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-blue-50/30 cursor-pointer"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="rounded-xl border border-brand-border bg-brand-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border p-6">
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-slate-500" /> Assignment History
          </h3>
        </div>

        <div className="overflow-x-auto">
          {returnedAllocations.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-medium">No returned allocation history logged.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Asset</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Issued On</th>
                  <th className="p-4">Returned On</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-sm text-slate-600">
                {returnedAllocations.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-semibold text-slate-700">{a.assetName}</p>
                      <span className="text-[10px] font-bold text-slate-400">{a.assetTag}</span>
                    </td>
                    <td className="p-4 font-semibold">{a.employeeName}</td>
                    <td className="p-4 font-medium">{a.allocatedDate}</td>
                    <td className="p-4 font-medium">{a.returnedDate}</td>
                    <td className="p-4"><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transfer Request Modal */}
      <Modal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} title={`Initiate Transfer: ${selectedAllocation?.assetName}`}>
        <form onSubmit={handleTransferRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Recipient Employee</label>
            <select
              value={transferForm.targetEmployeeId}
              onChange={(e) => setTransferForm(prev => ({ ...prev, targetEmployeeId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
            >
              {employees.filter(e => e.id !== selectedAllocation?.employeeId).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department} - {emp.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reason for Transfer</label>
            <textarea
              required
              value={transferForm.notes}
              onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="State why this transfer is requested (e.g. employee changed departments)..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none h-20"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Request Transfer Approval
          </button>
        </form>
      </Modal>

    </div>
  );
};
