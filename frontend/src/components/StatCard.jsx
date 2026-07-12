import React from 'react';

export const StatCard = ({ title, value, icon: Icon, description, trend, trendType = 'neutral', loading }) => {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-slate-200"></div>
          ) : (
            <h3 className="mt-1 text-2xl font-bold text-brand-text tracking-tight">{value}</h3>
          )}
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-primary">
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-4 flex items-center text-xs">
          {trend && (
            <span className={`font-semibold mr-1.5 ${
              trendType === 'positive' ? 'text-emerald-600' :
              trendType === 'negative' ? 'text-rose-600' :
              'text-slate-500'
            }`}>
              {trend}
            </span>
          )}
          <span className="text-slate-400 font-medium">{description}</span>
        </div>
      )}
    </div>
  );
};
