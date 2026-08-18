import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  CreditCard, 
  CheckCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

export const PaymentsTab: React.FC = () => {
  const { activeTenant } = useApp();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const currencySymbol = activeTenant.settings.currency === 'INR' ? '₹' : '$';
  const bookings = activeTenant.bookings || [];

  // Compute metrics
  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.amountPaid, 0);
  const totalPaid = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.amountPaid, 0);
  const totalPending = bookings.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.amountPaid, 0);
  const totalRefunded = bookings.filter(b => b.paymentStatus === 'refunded').reduce((sum, b) => sum + b.amountPaid, 0);

  // Filter transactions
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(search.toLowerCase()) || 
                          b.id.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === 'all' || b.paymentMethod.toLowerCase() === methodFilter.toLowerCase();
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div className="border-b border-[#e2e1d7] pb-5">
        <h1 className="text-2xl font-extrabold text-[#1a1a1e] font-outfit">Payment Ledger</h1>
        <p className="text-xs text-[#7a7974] mt-1 font-semibold">Track transactions, refunds, and gateway settings</p>
      </div>

      {/* Grid statistics summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', val: totalRevenue, icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
          { label: 'Paid & Settlement', val: totalPaid, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pending Deposits', val: totalPending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Refunds Processed', val: totalRefunded, icon: RotateCcw, color: 'text-red-600 bg-red-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-[#e2e1d7] rounded-2xl p-5 shadow-xs flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#7a7974] tracking-wider">{m.label}</span>
              <h3 className="text-xl font-extrabold text-[#1a1a1e] font-outfit">
                {currencySymbol}{m.val.toLocaleString()}
              </h3>
            </div>
            <span className={`p-2 rounded-xl ${m.color}`}>
              <m.icon className="w-5 h-5" />
            </span>
          </div>
        ))}
      </div>

      {/* Transaction List and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ledger list on the left */}
        <div className="lg:col-span-2 bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[#e2e1d7] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide">Transactions Ledger</h3>
              <span className="text-[10px] text-[#7a7974]">View transactional records from bookings</span>
            </div>
            
            <div className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-3 py-1.5 border border-[#e2e1d7] rounded-xl focus:outline-none focus:border-[#1b4332] bg-[#f4f3ed]/30"
              />
              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value)}
                className="px-2 py-1.5 border border-[#e2e1d7] rounded-xl focus:outline-none bg-[#f4f3ed]/30 font-bold"
              >
                <option value="all">All Methods</option>
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#7a7974] border-b border-[#e2e1d7] uppercase tracking-wider font-bold">
                  <th className="py-2.5">Guest</th>
                  <th className="py-2.5">Booking Ref</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Gateway</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e1d7]/60 text-[#1a1a1e] font-semibold">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold">{b.guestName}</td>
                    <td className="py-3 font-mono text-[#7a7974]">{b.id}</td>
                    <td className="py-3 font-extrabold text-sm">{currencySymbol}{b.amountPaid.toLocaleString()}</td>
                    <td className="py-3 text-[#7a7974]">{b.paymentMethod}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        b.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        b.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-[#7a7974] italic">
                      No matching payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mock settings on the right */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-[#e2e1d7] pb-3">
            <h3 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide">Gateway Integration</h3>
            <span className="text-[10px] text-[#7a7974]">Bind credit processing settings</span>
          </div>

          <div className="space-y-4 text-xs font-semibold text-[#1a1a1e]">
            {/* Razorpay Switch */}
            <div className="p-3.5 border border-[#e2e1d7] bg-[#fcfbf9] rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-[#1a1a1e]">Razorpay Sandbox</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[9px]">Active</span>
              </div>
              <input
                type="text"
                disabled
                value="rzp_test_5N89aP12b"
                className="w-full p-2 bg-[#f4f3ed]/60 border border-[#e2e1d7] rounded text-slate-500 font-mono"
              />
            </div>

            {/* Stripe Switch */}
            <div className="p-3.5 border border-[#e2e1d7] bg-[#fcfbf9] rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-[#1a1a1e]">Stripe Integration</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[9px]">Inactive</span>
              </div>
              <button className="w-full py-2 bg-[#1b4332] hover:bg-[#143324] text-white font-bold text-xs rounded transition-colors">
                Connect Stripe Account
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default PaymentsTab;
