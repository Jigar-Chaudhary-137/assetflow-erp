import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  CalendarCheck2,
  Calendar,
  Filter,
  Printer,
  ChevronDown,
  Info
} from 'lucide-react';

export const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  
  // Advanced filters state
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Simulate loading skeletons
  const handleReload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  const handlePrint = () => {
    window.print();
  };

  const triggerExport = (type) => {
    alert(`Exporting reports database as ${type}...`);
    setExportOpen(false);

    if (type === 'CSV') {
      const headers = 'Asset ID,Asset Name,Category,Metric,Value\n';
      const rows = [
        'Room B2,Conference Room,Facility,Bookings,34\n',
        'Van AF-343,Utility Vehicle,Fleet,Trips,21\n',
        'Projector AF-335,Projector,Hardware,Uses,18\n'
      ].join('');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `assetflow-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Section 1 Data: Utilization by Department
  const departmentUtilization = [
    { name: 'Engineering', value: 92, color: 'bg-[#2563EB]' },
    { name: 'HR', value: 64, color: 'bg-indigo-400' },
    { name: 'Procurement', value: 81, color: 'bg-indigo-400' },
    { name: 'Operations', value: 58, color: 'bg-blue-300' },
    { name: 'IT', value: 85, color: 'bg-[#2563EB]' }
  ];

  // Section 2 Data: Maintenance requests monthly trends
  const trendPoints = [
    { month: 'Jan', val: 12, x: 20, y: 170 },
    { month: 'Feb', val: 18, x: 90, y: 140 },
    { month: 'Mar', val: 15, x: 160, y: 155 },
    { month: 'Apr', val: 24, x: 230, y: 100 },
    { month: 'May', val: 20, x: 300, y: 125 },
    { month: 'Jun', val: 31, x: 370, y: 55 },
    { month: 'Jul', val: 35, x: 450, y: 30 }
  ];

  return (
    <div className="space-y-6 font-sans print:p-0 print:space-y-4">
      
      {/* Top Header Section (Hidden in print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs print:hidden">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#2563EB]" /> Reports & Analytics Dashboard
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            System utilization, maintenance tracking frequencies, and lifecycle logs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reload Simulator */}
          <button 
            onClick={handleReload}
            className="rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
          >
            Simulate Load
          </button>

          {/* Print Button */}
          <button 
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-500" /> Print
          </button>

          {/* Export Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer transition-all"
            >
              <Download className="h-4 w-4" /> Export Report <ChevronDown className="h-3 w-3" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 text-xs font-semibold text-slate-700">
                <button onClick={() => triggerExport('CSV')} className="w-full text-left px-4 py-2 hover:bg-slate-50 cursor-pointer">Export CSV</button>
                <button onClick={() => triggerExport('PDF')} className="w-full text-left px-4 py-2 hover:bg-slate-50 cursor-pointer">Export PDF</button>
                <button onClick={() => triggerExport('Excel')} className="w-full text-left px-4 py-2 hover:bg-slate-50 cursor-pointer">Export Excel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar Header (Hidden in print) */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs print:hidden text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-slate-250 p-2 focus:outline-none focus:border-[#2563EB] cursor-pointer" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-slate-250 p-2 focus:outline-none focus:border-[#2563EB] cursor-pointer" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full rounded-lg border border-slate-250 p-2 focus:outline-none focus:border-[#2563EB] cursor-pointer">
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Operations">Operations</option>
            <option value="IT">IT</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-lg border border-slate-250 p-2 focus:outline-none focus:border-[#2563EB] cursor-pointer">
            <option value="All">All Categories</option>
            <option value="Hardware">Hardware</option>
            <option value="Facility">Facility</option>
            <option value="Vehicles">Vehicles</option>
          </select>
        </div>
      </div>

      {/* RENDER LOADING SKELETONS IF TOGGLED */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-64 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-44 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-44 w-full bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* TOP ROW: Section 1 & Section 2 charts */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* SECTION 1 — UTILIZATION BY DEPARTMENT */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#2563EB]" /> Utilization by Department
                </h4>
                
                {/* animated bars container */}
                <div className="flex items-end justify-between h-40 px-2 border-b border-slate-100 pb-2">
                  {departmentUtilization.map(bar => (
                    <div key={bar.name} className="flex flex-col items-center group w-12 relative">
                      {/* Hover Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -top-8 z-10 pointer-events-none whitespace-nowrap">
                        {bar.name}: {bar.value}%
                      </div>
                      
                      {/* Vertical Progress Bar */}
                      <div 
                        className={`w-8 rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-95 animate-grow-height ${bar.color}`}
                        style={{ height: `${bar.value}%` }}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2 px-1">
                  {departmentUtilization.map(bar => (
                    <span key={bar.name} className="w-12 text-center truncate" title={bar.name}>
                      {bar.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2 — MAINTENANCE FREQUENCY */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-[#2563EB]" /> Maintenance Frequency
                </h4>

                {/* curvy line trend SVG */}
                <div className="h-40 relative">
                  <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="frequencyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="50" x2="500" y2="50" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#F1F5F9" strokeWidth="1" />

                    {/* Gradient Shading Under Line */}
                    <path 
                      d="M 20 170 Q 90 140, 160 155 T 300 125 T 450 30 L 450 200 L 200 200 Z" 
                      fill="url(#frequencyGrad)" 
                    />

                    {/* curvy line trend path */}
                    <path 
                      d="M 20 170 Q 90 140, 160 155 T 300 125 T 450 30" 
                      fill="none" 
                      stroke="#2563EB" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                    />

                    {/* Hover Coordinates dots with tooltips */}
                    {trendPoints.map(pt => (
                      <g key={pt.month} className="group cursor-pointer">
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
                        
                        {/* Hover values tooltip */}
                        <foreignObject x={pt.x - 25} y={pt.y - 30} width="60" height="25" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-slate-800 text-white text-[8px] font-bold rounded text-center py-0.5">
                            {pt.val} tickets
                          </div>
                        </foreignObject>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 border-t border-slate-100 pt-2 font-mono">
                  {trendPoints.map(pt => (
                    <span key={pt.month}>{pt.month}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* MIDDLE ROW: Section 3 & Section 4 */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* SECTION 3 — MOST USED ASSETS */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <CalendarCheck2 className="h-4.5 w-4.5 text-[#2563EB]" /> Most Used Assets
              </h4>
              
              <div className="space-y-3">
                {[
                  { rank: '#1', rankColor: 'bg-amber-100 text-amber-800 border-amber-250', name: 'Room B2', metric: '34 bookings this month', type: 'Conference Room' },
                  { rank: '#2', rankColor: 'bg-slate-205 text-slate-805 border-slate-300', name: 'Van AF-343', metric: '21 trips this month', type: 'Fleet Vehicle' },
                  { rank: '#3', rankColor: 'bg-orange-100 text-orange-850 border-orange-200', name: 'Projector AF-335', metric: '18 uses', type: 'Hardware' }
                ].map(item => (
                  <div key={item.name} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:shadow-2xs transition-shadow">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${item.rankColor}`}>
                        {item.rank}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{item.type}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {item.metric}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4 — IDLE ASSETS (Warning styled) */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-rose-500" /> Idle Assets (Alert Warning)
              </h4>
              
              <div className="space-y-3">
                {[
                  { name: 'Camera AF-0301', age: 'Unused for 60 days', detail: 'DSLR Testing Kit', warning: 'bg-rose-50 text-rose-700 border-rose-200' },
                  { name: 'Chair AF-0410', age: 'Unused for 45 days', detail: 'Storage Furniture', warning: 'bg-amber-50 text-amber-700 border-amber-205' },
                  { name: 'Laptop AF-0192', age: 'Unused for 32 days', detail: 'Staff Laptop Desk', warning: 'bg-slate-100 text-slate-600 border-slate-300' }
                ].map(item => (
                  <div key={item.name} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:shadow-2xs transition-shadow">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.detail}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.warning}`}>
                      {item.age}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* LOWER ROW: Section 5 - Maintenance/Retirement alerts */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Maintenance & Retirement Alerts
            </h4>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { name: 'Forklift AF-0087', alert: 'Service due in 5 days', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', urgent: true },
                { name: 'Laptop AF-0020', alert: '4 years old and nearing retirement', badgeColor: 'bg-amber-50 text-amber-750 border-amber-200', urgent: false },
                { name: 'Projector AF-0412', alert: 'Warranty expires in 30 days', badgeColor: 'bg-slate-100 text-slate-600 border-slate-350', urgent: false }
              ].map(item => (
                <div key={item.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:shadow-2xs transition-all relative">
                  {item.urgent && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                  
                  <div className="text-xs space-y-1.5">
                    <span className="font-extrabold text-slate-805 block">{item.name}</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.alert}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
