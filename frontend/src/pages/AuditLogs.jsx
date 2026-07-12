import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckSquare, 
  XSquare, 
  AlertCircle,
  Award,
  ArrowRight
} from 'lucide-react';

export const AuditLogs = () => {
  const [search, setSearch] = useState('');
  const [cycleClosed, setCycleClosed] = useState(false);

  // Wireframe sample audit records
  const [auditItems, setAuditItems] = useState([
    { id: '1', asset: 'AF-003 Dell Laptop', expectedLocation: 'Desk E12', status: 'Verified' },
    { id: '2', asset: 'AF-021 Office Chair', expectedLocation: 'Desk E14', status: 'Missing' },
    { id: '3', asset: 'AF-038 Monitor', expectedLocation: 'Desk E15', status: 'Damaged' }
  ]);

  const handleCloseCycle = () => {
    if (window.confirm('Are you sure you want to close this audit cycle? A discrepancy report will be submitted to the administration.')) {
      setCycleClosed(true);
      alert("Audit cycle closed successfully. Discrepancy report emailed to A. Rao & S. Iqbal.");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setAuditItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  const filteredItems = auditItems.filter(item => 
    item.asset.toLowerCase().includes(search.toLowerCase()) ||
    item.expectedLocation.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'Verified') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckSquare className="h-3 w-3 mr-1" /> Verified
        </span>
      );
    }
    if (status === 'Missing') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          <XSquare className="h-3 w-3 mr-1" /> Missing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-250">
        <AlertCircle className="h-3 w-3 mr-1" /> Damaged
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION: Title & Current Audit Cycle Card */}
      <div className="grid gap-6 md:grid-cols-3 items-start">
        
        {/* Title */}
        <div className="md:col-span-1 py-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-[#2563EB]" /> Asset Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Verify expected locations of physical assets and log status discrepancies.
          </p>
        </div>

        {/* Current Audit Cycle Card */}
        <div className="md:col-span-2 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Audit Cycle</div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Q3 Audit: Engineering Department</h3>
            
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Audit Dates: 1–15 July
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" /> Auditors: A. Rao, S. Iqbal
              </span>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
            cycleClosed ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-[#2563EB] border border-blue-100'
          }`}>
            {cycleClosed ? 'Closed' : 'Active Cycle'}
          </span>
        </div>

      </div>

      {/* SUMMARY ALERT CARD: Yellow warning card */}
      {!cycleClosed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1 font-semibold">
            2 assets flagged - discrepancy report generated automatically
          </div>
        </div>
      )}

      {/* AUDIT TABLE Controls & List */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-xs overflow-hidden">
        
        {/* Search filter above table */}
        <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit assets or desk locations..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2 pl-9 pr-4 text-xs focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Action Close Audit Cycle Button */}
          {!cycleClosed && (
            <button
              onClick={handleCloseCycle}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer transition-all"
            >
              Close Audit Cycle
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Asset</th>
                <th className="p-4">Expected Location</th>
                <th className="p-4">Verification Status</th>
                {!cycleClosed && <th className="p-4 text-right">Update Status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm font-medium">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 text-[#0F172A]">
                  <td className="p-4 font-bold">{item.asset}</td>
                  <td className="p-4 text-slate-500 font-semibold">{item.expectedLocation}</td>
                  <td className="p-4">{getStatusBadge(item.status)}</td>
                  {!cycleClosed && (
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button 
                          onClick={() => handleStatusChange(item.id, 'Verified')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Verify
                        </button>
                        <button 
                          onClick={() => handleStatusChange(item.id, 'Missing')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            item.status === 'Missing' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Miss
                        </button>
                        <button 
                          onClick={() => handleStatusChange(item.id, 'Damaged')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            item.status === 'Damaged' ? 'bg-amber-105 text-amber-805' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Damage
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
