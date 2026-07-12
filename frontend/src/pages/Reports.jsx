import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { BarChart3, Download, Package, RefreshCcw, DollarSign, PieChart } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, metricData] = await Promise.all([
        reportService.getReportData(),
        reportService.getDashboardMetrics()
      ]);
      setReportData(sumData);
      setMetrics(metricData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = (type) => {
    if (!reportData) return;
    
    // Simulate generating file download
    let content = '';
    let fileName = '';
    
    if (type === 'assets') {
      fileName = 'assetflow-assets-registry.csv';
      content = 'ID,Name,Asset Tag,Category,Model,Serial Number,Purchase Date,Purchase Cost,Status,Location\n' +
        reportData.assets.map(a => 
          `"${a.id}","${a.name}","${a.assetTag}","${a.category}","${a.model}","${a.serialNumber}","${a.purchaseDate}",${a.purchaseCost},"${a.status}","${a.location}"`
        ).join('\n');
    } else {
      fileName = 'assetflow-allocations-record.csv';
      content = 'ID,Asset Tag,Asset Name,Employee Name,Issued Date,Due Date,Status\n' +
        reportData.allocations.map(a => 
          `"${a.id}","${a.assetTag}","${a.assetName}","${a.employeeName}","${a.allocatedDate}","${a.dueDate}","${a.status}"`
        ).join('\n');
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const { counts, totalValue } = metrics;

  return (
    <div className="space-y-6">
      
      {/* Export Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Reports & Analytics Hub
          </h3>
          <p className="text-xs text-slate-400 mt-1">Download audits and export ledger sheets to CSV.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('assets')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export Assets List (CSV)
          </button>
          <button
            onClick={() => handleExport('allocations')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export Allocations (CSV)
          </button>
        </div>
      </div>

      {/* Grid overview */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Metric Card */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="rounded-lg bg-blue-50 p-2 text-primary inline-block">
              <DollarSign className="h-5 w-5" />
            </span>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-4">Total Inventory Capital</h4>
            <p className="text-3xl font-extrabold text-brand-text mt-2">${totalValue.toLocaleString()}</p>
          </div>
          <p className="text-[11px] text-slate-450 mt-6 font-medium">Sum of all purchased assets currently active in registers.</p>
        </div>

        {/* Breakdown Card */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm col-span-2">
          <h4 className="text-sm font-bold text-brand-text flex items-center gap-1.5 mb-4">
            <PieChart className="h-4 w-4 text-primary" /> Lifecycle Distribution Ledger
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Available', count: counts.available, pct: Math.round((counts.available / counts.total) * 100), color: 'emerald' },
              { label: 'Allocated', count: counts.allocated, pct: Math.round((counts.allocated / counts.total) * 100), color: 'blue' },
              { label: 'In Service', count: counts.maintenance, pct: Math.round((counts.maintenance / counts.total) * 100), color: 'amber' },
              { label: 'Reserved', count: counts.reserved, pct: Math.round((counts.reserved / counts.total) * 100), color: 'indigo' }
            ].map(col => (
              <div key={col.label} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs text-slate-450 font-semibold block">{col.label}</span>
                <span className="text-2xl font-bold text-slate-800 mt-1 block">{col.count}</span>
                <span className={`text-[10px] font-bold mt-2 inline-block px-1.5 py-0.5 rounded bg-${col.color}-50 text-${col.color}-700`}>
                  {col.pct}% share
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
