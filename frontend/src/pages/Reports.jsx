import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { 
  BarChart3, 
  Download, 
  Package, 
  RefreshCcw, 
  DollarSign, 
  Calendar, 
  Filter, 
  Printer, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Award, 
  FileSpreadsheet, 
  FileText, 
  ChevronDown,
  Building2,
  Tags,
  Info,
  Activity,
  CalendarCheck2
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const Reports = () => {
  // Base API data for exports
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Filters State (Teammate's date inputs + our dateRange filter)
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load API data on mount
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        setLoading(true);
        const data = await reportService.getReportData();
        setReportData(data);
      } catch (err) {
        console.error('Failed to fetch report summary data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, []);

  // Teammate's reload simulation
  const handleReload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  // Teammate's print handler
  const handlePrint = () => {
    window.print();
  };

  // Filter change handler with simulated skeleton loading
  const handleFilterChange = (setter, value) => {
    setLoading(true);
    setter(value);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  // Section 1 - Department Utilization Data
  const baseDepartments = [
    { name: 'Engineering', value: 92, color: '#2563EB', hoverColor: '#1D4ED8' },
    { name: 'IT', value: 85, color: '#8B5CF6', hoverColor: '#7C3AED' },
    { name: 'Procurement', value: 81, color: '#10B981', hoverColor: '#059669' },
    { name: 'HR', value: 64, color: '#F59E0B', hoverColor: '#D97706' },
    { name: 'Operations', value: 58, color: '#EC4899', hoverColor: '#DB2777' },
  ];

  // Section 2 - Maintenance Requests monthly trend
  const baseMaintenanceTrends = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 18 },
    { month: 'Mar', count: 15 },
    { month: 'Apr', count: 24 },
    { month: 'May', count: 20 },
    { month: 'Jun', count: 31 },
    { month: 'Jul', count: 35 },
  ];

  // Section 3 - Most Used Assets
  const mostUsedAssets = [
    { rank: '#1', name: 'Room B2', metric: '34 bookings this month', category: 'Facilities', dept: 'HR', count: 34, usageType: 'bookings', type: 'Conference Room' },
    { rank: '#2', name: 'Van AF-343', metric: '21 trips this month', category: 'Vehicles', dept: 'Operations', count: 21, usageType: 'trips', type: 'Fleet Vehicle' },
    { rank: '#3', name: 'Projector AF-335', metric: '18 uses', category: 'IT Equipment', dept: 'IT', count: 18, usageType: 'uses', type: 'Hardware' },
    { rank: '#4', name: 'Workstation AF-701', metric: '15 uses', category: 'IT Equipment', dept: 'Engineering', count: 15, usageType: 'uses', type: 'Hardware' },
    { rank: '#5', name: 'Conference Room C', metric: '12 bookings', category: 'Facilities', dept: 'Procurement', count: 12, usageType: 'bookings', type: 'Conference Room' }
  ];

  // Section 4 - Idle Assets
  const idleAssets = [
    { name: 'Camera AF-0301', status: 'Unused for 60 days', category: 'IT Equipment', dept: 'Engineering', daysIdle: 60, severity: 'critical', detail: 'DSLR Testing Kit', warning: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Chair AF-0410', status: 'Unused for 45 days', category: 'Furniture', dept: 'HR', daysIdle: 45, severity: 'warning', detail: 'Storage Furniture', warning: 'bg-amber-50 text-amber-700 border-amber-205' },
    { name: 'Laptop AF-0192', status: 'Unused for 32 days', category: 'IT Equipment', dept: 'IT', daysIdle: 32, severity: 'info', detail: 'Staff Laptop Desk', warning: 'bg-slate-100 text-slate-600 border-slate-300' },
    { name: 'Printer AF-0054', status: 'Unused for 25 days', category: 'IT Equipment', dept: 'Procurement', daysIdle: 25, severity: 'info', detail: 'Office Printer', warning: 'bg-slate-100 text-slate-600 border-slate-300' },
    { name: 'Forklift AF-0222', status: 'Unused for 50 days', category: 'Vehicles', dept: 'Operations', daysIdle: 50, severity: 'warning', detail: 'Warehouse Forklift', warning: 'bg-amber-50 text-amber-700 border-amber-205' }
  ];

  // Section 5 - Maintenance Alerts
  const maintenanceAlerts = [
    { name: 'Forklift AF-0087', alert: 'Service due in 5 days', category: 'Vehicles', dept: 'Operations', urgency: 'High', days: 5, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', urgent: true },
    { name: 'Laptop AF-0020', alert: '4 years old and nearing retirement', category: 'IT Equipment', dept: 'IT', urgency: 'Medium', days: null, badgeColor: 'bg-amber-50 text-amber-750 border-amber-200', urgent: false },
    { name: 'Projector AF-0412', alert: 'Warranty expires in 30 days', category: 'IT Equipment', dept: 'Procurement', urgency: 'Low', days: 30, badgeColor: 'bg-slate-100 text-slate-650 border-slate-250', urgent: false },
    { name: 'Server Rack AF-901', alert: 'Cooling service overdue by 2 days', category: 'IT Equipment', dept: 'Engineering', urgency: 'High', days: -2, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', urgent: true },
    { name: 'Office Desk D-10', alert: 'Drawer repair pending', category: 'Furniture', dept: 'HR', urgency: 'Low', days: null, badgeColor: 'bg-slate-100 text-slate-655 border-slate-250', urgent: false }
  ];

  // Teammate category name mappings
  const categoryMapping = {
    'Hardware': 'IT Equipment',
    'Facility': 'Facilities'
  };

  // Filters calculations
  const filteredMostUsed = mostUsedAssets.filter(item => {
    const matchesDept = selectedDept === 'All' || item.dept === selectedDept;
    const mappedCat = categoryMapping[selectedCategory] || selectedCategory;
    const matchesCat = selectedCategory === 'All' || item.category === mappedCat || item.category === selectedCategory;
    return matchesDept && matchesCat;
  });

  const filteredIdle = idleAssets.filter(item => {
    const matchesDept = selectedDept === 'All' || item.dept === selectedDept;
    const mappedCat = categoryMapping[selectedCategory] || selectedCategory;
    const matchesCat = selectedCategory === 'All' || item.category === mappedCat || item.category === selectedCategory;
    return matchesDept && matchesCat;
  });

  const filteredAlerts = maintenanceAlerts.filter(item => {
    const matchesDept = selectedDept === 'All' || item.dept === selectedDept;
    const mappedCat = categoryMapping[selectedCategory] || selectedCategory;
    const matchesCat = selectedCategory === 'All' || item.category === mappedCat || item.category === selectedCategory;
    return matchesDept && matchesCat;
  });

  // Calculate dynamic maintenance counts depending on filter selection
  const getLineValues = () => {
    let multiplier = 1.0;
    
    // Date range modifiers
    if (dateRange === 'Last 90 Days') multiplier *= 2.5;
    else if (dateRange === 'This Year') multiplier *= 8.0;

    // Department/Category filters
    if (selectedDept !== 'All') {
      const deptModifiers = { 'Engineering': 0.35, 'IT': 0.45, 'Procurement': 0.15, 'HR': 0.05, 'Operations': 0.5 };
      multiplier *= deptModifiers[selectedDept] || 1.0;
    }
    if (selectedCategory !== 'All') {
      const mappedCat = categoryMapping[selectedCategory] || selectedCategory;
      const catModifiers = { 'IT Equipment': 0.55, 'Furniture': 0.1, 'Vehicles': 0.25, 'Facilities': 0.2 };
      multiplier *= catModifiers[mappedCat] || 1.0;
    }

    return baseMaintenanceTrends.map(item => ({
      ...item,
      count: Math.max(1, Math.round(item.count * multiplier))
    }));
  };

  const currentTrendData = getLineValues();
  const maxTrendValue = Math.max(...currentTrendData.map(d => d.count), 1);

  // CSV/Excel data export handlers
  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format) => {
    setExportDropdownOpen(false);

    if (format === 'PDF') {
      window.print();
      return;
    }

    let csvContent = '';
    let fileName = `AssetFlow_Report_${dateRange.replace(' ', '_')}`;
    
    if (format === 'CSV') {
      fileName += '.csv';
      csvContent += 'REPORT: ASSET UTILIZATION & HEALTH METRICS\n';
      csvContent += `Generated: ${new Date().toLocaleDateString()} | Date Range: ${dateRange}\n`;
      csvContent += `Filters: Dept: ${selectedDept} | Category: ${selectedCategory}\n\n`;

      csvContent += '--- DEPARTMENT UTILIZATION ---\n';
      csvContent += 'Department,Utilization Rate (%)\n';
      baseDepartments.forEach(d => {
        csvContent += `"${d.name}","${d.value}%"\n`;
      });

      csvContent += '\n--- MAINTENANCE FREQUENCY TREND ---\n';
      csvContent += 'Month,Service Requests\n';
      currentTrendData.forEach(d => {
        csvContent += `"${d.month}",${d.count}\n`;
      });

      csvContent += '\n--- MOST USED ASSETS ---\n';
      csvContent += 'Rank,Asset,Record,Category,Department\n';
      filteredMostUsed.forEach(item => {
        csvContent += `"${item.rank}","${item.name}","${item.metric}","${item.category}","${item.dept}"\n`;
      });

      csvContent += '\n--- IDLE ASSETS WARNINGS ---\n';
      csvContent += 'Asset,Status,Category,Department\n';
      filteredIdle.forEach(item => {
        csvContent += `"${item.name}","${item.status}","${item.category}","${item.dept}"\n`;
      });

      csvContent += '\n--- URGENT SERVICE ALERTS ---\n';
      csvContent += 'Asset,Alert Details,Urgency,Category,Department\n';
      filteredAlerts.forEach(item => {
        csvContent += `"${item.name}","${item.alert}","${item.urgency}","${item.category}","${item.dept}"\n`;
      });

      downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
    } 
    
    else if (format === 'Excel') {
      fileName += '.xls';
      // Simple Excel compatible HTML Table format
      let excelContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
      excelContent += '<head><meta charset="utf-8" /></head><body>';
      excelContent += '<h2>AssetFlow Enterprise Analytics & Reports</h2>';
      excelContent += `<p><b>Date Range:</b> ${dateRange} | <b>Filters:</b> Dept: ${selectedDept}, Category: ${selectedCategory}</p>`;
      
      excelContent += '<h3>Department Utilization</h3><table border="1"><tr><th>Department</th><th>Utilization Percentage</th></tr>';
      baseDepartments.forEach(d => { excelContent += `<tr><td>${d.name}</td><td>${d.value}%</td></tr>`; });
      excelContent += '</table>';

      excelContent += '<h3>Maintenance Frequency</h3><table border="1"><tr><th>Month</th><th>Requests</th></tr>';
      currentTrendData.forEach(d => { excelContent += `<tr><td>${d.month}</td><td>${d.count}</td></tr>`; });
      excelContent += '</table>';

      excelContent += '<h3>Most Used Assets</h3><table border="1"><tr><th>Rank</th><th>Asset Name</th><th>Record</th><th>Category</th><th>Department</th></tr>';
      filteredMostUsed.forEach(item => { excelContent += `<tr><td>${item.rank}</td><td>${item.name}</td><td>${item.metric}</td><td>${item.category}</td><td>${item.dept}</td></tr>`; });
      excelContent += '</table>';

      excelContent += '<h3>Idle Assets Warning</h3><table border="1"><tr><th>Asset Name</th><th>Status</th><th>Category</th><th>Department</th></tr>';
      filteredIdle.forEach(item => { excelContent += `<tr><td>${item.name}</td><td>${item.status}</td><td>${item.category}</td><td>${item.dept}</td></tr>`; });
      excelContent += '</table>';

      excelContent += '<h3>Urgent Alerts</h3><table border="1"><tr><th>Asset Name</th><th>Alert Details</th><th>Urgency</th><th>Category</th><th>Department</th></tr>';
      filteredAlerts.forEach(item => { excelContent += `<tr><td>${item.name}</td><td>${item.alert}</td><td>${item.urgency}</td><td>${item.category}</td><td>${item.dept}</td></tr>`; });
      excelContent += '</table>';

      excelContent += '</body></html>';

      downloadFile(excelContent, fileName, 'application/vnd.ms-excel');
    }
  };

  return (
    <div className="space-y-6 print-full-width">
      
      {/* Self-contained styling for transitions and printing */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          to {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }
        .animate-bar {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes drawLine {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .6;
          }
        }
        @media print {
          header, aside, .no-print, .filters-container {
            display: none !important;
          }
          main {
            padding: 0 !important;
            background: white !important;
          }
          .print-full-width {
            width: 100% !important;
          }
          .print-card-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          }
        }
      `}</style>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Reports & Analytics Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">Export audits, review asset utilization trends, and monitor lifecycle alerts.</p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Reload Simulator (Teammate's button preserved) */}
          <button 
            onClick={handleReload}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm cursor-pointer"
          >
            Simulate Load
          </button>

          {/* Date Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => handleFilterChange(setDateRange, e.target.value)}
              className="appearance-none inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Year">This Year</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Print Button (Preserved) */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer"
            title="Print Report"
          >
            <Printer className="h-4 w-4" /> Print
          </button>

          {/* Export Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer transition-all duration-200"
            >
              <Download className="h-4 w-4" /> Export Report <ChevronDown className="h-3 w-3" />
            </button>

            {exportDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setExportDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-brand-border bg-brand-card py-1.5 shadow-xl ring-1 ring-black/5 z-20">
                  <button
                    onClick={() => handleExport('CSV')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-blue-500" /> Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('Excel')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('PDF')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-red-500" /> Save as PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters Toolbar (Teammate's Date range pickers + dropdowns merged) */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 bg-brand-card border border-brand-border p-4 rounded-xl shadow-xs print:hidden text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => handleFilterChange(setStartDate, e.target.value)} 
            className="w-full rounded-lg border border-slate-200 p-2 focus:outline-none focus:border-primary cursor-pointer text-slate-700 font-semibold" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => handleFilterChange(setEndDate, e.target.value)} 
            className="w-full rounded-lg border border-slate-200 p-2 focus:outline-none focus:border-primary cursor-pointer text-slate-700 font-semibold" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
          <select 
            value={selectedDept} 
            onChange={(e) => handleFilterChange(setSelectedDept, e.target.value)} 
            className="w-full rounded-lg border border-slate-200 p-2 focus:outline-none focus:border-primary cursor-pointer text-slate-700 font-semibold bg-white"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Procurement">Procurement</option>
            <option value="Operations">Operations</option>
            <option value="IT">IT</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)} 
            className="w-full rounded-lg border border-slate-200 p-2 focus:outline-none focus:border-primary cursor-pointer text-slate-700 font-semibold bg-white"
          >
            <option value="All">All Categories</option>
            <option value="IT Equipment">IT Equipment</option>
            <option value="Hardware">Hardware (IT)</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Facilities">Facilities</option>
            <option value="Facility">Facility (Facilities)</option>
          </select>
        </div>
      </div>

      {/* Quick Reset Filter Indicator */}
      {(selectedDept !== 'All' || selectedCategory !== 'All' || dateRange !== 'Last 30 Days' || startDate !== '2026-07-01' || endDate !== '2026-07-31') && (
        <div className="flex justify-end no-print">
          <button
            onClick={() => {
              setLoading(true);
              setSelectedDept('All');
              setSelectedCategory('All');
              setDateRange('Last 30 Days');
              setStartDate('2026-07-01');
              setEndDate('2026-07-31');
              setTimeout(() => setLoading(false), 500);
            }}
            className="text-xs font-semibold text-primary hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCcw className="h-3 w-3" /> Reset All Filters
          </button>
        </div>
      )}

      {/* SKELETON LOADERS OR MAIN GRID CHARTS */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Skeleton Chart 1 */}
          <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm space-y-4 animate-pulse">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-10"></div>
            </div>
            <div className="h-64 bg-slate-100 rounded-lg flex items-end justify-between p-4 gap-2">
              <div className="h-5/6 bg-slate-200 rounded w-1/5"></div>
              <div className="h-3/6 bg-slate-200 rounded w-1/5"></div>
              <div className="h-4/6 bg-slate-200 rounded w-1/5"></div>
              <div className="h-2/6 bg-slate-200 rounded w-1/5"></div>
              <div className="h-5/6 bg-slate-200 rounded w-1/5"></div>
            </div>
          </div>

          {/* Skeleton Chart 2 */}
          <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm space-y-4 animate-pulse">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-10"></div>
            </div>
            <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="w-11/12 h-2/3 border-b-2 border-l-2 border-slate-200 relative flex items-end">
                <div className="absolute inset-0 border-t border-dashed border-slate-250 opacity-50"></div>
              </div>
            </div>
          </div>

          {/* Three list skeletons */}
          <div className="md:col-span-2 grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <>
          {/* CHARTS GRID */}
          <div className="grid gap-6 md:grid-cols-2 print-card-grid">
            
            {/* SECTION 1 - DEPARTMENT UTILIZATION */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">Department Asset Utilization</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Active asset usage percentages per organization division.</p>
                  </div>
                  <span className="rounded-lg bg-blue-50 p-1.5 text-primary">
                    <Building2 className="h-4 w-4" />
                  </span>
                </div>

                {/* Vertical Bar Chart Container */}
                <div className="h-64 mt-6 flex items-end justify-between px-2 pt-6 relative border-b border-slate-100">
                  {baseDepartments.map((dept, index) => {
                    const isFilteredOut = selectedDept !== 'All' && selectedDept !== dept.name;
                    return (
                      <div 
                        key={dept.name} 
                        className="flex flex-col items-center flex-1 h-full justify-end relative group"
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 transition-all duration-200 animate-fade-in">
                          <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                            {dept.name}: {dept.value}% Utilized
                          </div>
                          <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.75"></div>
                        </div>

                        {/* Chart Bar */}
                        <div 
                          className="w-8 sm:w-10 rounded-t-md transition-all duration-350 relative overflow-hidden animate-bar cursor-pointer"
                          style={{ 
                            height: `${dept.value}%`, 
                            backgroundColor: dept.color,
                            opacity: isFilteredOut ? 0.25 : 1,
                            boxShadow: !isFilteredOut ? `0 4px 12px ${dept.color}25` : 'none'
                          }}
                        >
                          {/* Inner glowing stripe */}
                          <div className="absolute inset-x-0 top-0 h-1 bg-white/20"></div>
                        </div>

                        {/* Bar Label */}
                        <span className={`text-[10px] font-semibold mt-2 truncate max-w-[65px] ${
                          isFilteredOut ? 'text-slate-355' : 'text-slate-650'
                        }`}>
                          {dept.name}
                        </span>
                        
                        {/* Rate Badge */}
                        <span className={`text-[9px] font-bold mt-0.5 ${
                          isFilteredOut ? 'text-slate-300' : 'text-primary'
                        }`}>
                          {dept.value}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 2 - MAINTENANCE FREQUENCY LINE CHART */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">Maintenance Request Frequency</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Monthly completed and pending support request trend.</p>
                  </div>
                  <span className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                </div>

                {/* SVG Line Chart */}
                <div className="h-64 mt-6 w-full relative">
                  <svg 
                    viewBox="0 0 500 240" 
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {/* Chart Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                      const gridY = 30 + ratio * 160;
                      const gridValue = Math.round(maxTrendValue * (1 - ratio));
                      return (
                        <g key={index}>
                          <line 
                            x1="45" 
                            y1={gridY} 
                            x2="475" 
                            y2={gridY} 
                            className="stroke-slate-100 stroke-1 stroke-dasharray-[4,4] no-print" 
                            strokeDasharray="4 4"
                          />
                          <text 
                            x="35" 
                            y={gridY + 3} 
                            className="fill-slate-400 text-[9px] font-semibold text-right" 
                            textAnchor="end"
                          >
                            {gridValue}
                          </text>
                        </g>
                      );
                    })}

                    {/* SVG Line Path & Gradient Area */}
                    {(() => {
                      // Generate coordinate points
                      const pts = currentTrendData.map((d, index) => {
                        const x = 55 + index * 69;
                        const y = 190 - (d.count / maxTrendValue) * 150;
                        return { x, y, month: d.month, count: d.count };
                      });

                      const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaPath = `${linePath} L ${pts[pts.length - 1].x} 190 L ${pts[0].x} 190 Z`;

                      return (
                        <>
                          {/* Gradient Fill under line */}
                          <path 
                            d={areaPath} 
                            fill="url(#chartGrad)" 
                            className="transition-all duration-500" 
                          />
                          
                          {/* Line */}
                          <path 
                            d={linePath} 
                            fill="none" 
                            stroke="#2563EB" 
                            strokeWidth="2.5" 
                            strokeLinecap="round"
                            className="animate-line transition-all duration-500" 
                          />

                          {/* Data points (circles with hover tooltips) */}
                          {pts.map((p, index) => (
                            <g key={index} className="group cursor-pointer">
                              {/* Custom Interactive Tooltip HTML */}
                              <foreignObject
                                x={p.x - 45}
                                y={p.y - 38}
                                width="90"
                                height="32"
                                className="opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-10"
                              >
                                <div className="flex flex-col items-center">
                                  <div className="bg-slate-900 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                                    {p.count} Tickets
                                  </div>
                                  <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.75"></div>
                                </div>
                              </foreignObject>

                              {/* Hover Glow */}
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="8" 
                                className="fill-transparent stroke-primary/20 stroke-2 opacity-0 group-hover:opacity-100 transition-all duration-150" 
                              />
                              
                              {/* Core Dot */}
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="4" 
                                className="fill-white stroke-primary stroke-[2.5] transition-all duration-200 group-hover:r-5 group-hover:stroke-blue-700" 
                              />

                              {/* Month Text Label */}
                              <text 
                                x={p.x} 
                                y="210" 
                                className="fill-slate-500 text-[10px] font-bold text-center" 
                                textAnchor="middle"
                              >
                                {p.month}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* LISTS ROW */}
          <div className="grid gap-6 sm:grid-cols-3 print-card-grid">
            
            {/* SECTION 3 - MOST USED ASSETS */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-1.5 mb-4">
                  <Award className="h-4.5 w-4.5 text-amber-500" /> Most Used Assets
                </h3>
                
                {filteredMostUsed.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No matching high-usage assets.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredMostUsed.map((item, index) => {
                      const medalColors = {
                        '#1': 'bg-amber-100 text-amber-800 border-amber-200',
                        '#2': 'bg-slate-100 text-slate-700 border-slate-200',
                        '#3': 'bg-orange-100 text-orange-850 border-orange-200'
                      };
                      return (
                        <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`h-6 w-6 shrink-0 flex items-center justify-center rounded-full text-xs font-bold border ${
                              medalColors[item.rank] || 'bg-slate-55 text-slate-450 border-slate-150'
                            }`}>
                              {item.rank}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <span className="font-semibold text-slate-650">{item.dept}</span> | {item.type}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold text-primary shrink-0 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            {item.metric}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4 - IDLE ASSETS */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-1.5 mb-4">
                  <Clock className="h-4.5 w-4.5 text-rose-500 animate-pulse-slow" /> Idle Assets
                </h3>

                {filteredIdle.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No idle asset warnings found.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredIdle.map((item) => {
                      return (
                        <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              <span className="font-semibold text-slate-650">{item.dept}</span> | {item.detail}
                            </p>
                          </div>
                          
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${item.warning}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current mr-1 animate-pulse-slow"></span>
                            {item.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 5 - RETIREMENT OR SERVICE ALERTS */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-1.5 mb-4">
                  <AlertTriangle className="h-4.5 w-4.5 text-brand-warning animate-pulse-slow" /> Lifecycle & Service Alerts
                </h3>

                {filteredAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No pending service alerts.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredAlerts.map((item) => {
                      return (
                        <div key={item.name} className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all duration-200 relative ${
                          item.urgent 
                            ? 'bg-rose-50/40 border-rose-100 hover:bg-rose-50' 
                            : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                        }`}>
                          {item.urgent && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                          )}
                          
                          <div className={`mt-0.5 shrink-0 h-4.5 w-4.5 rounded-full flex items-center justify-center ${
                            item.urgent ? 'bg-rose-500 text-white animate-pulse-slow' : 'bg-slate-200 text-slate-500'
                          }`}>
                            <span className="text-[9px] font-extrabold">!</span>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                                {item.urgency}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-550 mt-1 font-semibold leading-relaxed">{item.alert}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
