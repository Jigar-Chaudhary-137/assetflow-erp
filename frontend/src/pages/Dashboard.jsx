import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { reportService } from '../services/reportService';
import { bookingService } from '../services/bookingService';
import { maintenanceService } from '../services/maintenanceService';
import { allocationService } from '../services/allocationService';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { 
  Package, 
  CheckCircle, 
  Wrench, 
  CalendarRange, 
  Activity, 
  AlertCircle,
  FileClock,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, isAssetManager, isDeptHead } = useAuth();
  const { fetchNotifications } = useNotifications();

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await reportService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleApproveBooking = async (id) => {
    if (window.confirm('Approve this asset booking request?')) {
      await bookingService.approve(id);
      loadMetrics();
      fetchNotifications();
    }
  };

  const handleRejectBooking = async (id) => {
    if (window.confirm('Reject this asset booking request?')) {
      await bookingService.reject(id);
      loadMetrics();
      fetchNotifications();
    }
  };

  const handleApproveMaintenance = async (id) => {
    if (window.confirm('Approve this maintenance ticket? Status will change to Under Maintenance.')) {
      await maintenanceService.approve(id);
      loadMetrics();
      fetchNotifications();
    }
  };

  const handleApproveTransfer = async (id) => {
    if (window.confirm('Approve this asset transfer? The asset assignment will change.')) {
      await allocationService.approveTransfer(id);
      loadMetrics();
      fetchNotifications();
    }
  };

  const handleRejectTransfer = async (id) => {
    if (window.confirm('Reject this asset transfer request?')) {
      await allocationService.rejectTransfer(id);
      loadMetrics();
      fetchNotifications();
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const { counts, totalValue, categoryDistribution, departmentDistribution, recentActivity, pendingApprovals } = metrics;

  return (
    <div className="space-y-6">
      
      {/* Welcome banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
        <p className="mt-1 text-blue-100 font-medium text-sm">
          You are currently logged in as a <span className="font-bold text-white uppercase">{user?.role}</span>. Here is your enterprise overview.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Assets" 
          value={counts.total} 
          icon={Package} 
          trend={`$${totalValue.toLocaleString()}`}
          trendType="neutral"
          description="Total Valuation"
        />
        <StatCard 
          title="Allocated Assets" 
          value={counts.allocated} 
          icon={CheckCircle} 
          trend={`${Math.round((counts.allocated / (counts.total || 1)) * 100)}%`}
          trendType="positive"
          description="Utilization Rate"
        />
        <StatCard 
          title="In Maintenance" 
          value={counts.maintenance} 
          icon={Wrench} 
          trend={counts.pendingMaintenance > 0 ? `${counts.pendingMaintenance} Pending` : 'Healthy'}
          trendType={counts.pendingMaintenance > 0 ? 'negative' : 'neutral'}
          description="Current Service Jobs"
        />
        <StatCard 
          title="Active Bookings" 
          value={counts.reserved} 
          icon={CalendarRange} 
          trend={`${counts.pendingBookings} Request(s)`}
          trendType={counts.pendingBookings > 0 ? 'positive' : 'neutral'}
          description="Future Reservations"
        />
      </div>

      {/* Main Grid: Approvals, Distributions, Activities */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left 2 Cols: Action/Approval Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Approval Lists */}
          {(isAssetManager || isDeptHead) && (
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
              <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Pending Approvals Queue
              </h3>

              <div className="space-y-4">
                
                {/* Bookings Pending */}
                {pendingApprovals.bookings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Booking Requests</h4>
                    <div className="space-y-2">
                      {pendingApprovals.bookings.map(b => (
                        <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-brand-border bg-slate-50/50 gap-3">
                          <div>
                            <p className="text-sm font-bold text-brand-text">{b.assetName}</p>
                            <p className="text-xs text-slate-500">Requested by: <span className="font-semibold text-slate-700">{b.employeeName}</span></p>
                            <p className="text-xs text-slate-400">Dates: {b.startDate} to {b.endDate}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => handleApproveBooking(b.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectBooking(b.id)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Maintenance Pending */}
                {pendingApprovals.maintenances.length > 0 && isAssetManager && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Maintenance Approvals</h4>
                    <div className="space-y-2">
                      {pendingApprovals.maintenances.map(m => (
                        <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-brand-border bg-slate-50/50 gap-3">
                          <div>
                            <p className="text-sm font-bold text-brand-text">{m.assetName}</p>
                            <p className="text-xs text-slate-600 font-medium line-clamp-1">{m.issueDescription}</p>
                            <p className="text-xs text-slate-400">Priority: <span className="font-semibold text-slate-700">{m.priority}</span> | Est. Cost: ${m.cost}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => handleApproveMaintenance(m.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              Approve Work
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transfers Pending */}
                {pendingApprovals.transfers.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Asset Transfer Requests</h4>
                    <div className="space-y-2">
                      {pendingApprovals.transfers.map(t => (
                        <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-brand-border bg-slate-50/50 gap-3">
                          <div>
                            <p className="text-sm font-bold text-brand-text">{t.assetName} ({t.assetTag})</p>
                            <p className="text-xs text-slate-500">Current Assignee: <span className="font-semibold text-slate-700">{t.employeeName}</span></p>
                            <p className="text-xs text-slate-500">Requested Transfer To: <span className="font-semibold text-primary">Someone Else</span></p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => handleApproveTransfer(t.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectTransfer(t.id)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingApprovals.bookings.length === 0 && 
                 pendingApprovals.maintenances.length === 0 && 
                 pendingApprovals.transfers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-sm text-slate-500 font-semibold">Clean Desk! All pending requests have been approved.</p>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Allocation overview if employee */}
          {user?.role === 'Employee' && (
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
              <h3 className="text-base font-bold text-brand-text mb-4">Your Active Asset Allocations</h3>
              <div className="text-center py-6">
                <Link to="/allocations" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                  Go to My Allocations & Transfers <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Distributions */}
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Categories */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
              <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Assets by Category
              </h3>
              <div className="space-y-3.5">
                {categoryDistribution.map((item, idx) => {
                  const percent = Math.round((item.value / counts.total) * 100);
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>{item.name}</span>
                        <span>{item.value} units ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Departments */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
              <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Assets by Department
              </h3>
              <div className="space-y-3.5">
                {departmentDistribution.map((item, idx) => {
                  const percent = Math.round((item.value / counts.total) * 100);
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>{item.name || 'Unassigned'}</span>
                        <span>{item.value} units ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right Col: Activity Feed */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm h-fit">
          <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Live Audit Trail
          </h3>

          <div className="relative border-l-2 border-slate-150 pl-4 space-y-6">
            {recentActivity.map((log) => (
              <div key={log.id} className="relative">
                {/* Visual bullet */}
                <div className="absolute -left-[23px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-4 ring-white" />
                
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">{log.user}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs font-semibold text-primary mt-0.5">{log.action}</p>
                  <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                  {log.targetTag && (
                    <span className="mt-1 inline-block text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5">
                      {log.targetTag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-brand-border text-center">
            <Link to="/audit-logs" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
              <FileClock className="h-4 w-4" /> View Full System Audit Trail
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
