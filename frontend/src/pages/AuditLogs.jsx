import React, { useState, useEffect } from 'react';
import { auditService } from '../services/auditService';
import { FileCheck2, Search, Calendar } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAll();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const query = search.toLowerCase();
    return (
      log.user.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      (log.targetTag && log.targetTag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" /> System Audit Logs
          </h3>
          <p className="text-xs text-slate-400 mt-1">Read-only historical trail of all asset modifications, allocations, and requests.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-brand-border bg-brand-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-450 font-semibold">No audit logs matching search found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Staff User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Asset Tag</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-sm font-medium">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 text-slate-650">
                    <td className="p-4 text-slate-400 text-xs font-semibold">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-800 font-bold">{log.user}</td>
                    <td className="p-4">
                      <span className="text-primary font-semibold">{log.action}</span>
                    </td>
                    <td className="p-4">
                      {log.targetTag ? (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono">
                          {log.targetTag}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-xs max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
