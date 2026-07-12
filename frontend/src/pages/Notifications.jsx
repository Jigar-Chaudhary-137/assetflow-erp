import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Trash2, CheckSquare } from 'lucide-react';

export const Notifications = () => {
  const { notifications, markAsRead, clearAll } = useNotifications();

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notifications & Alerts Center
          </h3>
          <p className="text-xs text-slate-400 mt-1">Review activity feeds and alert notifications.</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" /> Clear All Alerts
          </button>
        )}
      </div>

      {/* Alerts listing */}
      <div className="rounded-xl border border-brand-border bg-brand-card shadow-sm p-6 space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-semibold flex flex-col items-center justify-center">
            <Bell className="h-10 w-10 text-slate-300 mb-2" />
            No alerts logged currently.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 ${
                  n.read ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${n.read ? 'font-medium text-slate-600' : 'font-bold text-slate-800'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                    Received on: {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                  >
                    <CheckSquare className="h-4 w-4" /> Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
