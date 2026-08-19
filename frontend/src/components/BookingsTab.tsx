import React, { useState } from 'react';
import { useApp } from '../AppContext';
import type { Booking } from '../db';
import { 
  Calendar as CalendarIcon, 
  List, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  X
} from 'lucide-react';

export const BookingsTab: React.FC = () => {
  const { activeTenant, addBooking, updateBooking, deleteBooking } = useApp();
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  
  // Modals state
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [amountPaid, setAmountPaid] = useState(0);
  const [status, setStatus] = useState<Booking['status']>('confirmed');
  const [paymentStatus, setPaymentStatus] = useState<Booking['paymentStatus']>('paid');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [notes, setNotes] = useState('');

  const currencySymbol = activeTenant.settings.currency === 'INR' ? '₹' : '$';
  const bookings = activeTenant.bookings || [];

  // Filter lists
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(search.toLowerCase()) || 
                          b.id.toLowerCase().includes(search.toLowerCase()) || 
                          b.guestId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesRoom = roomFilter === 'all' || b.roomType === roomFilter;
    return matchesSearch && matchesStatus && matchesRoom;
  });

  const openCreateModal = () => {
    setSelectedBooking(null);
    setGuestName('');
    setGuestContact('');
    setRoomType(activeTenant.rooms[0]?.type || 'Deluxe Room');
    setRoomNumber('101');
    setCheckIn('2026-08-19');
    setCheckOut('2026-08-22');
    setGuestsCount(2);
    setAmountPaid(activeTenant.rooms[0]?.basePrice * 3 || 10497);
    setStatus('confirmed');
    setPaymentStatus('paid');
    setPaymentMethod('Razorpay');
    setNotes('');
    setEditorOpen(true);
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setGuestName(booking.guestName);
    setGuestContact(booking.guestId);
    setRoomType(booking.roomType);
    setRoomNumber(booking.roomNumber);
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setGuestsCount(booking.guestsCount);
    setAmountPaid(booking.amountPaid);
    setStatus(booking.status);
    setPaymentStatus(booking.paymentStatus);
    setPaymentMethod(booking.paymentMethod);
    setNotes(booking.notes);
    setEditorOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBooking) {
      // Edit
      updateBooking({
        ...selectedBooking,
        guestName,
        guestId: guestContact,
        roomType,
        roomNumber,
        checkIn,
        checkOut,
        guestsCount,
        amountPaid,
        status,
        paymentStatus,
        paymentMethod,
        notes
      });
    } else {
      // Add
      addBooking({
        guestId: guestContact,
        guestName,
        roomType,
        roomNumber,
        checkIn,
        checkOut,
        status,
        amountPaid,
        paymentStatus,
        guestsCount,
        notes,
        paymentMethod
      });
    }
    setEditorOpen(false);
  };

  // Calendar Timeline Coordinates (August 14 to August 28)
  const calendarDays = Array.from({ length: 15 }, (_, i) => {
    const dayNum = 14 + i;
    return `2026-08-${dayNum}`;
  });

  const getCalendarDayLabel = (dateStr: string) => {
    const day = dateStr.split('-')[2];
    return `${day} Aug`;
  };

  // Generate distinct rows based on room availability setup
  const mockRoomRows = [
    { roomNumber: "101", type: "Deluxe Room" },
    { roomNumber: "102", type: "Deluxe Room" },
    { roomNumber: "103", type: "Deluxe Room" },
    { roomNumber: "201", type: "Premium Suite" },
    { roomNumber: "202", type: "Premium Suite" },
    { roomNumber: "108", type: "Family Room" },
    { roomNumber: "110", type: "Family Room" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary font-outfit">Reservations Ledger</h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Track and edit guest room scheduling calendars</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-hover font-bold text-xs shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Booking</span>
        </button>
      </div>

      {/* Control Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white border border-border-subtle p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search guests or reservation IDs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-xl focus:outline-none focus:border-brand-primary text-xs text-text-primary bg-[#f1f5f9]/30"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[#f1f5f9]/50 border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-primary">
            <Filter className="w-3.5 h-3.5 text-text-secondary" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold focus:outline-none ml-1.5"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Room filter */}
          <div className="flex items-center gap-1 bg-[#f1f5f9]/50 border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-primary">
            <select
              value={roomFilter}
              onChange={e => setRoomFilter(e.target.value)}
              className="bg-transparent font-bold focus:outline-none"
            >
              <option value="all">All Room Types</option>
              {activeTenant.rooms.map(r => (
                <option key={r.id} value={r.type}>{r.type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher toggle */}
        <div className="flex border border-border-subtle rounded-xl p-0.5 bg-[#f1f5f9] shrink-0 self-start md:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Ledger</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'calendar' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Room Calendar</span>
          </button>
        </div>
      </div>

      {/* View Contents */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bg-page text-text-secondary border-b border-border-subtle uppercase tracking-wider font-bold">
                  <th className="px-6 py-3.5">Booking ID</th>
                  <th className="px-6 py-3.5">Guest</th>
                  <th className="px-6 py-3.5">Room Type</th>
                  <th className="px-6 py-3.5">Room No</th>
                  <th className="px-6 py-3.5">Timeline Dates</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Total Paid</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60 text-text-primary font-semibold">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f1f5f9]/30 transition-colors">
                    <td className="px-6 py-4.5 font-mono text-text-secondary">{b.id}</td>
                    <td className="px-6 py-4.5">
                      <div>
                        <span className="block font-bold text-sm text-text-primary">{b.guestName}</span>
                        <span className="block text-[10px] text-text-secondary mt-0.5 leading-none">{b.guestId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-text-secondary">{b.roomType}</td>
                    <td className="px-6 py-4.5 font-mono text-center sm:text-left">{b.roomNumber}</td>
                    <td className="px-6 py-4.5 font-medium text-text-secondary">
                      {b.checkIn} <span className="text-[#cbd5e1] mx-1">→</span> {b.checkOut}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.status === 'checked-in' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        b.status === 'checked-out' ? 'bg-slate-100 text-slate-800' :
                        b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-extrabold text-sm text-right sm:text-left">
                      {currencySymbol}{b.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg border border-border-subtle hover:bg-[#f1f5f9] text-brand-primary cursor-pointer"
                          title="Edit Booking"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-text-secondary font-medium italic">
                      No matching reservations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar Schedule Room Grid */
        <div className="bg-white border border-border-subtle rounded-2xl shadow-sm p-6 overflow-hidden space-y-6">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">August 2026 Timeline</h3>
              <span className="text-[10px] text-text-secondary">View active allocations per room row</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-bold text-text-secondary">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Checked-In</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> Confirmed</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Pending</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-border-subtle rounded-xl bg-bg-page">
            <table className="w-full text-xs min-w-[800px] table-fixed">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="w-32 px-4 py-3 bg-white text-left font-bold text-text-primary uppercase tracking-wider sticky left-0 z-10 border-r border-border-subtle">Room No</th>
                  {calendarDays.map(day => (
                    <th key={day} className="px-2 py-3 text-center text-[10px] font-extrabold text-text-secondary uppercase tracking-wider border-r border-border-subtle/60">
                      {getCalendarDayLabel(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {mockRoomRows.map(row => (
                  <tr key={row.roomNumber} className="hover:bg-slate-50/50">
                    {/* Room title */}
                    <td className="px-4 py-4 bg-white font-bold text-left sticky left-0 z-10 border-r border-border-subtle shadow-sm">
                      <span className="block text-sm text-text-primary">Room {row.roomNumber}</span>
                      <span className="block text-[11px] text-text-secondary leading-none mt-0.5">{row.type}</span>
                    </td>

                    {/* Schedule block columns */}
                    {calendarDays.map(day => {
                      // Check if there is a booking in this room for this date
                      const activeBooking = bookings.find(b => 
                        b.roomNumber === row.roomNumber && 
                        b.status !== 'cancelled' &&
                        new Date(day) >= new Date(b.checkIn) && 
                        new Date(day) < new Date(b.checkOut)
                      );

                      if (activeBooking) {
                        // Color styling based on booking state
                        const isStart = activeBooking.checkIn === day;
                        const statusColors = 
                          activeBooking.status === 'checked-in' ? 'bg-emerald-500 text-white' :
                          activeBooking.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white';

                        return (
                          <td 
                            key={day} 
                            onClick={() => openEditModal(activeBooking)}
                            className={`p-1 text-center cursor-pointer border-r border-border-subtle/60 relative`}
                          >
                            <div className={`py-1.5 px-1 rounded-md text-[11px] font-bold truncate leading-none ${statusColors}`}>
                              {isStart ? activeBooking.guestName : '•'}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="p-1 border-r border-border-subtle/60 text-center text-border-subtle font-bold">
                          -
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal Popup */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white border border-border-subtle rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <h3 className="text-base font-extrabold text-brand-primary font-outfit">
                {selectedBooking ? `Edit Booking ID: ${selectedBooking.id}` : 'Create New Reservation'}
              </h3>
              <button onClick={() => setEditorOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-text-primary">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Guest Email or Phone</label>
                  <input
                    type="text"
                    required
                    value={guestContact}
                    placeholder="e.g. rahul.sharma@gmail.com"
                    onChange={e => setGuestContact(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Room Category</label>
                  <select
                    value={roomType}
                    onChange={e => setRoomType(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary"
                  >
                    {activeTenant.rooms.map(r => (
                      <option key={r.id} value={r.type}>{r.type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Room Number Alloc</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Total Guests Count</label>
                  <input
                    type="number"
                    min={1}
                    value={guestsCount}
                    onChange={e => setGuestsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Price Paid ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={amountPaid}
                    onChange={e => setAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Reservation Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked In</option>
                    <option value="checked-out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Reservation Details & Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 border border-border-subtle hover:bg-[#f1f5f9] text-text-secondary font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white font-bold rounded-lg cursor-pointer shadow-sm shadow-brand-primary/10"
                >
                  Save Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default BookingsTab;
