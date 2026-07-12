import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { bookingService } from '../services/bookingService';
import { assetService } from '../services/assetService';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { BOOKING_STATUS } from '../constants';
import { Calendar, Plus, Check, X, CalendarCheck2, HelpCircle } from 'lucide-react';

export const Bookings = () => {
  const { user, isAssetManager } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Booking Dialog State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({ assetId: '', startDate: '', endDate: '', purpose: '' });

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const data = await assetService.getAll();
      setAssets(data);
      if (data.length > 0) setNewBooking(prev => ({ ...prev, assetId: data[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
    loadAssets();
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm('Approve this reservation request?')) {
      try {
        await bookingService.approve(id);
        loadBookings();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this reservation request?')) {
      try {
        await bookingService.reject(id);
        loadBookings();
        fetchNotifications();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      await bookingService.create({
        ...newBooking,
        employeeId: user.id
      });
      setBookingModalOpen(false);
      setNewBooking({ assetId: assets[0]?.id || '', startDate: '', endDate: '', purpose: '' });
      loadBookings();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const visibleBookings = user?.role === 'Employee' 
    ? bookings.filter(b => b.employeeId === user.id) 
    : bookings;

  return (
    <div className="space-y-6">
      
      {/* Overview stats & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <CalendarCheck2 className="h-5 w-5 text-primary" /> Asset Reservations Log
          </h3>
          <p className="text-xs text-slate-400 mt-1">Book items for presentations, testing schedules, or travel events.</p>
        </div>

        <button
          onClick={() => setBookingModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Reserve Asset
        </button>
      </div>

      {/* Bookings Datatable */}
      <div className="rounded-xl border border-brand-border bg-brand-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : visibleBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-450 font-semibold">No bookings registered in catalog.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Reserved Asset</th>
                  <th className="p-4">Requested By</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-sm">
                {visibleBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-brand-text">
                      {b.assetName}
                      <span className="block text-[10px] font-semibold text-slate-400">{b.assetTag}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{b.employeeName}</td>
                    <td className="p-4 text-slate-500 font-medium">{b.startDate}</td>
                    <td className="p-4 text-slate-500 font-medium">{b.endDate}</td>
                    <td className="p-4 text-slate-500 text-xs font-medium max-w-xs truncate" title={b.purpose}>
                      {b.purpose}
                    </td>
                    <td className="p-4"><Badge status={b.status} type="booking" /></td>
                    <td className="p-4 text-right">
                      {b.status === BOOKING_STATUS.PENDING && isAssetManager && (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handleApprove(b.id)}
                            className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Approve Reservation"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(b.id)}
                            className="rounded-lg bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Reject Reservation"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Register Reservation Request Modal */}
      <Modal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} title="Request Asset Reservation Slot">
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Asset Catalog</label>
            <select
              value={newBooking.assetId}
              onChange={(e) => setNewBooking(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
            >
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetTag} - {asset.status})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date" required
                value={newBooking.startDate}
                onChange={(e) => setNewBooking(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date" required
                value={newBooking.endDate}
                onChange={(e) => setNewBooking(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reservation Purpose</label>
            <textarea
              required
              value={newBooking.purpose}
              onChange={(e) => setNewBooking(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g. testing hardware parameters / customer presentation display layout..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:outline-none h-24"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Submit Reservation Request
          </button>
        </form>
      </Modal>

    </div>
  );
};
