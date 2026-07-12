import React from 'react';
import { ASSET_STATUS_COLORS, BOOKING_STATUS_COLORS, MAINTENANCE_STATUS_COLORS } from '../constants';

export const Badge = ({ status, type = 'asset' }) => {
  let colorClasses = 'bg-slate-50 text-slate-700 border-slate-200';

  if (type === 'asset') {
    colorClasses = ASSET_STATUS_COLORS[status] || colorClasses;
  } else if (type === 'booking') {
    colorClasses = BOOKING_STATUS_COLORS[status] || colorClasses;
  } else if (type === 'maintenance') {
    colorClasses = MAINTENANCE_STATUS_COLORS[status] || colorClasses;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5"></span>
      {status}
    </span>
  );
};
