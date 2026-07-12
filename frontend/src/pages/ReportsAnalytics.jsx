import React from 'react';
import { 
  BarChart3, 
  Download, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Activity
} from 'lucide-react';

export const ReportsAnalytics = () => {

  const handleExport = () => {
    const headers = 'Asset ID,Asset Name,Department,Metric,Value\n';
    const rows = [
      'Room B2,Conference Room,Procurement,Bookings,34\n',
      'Van AF-341,Utility Van,Operations,Trips,21\n',
      'Projector AF-335,Projector,Engineering,Uses,18\n',
      'Camera AF-0301,DSLR Camera,IT,Idle Days,62\n',
      'Forklift AF-0087,Warehouse Lift,Operations,Days to Service,5\n'
    ].join('');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'assetflow-reports-analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Reports and analytics exported to CSV.");
  };

  const departmentUtilization = [
    { name: 'Engineering', value: 85, color: 'bg-[#2563EB]' },
    { name: 'HR', value: 45, color: 'bg-indigo-400' },
    { name: 'Procurement', value: 60, color: 'bg-indigo-400' },
    { name: 'Operations', value: 92, color: 'bg-[#2563EB]' },
    { name: 'IT', value: 75, color: 'bg-[#2563EB]' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2563EB]" /> Reports & Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time utilization rates, maintenance trackers, and device lifecycle analytics.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {/* TOP SECTION: Two Analytics Chart Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Section 1: Utilization by Department (Bar Chart Card) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#2563EB]" /> Utilization by Department
          </h4>
          
          <div className="flex items-end justify-between h-40 px-2 border-b border-slate-100 pb-2">
            {departmentUtilization.map(bar => (
              <div key={bar.name} className="flex flex-col items-center group w-12">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-8 pointer-events-none">
                  {bar.value}%
                </div>
                <div 
                  className={`w-8 rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-95 ${bar.color}`}
                  style={{ height: `${bar.value}%` }}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-[10px] font-bold text-slate-505 mt-2 px-1">
            {departmentUtilization.map(bar => (
              <span key={bar.name} className="w-12 text-center truncate" title={bar.name}>
                {bar.name}
              </span>
            ))}
          </div>
        </div>

        {/* Section 2: Maintenance Frequency (Line Chart Card) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-[#2563EB]" /> Maintenance Frequency
          </h4>

          <div className="h-40 relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              <line x1="0" y1="50" x2="500" y2="50" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#F1F5F9" strokeWidth="1" />

              <path 
                d="M 0 170 Q 100 80, 200 130 T 400 40 T 500 90 L 500 200 L 0 200 Z" 
                fill="url(#reportsGrad)" 
              />

              <path 
                d="M 0 170 Q 100 80, 200 130 T 400 40 T 500 90" 
                fill="none" 
                stroke="#2563EB" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              <circle cx="100" cy="115" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
              <circle cx="250" cy="112" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
              <circle cx="400" cy="40" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 border-t border-slate-100 pt-2 font-mono">
            <span>FEB</span>
            <span>MAR</span>
            <span>APR</span>
            <span>MAY</span>
            <span>JUN</span>
            <span>JUL</span>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Most Used & Idle Assets */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Section 3: Most Used Assets */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <CalendarCheck2 className="h-4.5 w-4.5 text-emerald-505" /> Most Used Assets
          </h4>
          
          <div className="space-y-3">
            {[
              { asset: 'Room B2', metric: '34 bookings this month', detail: 'Conference Room' },
              { asset: 'Van AF-341', metric: '21 trips', detail: 'Utility Fleet' },
              { asset: 'Projector AF-335', metric: '18 uses', detail: 'Conference Hardware' }
            ].map(item => (
              <div key={item.asset} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">{item.asset}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.detail}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  {item.metric}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Idle Assets */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-rose-505" /> Idle Assets
          </h4>
          
          <div className="space-y-3">
            {[
              { asset: 'Camera AF-0301', metric: 'unused for 60+ days', detail: 'DSLR Testing Camera' },
              { asset: 'Chair AF-0410', metric: 'unused for 45 days', detail: 'Office furniture storage' }
            ].map(item => (
              <div key={item.asset} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">{item.asset}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.detail}</span>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 animate-pulse">
                  {item.metric}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Section 5: Assets due for maintenance or retirement */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-505" /> Assets due for maintenance or retirement
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { asset: 'Forklift AF-0087', status: 'service due in 5 days', type: 'maintenance', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
            { asset: 'Laptop AF-0020', status: 'nearing retirement after 4 years', type: 'retirement', badgeColor: 'bg-slate-100 text-slate-600 border-slate-300' }
          ].map(item => (
            <div key={item.asset} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between items-start sm:flex-row sm:items-center gap-2">
              <div>
                <span className="font-bold text-slate-800 text-xs">{item.asset}</span>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold mt-0.5">{item.type}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.badgeColor}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const CalendarCheck2 = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
