import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { reportService } from '../services/reportService';
import { 
  Package, 
  CheckCircle, 
  Wrench, 
  CalendarRange, 
  Clock, 
  CornerDownLeft, 
  AlertTriangle,
  Plus,
  Calendar,
  AlertCircle,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  if (loading || !metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent"></div>
      </div>
    );
  }

  const { counts, recentActivity } = metrics;

  // Overview Cards dataset
  const overviewCards = [
    {
      title: 'Available Assets',
      value: counts.available,
      icon: CheckCircle,
      iconColor: 'text-emerald-500 bg-emerald-50',
      trend: 'Steady',
      trendType: 'neutral',
      trendIcon: TrendingUp
    },
    {
      title: 'Allocated Assets',
      value: counts.allocated,
      icon: Package,
      iconColor: 'text-blue-500 bg-blue-50',
      trend: '+12% from last month',
      trendType: 'positive',
      trendIcon: TrendingUp
    },
    {
      title: 'Active Bookings',
      value: counts.reserved,
      icon: CalendarRange,
      iconColor: 'text-indigo-500 bg-indigo-50',
      trend: '+4% this week',
      trendType: 'positive',
      trendIcon: TrendingUp
    },
    {
      title: 'Pending Transfers',
      value: counts.pendingTransfers,
      icon: Clock,
      iconColor: 'text-amber-500 bg-amber-50',
      trend: '-2% reduction',
      trendType: 'positive',
      trendIcon: TrendingDown
    },
    {
      title: 'Upcoming Returns',
      value: 3, // Mock overdue correlation
      icon: CornerDownLeft,
      iconColor: 'text-rose-500 bg-rose-50',
      trend: '3 Overdue return alerts',
      trendType: 'negative',
      trendIcon: AlertTriangle
    },
    {
      title: 'Maintenance Requests',
      value: counts.pendingMaintenance,
      icon: Wrench,
      iconColor: 'text-orange-500 bg-orange-50',
      trend: `${counts.pendingMaintenance} awaiting action`,
      trendType: counts.pendingMaintenance > 0 ? 'warning' : 'neutral',
      trendIcon: AlertCircle
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Red Alert Banner */}
      {user?.role !== 'Employee' && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-xs animate-pulse">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-semibold">
            3 assets overdue for return.
          </div>
          <Link 
            to="/allocations" 
            className="text-xs font-bold text-rose-900 underline hover:text-rose-950 transition-colors"
          >
            View Allocations
          </Link>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3">
        {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
          <button
            onClick={() => navigate('/assets')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" /> Register Asset
          </button>
        )}
        {(user?.role === 'Employee' || user?.role === 'Department Head' || user?.role === 'Admin') && (
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs cursor-pointer transition-all"
          >
            <Calendar className="h-4 w-4 text-slate-500" /> Book Resource
          </button>
        )}
        {(user?.role === 'Employee' || user?.role === 'Asset Manager' || user?.role === 'Admin') && (
          <button
            onClick={() => navigate('/maintenance')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs cursor-pointer transition-all"
          >
            <Wrench className="h-4 w-4 text-slate-500" /> Raise Request
          </button>
        )}
      </div>

      {/* Today's Overview Grid */}
      <div>
        <h3 className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider">
          Today's Overview
        </h3>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {overviewCards.map((card) => (
            <div 
              key={card.title} 
              className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-xs transition-shadow hover:shadow-sm flex items-start justify-between"
            >
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{card.title}</p>
                <h4 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{card.value}</h4>
                
                {/* Trend indicator */}
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <card.trendIcon className={`h-3 w-3 ${
                    card.trendType === 'positive' ? 'text-emerald-500' :
                    card.trendType === 'negative' ? 'text-rose-500' :
                    card.trendType === 'warning' ? 'text-orange-500' :
                    'text-slate-400'
                  }`} />
                  <span className={
                    card.trendType === 'positive' ? 'text-emerald-600' :
                    card.trendType === 'negative' ? 'text-rose-600' :
                    card.trendType === 'warning' ? 'text-orange-600' :
                    'text-slate-500'
                  }>
                    {card.trend}
                  </span>
                </div>
              </div>

              <div className={`rounded-xl p-3 ${card.iconColor}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-[#2563EB]" /> Recent Activity
        </h3>

        <div className="relative border-l-2 border-slate-100 pl-4 space-y-5">
          {recentActivity.map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-[#2563EB] ring-4 ring-white" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div>
                  <span className="font-bold text-[#0F172A]">{log.user}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="font-semibold text-primary">{log.action}</span>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-[#E2E8F0] text-center">
          <Link 
            to="/audit-logs" 
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
          >
            View all logs <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

    </div>
  );
};
