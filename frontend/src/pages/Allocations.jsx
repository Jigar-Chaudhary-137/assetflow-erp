import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { allocationService } from '../services/allocationService';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ALLOCATION_STATUS } from '../constants';
import { 
  Repeat, 
  Clock, 
  ArrowRight,
  AlertTriangle,
  History,
  User,
  ArrowRightLeft
} from 'lucide-react';

export const Allocations = () => {
  const { user, isAssetManager, isDeptHead } = useAuth();
  const { fetchNotifications } = useNotifications();

  // Primary data states
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selector state
  const [selectedAssetId, setSelectedAssetId] = useState('');
  
  // Form states
  const [transferForm, setTransferForm] = useState({
    fromEmployeeId: '',
    toEmployeeId: '',
    reason: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetList, empList, allocList] = await Promise.all([
        assetService.getAll(),
        employeeService.getAll(),
        allocationService.getAll()
      ]);
      setAssets(assetList);
      setEmployees(empList);
      setAllocations(allocList);

      if (assetList.length > 0) {
        setSelectedAssetId(assetList[0].id);
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

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const currentAllocation = selectedAsset && allocations.find(
    a => a.assetId === selectedAsset.id && a.status === ALLOCATION_STATUS.ACTIVE
  );

  // Auto-populate "From Employee" when selected asset allocation changes
  useEffect(() => {
    if (currentAllocation) {
      setTransferForm(prev => ({
        ...prev,
        fromEmployeeId: currentAllocation.employeeId,
        toEmployeeId: employees.find(e => e.id !== currentAllocation.employeeId)?.id || ''
      }));
    } else {
      setTransferForm(prev => ({
        ...prev,
        fromEmployeeId: '',
        toEmployeeId: employees[0]?.id || ''
      }));
    }
  }, [selectedAssetId, currentAllocation, employees]);

  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    if (!currentAllocation) {
      alert("This asset is not currently allocated. You can allocate it directly from the Assets Registry.");
      return;
    }
    if (!transferForm.toEmployeeId) {
      alert("Please select a target employee.");
      return;
    }
    
    try {
      await allocationService.initiateTransfer(
        currentAllocation.id,
        transferForm.toEmployeeId,
        transferForm.reason
      );
      alert("Transfer request submitted successfully. Waiting for manager approval.");
      setTransferForm(prev => ({ ...prev, reason: '' }));
      loadData();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedAssetHistory = selectedAsset 
    ? allocations.filter(a => a.assetId === selectedAsset.id)
    : [];

  return (
    <div className="space-y-6">
      
      {/* 1. Asset Selector Card */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Repeat className="h-4.5 w-4.5 text-[#2563EB]" /> Asset Selector
        </h3>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Asset to Review</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 px-4 text-sm focus:border-[#2563EB] focus:outline-none cursor-pointer"
          >
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.assetTag} - {asset.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Allocation Status Banner (Conditional warning) */}
      {selectedAsset && selectedAsset.status === 'Allocated' ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-xs flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900 mb-0.5">Asset Already Allocated</h4>
            <p className="leading-relaxed">
              Already allocated to current employee. Direct re-allocation is blocked. Submit transfer request below.
            </p>
          </div>
        </div>
      ) : selectedAsset ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 shadow-xs flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-900 mb-0.5">Asset Available</h4>
            <p className="leading-relaxed">
              This asset is available. Direct allocation can be performed immediately in the primary Assets Registry.
            </p>
          </div>
        </div>
      ) : null}

      {/* Main Grid: Form and Timeline */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* 3. Transfer Request Form */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 flex items-center gap-2">
              <ArrowRightLeft className="h-4.5 w-4.5 text-[#2563EB]" /> Transfer Request Form
            </h3>
            
            <form onSubmit={handleSubmitTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From Employee</label>
                <select
                  disabled
                  value={transferForm.fromEmployeeId}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 py-2.5 px-3 text-sm focus:outline-none cursor-not-allowed"
                >
                  <option value="">{currentAllocation ? currentAllocation.employeeName : 'None (Available)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To Employee</label>
                <select
                  value={transferForm.toEmployeeId}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, toEmployeeId: e.target.value }))}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="">Select Target Employee</option>
                  {employees.filter(e => e.id !== currentAllocation?.employeeId).map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transfer Reason</label>
                <textarea
                  required
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="State the reason for this transfer request..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 px-3 text-sm focus:outline-none h-24"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer transition-all"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>

        {/* 4. Allocation History Section */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-slate-500" /> Allocation History
          </h3>

          {selectedAssetHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold">
              No historical allocations found for this asset.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 pl-4 space-y-5">
              {selectedAssetHistory.map(hist => (
                <div key={hist.id} className="relative">
                  <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-slate-400 ring-4 ring-white" />
                  
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0F172A] flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" /> {hist.employeeName}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hist.status === ALLOCATION_STATUS.ACTIVE 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {hist.status}
                      </span>
                    </div>
                    <p className="text-slate-500">Department: <span className="font-semibold text-slate-700">{hist.employeeName === 'Michael Scott' ? 'Operations' : 'IT'}</span></p>
                    <div className="flex gap-4 text-slate-450 mt-1 font-semibold text-[10px] uppercase tracking-wide">
                      <span>Allocated: {hist.allocatedDate}</span>
                      {hist.returnedDate && <span>Returned: {hist.returnedDate}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// Simple check icon replacement for availability
const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
