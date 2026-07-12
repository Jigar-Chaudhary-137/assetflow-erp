import React, { useState } from 'react';
import { 
  FileCheck2, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckSquare, 
  XSquare, 
  AlertCircle
} from 'lucide-react';

export const Audit = () => {
  const [cycleClosed, setCycleClosed] = useState(false);
  const [auditItems, setAuditItems] = useState([
    { id: '1', asset: 'AF-003 Dell Laptop', expectedLocation: 'Desk E12', status: 'Verified' },
    { id: '2', asset: 'AF-021 Office Chair', expectedLocation: 'Desk E14', status: 'Missing' },
    { id: '3', asset: 'AF-038 Monitor', expectedLocation: 'Desk E15', status: 'Damaged' }
  ]);

  const handleCloseCycle = () => {
    if (window.confirm('Close this audit cycle and submit reports?')) {
      setCycleClosed(true);
      alert("Audit cycle closed successfully.");
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Verified') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
          Verified
        </span>
      );
    }
    if (status === 'Missing') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Missing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-750 border border-amber-250">
        Damaged
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
          <FileCheck2 className="h-6 w-6 text-[#2563EB]" /> Asset Audit
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Verify expected locations of physical assets and log status discrepancies.
        </p>
      </div>

      {/* Top Audit Cycle Card */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Cycle</div>
          <h3 className="text-base font-extrabold text-[#0F172A]">Q3 Audit: Engineering Department</h3>
          
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Audit Dates: 1–15 July
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" /> Auditors: A Rao, S Iqbal
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
          cycleClosed ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-[#2563EB] border border-blue-105'
        }`}>
          {cycleClosed ? 'Closed' : 'Active'}
        </span>
      </div>

      {/* Asset Verification Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Asset</th>
                <th className="p-4">Expected Location</th>
                <th className="p-4">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm font-medium">
              {auditItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 text-[#0F172A]">
                  <td className="p-4 font-bold">{item.asset}</td>
                  <td className="p-4 text-slate-500 font-semibold">{item.expectedLocation}</td>
                  <td className="p-4">{getStatusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Discrepancy Alert Card */}
      {!cycleClosed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 animate-pulse" />
          <div className="flex-1 font-semibold">
            2 assets flagged - discrepancy report generated automatically
          </div>
        </div>
      )}

      {/* Action Button */}
      {!cycleClosed && (
        <div className="flex justify-end">
          <button
            onClick={handleCloseCycle}
            className="inline-flex justify-center items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-5 py-3 text-xs font-bold text-white shadow-md cursor-pointer transition-all"
          >
            Close Audit Cycle
          </button>
        </div>
      )}

    </div>
  );
};
