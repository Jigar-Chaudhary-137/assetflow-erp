import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { bookingService } from '../services/bookingService';
import { assetService } from '../services/assetService';
import { Modal } from '../components/Modal';
import { 
  Calendar, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  Package
} from 'lucide-react';

export const Bookings = () => {
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selectors
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({ startDate: '', endDate: '', purpose: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const assetList = await assetService.getAll();
      setAssets(assetList);
      
      if (assetList.length > 0) {
        setSelectedAssetId(assetList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) return;
    try {
      await bookingService.create({
        assetId: selectedAssetId,
        employeeId: user.id,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        purpose: newBooking.purpose
      });
      alert("Booking slot requested successfully!");
      setBookingModalOpen(false);
      setNewBooking({ startDate: '', endDate: '', purpose: '' });
      loadData();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  // Time slots for wireframe
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00'];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Resource Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Top Resource Selector
          </label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white py-3 px-4 text-sm font-semibold focus:border-[#2563EB] focus:outline-none cursor-pointer"
          >
            <option value="">Conference Room B2 - Tue, 7 Jul</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.assetTag})
              </option>
            ))}
          </select>
        </div>

        {/* Green Action Button */}
        <button
          onClick={() => setBookingModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md cursor-pointer transition-all shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" /> Book Slot
        </button>
      </div>

      {/* Booking Timeline */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] mb-6 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-[#2563EB]" /> Booking Timeline
        </h3>

        <div className="space-y-5">
          {timeSlots.map(slot => {
            
            let slotCard = null;

            if (slot === '09:00') {
              // Blue booking block
              slotCard = (
                <div className="w-full max-w-md rounded-xl border border-blue-200 bg-[#2563EB] text-white p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-white/10 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-sm">Booked</div>
                  <div className="text-xs text-blue-100 font-semibold mt-1">Procurement Team</div>
                  <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wide mt-2">9:00 - 10:00</div>
                </div>
              );
            } else if (slot === '10:00') {
              // Red conflict block
              slotCard = (
                <div className="w-full max-w-md rounded-xl border border-rose-200 bg-[#EF4444] text-white p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden animate-pulse">
                  <div className="font-bold text-sm">Requested 9:30 - 10:30</div>
                  <div className="text-xs text-rose-100 font-semibold mt-1">Conflict detected</div>
                  <div className="text-[10px] font-bold text-rose-200 uppercase tracking-wide mt-2">Slot unavailable</div>
                </div>
              );
            } else {
              // Available slots
              slotCard = (
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full max-w-md rounded-xl border border-emerald-100 bg-[#10B981]/5 text-[#10B981] p-3 text-left hover:bg-[#10B981]/10 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Slot Available
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#10B981]/10 px-2 py-0.5 rounded">
                    Open
                  </span>
                </button>
              );
            }

            return (
              <div key={slot} className="flex items-start border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                {/* Time slot labels */}
                <div className="w-16 shrink-0 text-sm font-bold text-slate-400 mt-2 font-mono">
                  {slot}
                </div>
                
                {/* Visual block placement */}
                <div className="flex-1 pl-6">
                  {slotCard}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Form Modal */}
      <Modal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} title={`Book slot for: ${selectedAsset?.name || 'Conference Room B2'}`}>
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Time</label>
              <input
                type="datetime-local" required
                value={newBooking.startDate}
                onChange={(e) => setNewBooking(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-350 py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Time</label>
              <input
                type="datetime-local" required
                value={newBooking.endDate}
                onChange={(e) => setNewBooking(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-350 py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Booking Purpose</label>
            <textarea
              required
              value={newBooking.purpose}
              onChange={(e) => setNewBooking(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Provide booking specifications..."
              className="w-full rounded-lg border border-slate-350 py-2 px-3 text-sm focus:outline-none h-20"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer">
            Create Booking
          </button>
        </form>
      </Modal>

    </div>
  );
};
