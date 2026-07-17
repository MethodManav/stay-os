import React, { useState, useEffect } from 'react';
import { Search, Calendar, Landmark, HelpCircle, Filter } from 'lucide-react';
import type { Booking } from '../mockData';
import { getBookings } from '../mockData';

export const BookingsTab: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.roomNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'cancelled')
    .reduce((sum, b) => sum + b.amountPaid, 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glassy-card p-5 rounded-xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <div className="space-y-1">
            <span className="block text-xs font-bold text-text-secondary uppercase tracking-widest">total bookings</span>
            <span className="block text-5xl font-light tracking-tight text-text-primary mt-2">{totalBookings}</span>
            <span className="block text-xs text-text-secondary font-medium mt-1">active reservations in directory</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-bg-page border border-border-subtle flex items-center justify-center text-text-secondary shadow-inner">
            <Calendar className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Re-themed as the solid blue 'Vulnerability' widget from the Resq.io template */}
        <div className="bg-brand-primary border border-transparent p-5 rounded-xl flex items-center justify-between shadow-lg shadow-brand-primary/10">
          <div className="space-y-1">
            <span className="block text-xs font-bold text-white/90 uppercase tracking-widest">total revenue</span>
            <span className="block text-5xl font-light tracking-tight text-white mt-2">${totalRevenue.toLocaleString()}</span>
            <span className="block text-xs text-white/80 font-medium mt-1">collected via razorpay gateway</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Landmark className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="glassy-card p-5 rounded-xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <div className="space-y-1">
            <span className="block text-xs font-bold text-text-secondary uppercase tracking-widest">pending confirmation</span>
            <span className="block text-5xl font-light tracking-tight text-text-primary mt-2">{pendingCount}</span>
            <span className="block text-xs text-text-secondary font-medium mt-1">awaiting check-in or transaction</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-bg-page border border-border-subtle flex items-center justify-center text-text-secondary shadow-inner">
            <HelpCircle className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="bg-bg-card rounded-xl border border-border-subtle overflow-hidden shadow-sm">
        
        {/* Controls Header */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-card">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="search guest name or room..."
              className="w-full pl-9 pr-3.5 py-2 bg-bg-page border border-border-subtle focus:border-brand-primary text-sm rounded-lg focus:outline-none transition-colors text-text-primary placeholder:text-text-secondary/50"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <Filter className="w-4 h-4 text-text-secondary mr-1" />
            
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-colors cursor-pointer border ${
                statusFilter === 'all' 
                  ? 'bg-text-primary text-bg-page border-text-primary' 
                  : 'text-text-secondary border-transparent hover:bg-bg-page hover:text-text-primary'
              }`}
            >
              all
            </button>

            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-colors cursor-pointer border ${
                statusFilter === 'confirmed' 
                  ? 'bg-brand-primary text-white border-brand-primary' 
                  : 'text-text-secondary border-transparent hover:bg-bg-page hover:text-text-primary'
              }`}
            >
              confirmed
            </button>

            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-colors cursor-pointer border ${
                statusFilter === 'pending' 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'text-text-secondary border-transparent hover:bg-bg-page hover:text-text-primary'
              }`}
            >
              pending
            </button>

            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-colors cursor-pointer border ${
                statusFilter === 'cancelled' 
                  ? 'bg-red-500 text-white border-red-500' 
                  : 'text-text-secondary border-transparent hover:bg-bg-page hover:text-text-primary'
              }`}
            >
              cancelled
            </button>
          </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-sidebar/10 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <th className="py-3.5 px-6">booking id</th>
                <th className="py-3.5 px-6">guest name</th>
                <th className="py-3.5 px-6">room detail</th>
                <th className="py-3.5 px-6">check-in date</th>
                <th className="py-3.5 px-6">checkout date</th>
                <th className="py-3.5 px-6">amount paid</th>
                <th className="py-3.5 px-6">razorpay transaction id</th>
                <th className="py-3.5 px-6 text-center">status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-sm text-text-primary font-medium">
              {filteredBookings.map(b => (
                <tr key={b.id} className="hover:bg-bg-page/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-brand-primary">{b.id}</td>
                  <td className="py-4 px-6 font-semibold text-text-primary">{b.guestName}</td>
                  <td className="py-4 px-6">
                    <span className="block font-bold">room {b.roomNumber}</span>
                    <span className="block text-xs text-text-secondary font-medium mt-0.5">{b.roomType}</span>
                  </td>
                  <td className="py-4 px-6 text-text-secondary">{b.checkIn}</td>
                  <td className="py-4 px-6 text-text-secondary">{b.checkOut}</td>
                  <td className="py-4 px-6 font-bold">${b.amountPaid}</td>
                  <td className="py-4 px-6 font-mono text-xs text-text-secondary">{b.razorpayPaymentId}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                      b.status === 'confirmed' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : b.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-text-secondary font-semibold">
                    no bookings found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
