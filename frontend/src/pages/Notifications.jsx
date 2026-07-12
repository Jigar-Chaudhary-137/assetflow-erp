import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  CalendarRange, 
  Repeat, 
  UserCheck, 
  Wrench,
  Sparkles
} from 'lucide-react';

export const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  // Wireframe sample notification stream
  const notificationsData = [
    {
      id: 'n-1',
      text: 'Laptop AF-0014 assigned to Priya Shah',
      time: '2m ago',
      type: 'Approvals',
      color: 'bg-blue-500 ring-blue-100',
      icon: UserCheck
    },
    {
      id: 'n-2',
      text: 'Maintenance request AF-0055 approved',
      time: '18m ago',
      type: 'Approvals',
      color: 'bg-emerald-500 ring-emerald-100',
      icon: Wrench
    },
    {
      id: 'n-3',
      text: 'Booking confirmed: Room B2 from 2:00 PM to 3:00 PM',
      time: '1h ago',
      type: 'Bookings',
      color: 'bg-blue-500 ring-blue-100',
      icon: CalendarRange
    },
    {
      id: 'n-4',
      text: 'Transfer approved: AF-0033 moved to Facilities Department',
      time: '3h ago',
      type: 'Approvals',
      color: 'bg-pink-500 ring-pink-100',
      icon: Repeat
    },
    {
      id: 'n-5',
      text: 'Overdue return: AF-0021 was due 3 days ago',
      time: '1d ago',
      type: 'Alerts',
      color: 'bg-amber-500 ring-amber-100',
      icon: AlertTriangle
    },
    {
      id: 'n-6',
      text: 'Audit discrepancy flagged: AF-0088 marked as damaged',
      time: '2d ago',
      type: 'Alerts',
      color: 'bg-rose-500 ring-rose-100',
      icon: AlertTriangle
    }
  ];

  const filteredNotifications = notificationsData.filter(item => 
    activeFilter === 'All' ? true : item.type === activeFilter
  );

  const filterTabs = ['All', 'Alerts', 'Approvals', 'Bookings'];

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#2563EB]" /> Activity Logs & Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Track approvals, alerts, bookings and system activities across AssetFlow.
          </p>
        </div>

        {/* Unread badge indicator count */}
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1 shrink-0 animate-bounce">
          <Sparkles className="h-3 w-3" /> {notificationsData.length} Activities Logged
        </span>
      </div>

      {/* Top Filter Tabs Chips */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              activeFilter === tab
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List Presentation Container */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-2xs overflow-hidden divide-y divide-[#E2E8F0]">
        {filteredNotifications.map(item => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-4 gap-4 hover:bg-slate-50/70 transition-colors duration-150 group"
            >
              {/* Left Indicator and Info */}
              <div className="flex items-center gap-3.5">
                {/* indicator dot ring */}
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ring-4 ${item.color}`} />
                
                {/* lucide visual icon context helper */}
                <div className="rounded-lg p-1.5 bg-slate-50 border border-slate-150 text-slate-500 group-hover:bg-white transition-colors shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <span className="text-xs font-semibold text-[#0F172A] leading-relaxed">
                  {item.text}
                </span>
              </div>

              {/* Timestamp Right aligned */}
              <span className="text-[10px] text-slate-400 font-bold shrink-0 font-mono">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
