import React from 'react';
import { useApp } from '../AppContext';
import { 
  Plus,
  TrendingUp,
  CircleDot,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardTab: React.FC = () => {
  const { activeTenant } = useApp();

  // Dynamic statistics calculated from bookings list
  const currencySymbol = activeTenant.settings.currency === 'INR' ? '₹' : '$';
  
  // Bookings list
  const bookings = activeTenant.bookings || [];
  
  // Today's bookings and revenue calculations
  const todayStr = "2026-08-18";
  
  const todayRevenue = bookings
    .filter(b => b.status !== 'cancelled' && (b.checkIn === todayStr || b.status === 'checked-in'))
    .reduce((sum, b) => sum + (b.amountPaid / Math.max(1, Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24)))), 0);

  // Total room count
  const totalRoomsCount = activeTenant.rooms.reduce((acc, r) => acc + r.count, 0) || 33;
  const occupiedCount = bookings.filter(b => b.status === 'checked-in').length;
  const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedCount / totalRoomsCount) * 100) : 75;

  const checkinsTodayCount = bookings.filter(b => b.checkIn === todayStr && b.status !== 'cancelled').length;
  const checkoutsTodayCount = bookings.filter(b => b.checkOut === todayStr && b.status !== 'cancelled').length;
  const totalActiveBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length;

  // Monthly values for Customer Growth Summary (bar chart mockup)
  const growthMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const growthValues = [4500, 8300, 6900, 3900, 4900, 7900, 8300, 7100, 4000, 4900, 7700, 8100];
  const maxGrowthValue = Math.max(...growthValues);

  // Recent system activity notifications
  const recentActivity = [
    { text: "Rahul Sharma completed room check-in.", time: "10 mins ago", type: "check-in" },
    { text: "AI Receptionist generated new lead Sneha Reddy.", time: "25 mins ago", type: "lead" },
    { text: "Amit Patel paid reservation deposit of ₹27,996.", time: "2 hours ago", type: "payment" },
    { text: "New booking confirmed for Rajesh Iyer.", time: "4 hours ago", type: "booking" }
  ];

  return (
    <div className="space-y-8 text-slate-700">
      
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">
            Good morning, {activeTenant.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Here's the current operational overview for {activeTenant.settings.city}, {activeTenant.settings.country}.
          </p>
        </div>
        
        <Link 
          to="/app/bookings" 
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#3872fa] hover:bg-[#1e5ade] text-white font-bold text-xs shadow-md shadow-blue-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* KPI Cards Grid - Matching User Mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Today's Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Today's Revenue</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#22c55e] bg-emerald-50 flex items-center gap-0.5">
              14.5%
              <TrendingUp className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900 font-outfit">
              {currencySymbol}{Math.round(todayRevenue).toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">vs yesterday: {currencySymbol}{Math.round(todayRevenue * 0.86).toLocaleString()}</p>
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Occupancy</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#22c55e] bg-emerald-50 flex items-center gap-0.5">
              3.2%
              <TrendingUp className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900 font-outfit">
              {occupancyRate}%
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">{occupiedCount} of {totalRoomsCount} rooms active</p>
          </div>
        </div>

        {/* Check-ins */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Check-ins</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#f97316] bg-orange-55/70 flex items-center gap-0.5">
              12.0%
              <TrendingUp className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900 font-outfit">
              {checkinsTodayCount}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">Arrivals scheduled today</p>
          </div>
        </div>

        {/* Check-outs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Check-outs</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#f97316] bg-orange-55/70 flex items-center gap-0.5">
              8.3%
              <TrendingUp className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900 font-outfit">
              {checkoutsTodayCount}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">Departures scheduled today</p>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Bookings</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#22c55e] bg-emerald-50 flex items-center gap-0.5">
              25.2%
              <TrendingUp className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900 font-outfit">
              {totalActiveBookings}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">Confirmed reservations</p>
          </div>
        </div>

      </div>

      {/* Main Charts: Customer Growth Summary & Sales Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Customer Growth Summary Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Customer Growth Summary</h2>
              <span className="text-xs text-slate-400 font-semibold">Revealing risk and growth in investments.</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 shadow-sm cursor-default">
              <span>2026</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="relative h-60 w-full flex flex-col justify-end pt-4">
            {/* Grid Line lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
              <div className="w-full border-t border-slate-100 flex items-center"><span className="text-[8px] text-slate-400 -translate-y-2">10000</span></div>
              <div className="w-full border-t border-slate-100 flex items-center"><span className="text-[8px] text-slate-400 -translate-y-2">7500</span></div>
              <div className="w-full border-t border-slate-100 flex items-center"><span className="text-[8px] text-slate-400 -translate-y-2">5000</span></div>
              <div className="w-full border-t border-slate-100 flex items-center"><span className="text-[8px] text-slate-400 -translate-y-2">2500</span></div>
              <div className="w-full border-t border-slate-100 flex items-center"><span className="text-[8px] text-slate-400 -translate-y-2">0</span></div>
            </div>

            {/* Bars Column layout */}
            <div className="flex justify-between items-end h-full z-10 pl-8 pb-6">
              {growthValues.map((val, idx) => {
                const heightPercent = `${(val / maxGrowthValue) * 80}%`;
                // Highlight August month as green/teal like mockup, others blue
                const barColor = growthMonths[idx] === 'Aug' 
                  ? 'bg-[#10b981] hover:bg-[#059669]' 
                  : 'bg-[#3872fa] hover:bg-[#1e5ade]';
                
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 space-y-2 max-w-[28px] group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold pointer-events-none whitespace-nowrap z-50">
                      {val.toLocaleString()}
                    </div>
                    {/* Bar Pillar */}
                    <div 
                      style={{ height: heightPercent }} 
                      className={`w-3.5 rounded-full transition-all duration-350 ${barColor}`}
                    ></div>
                    {/* Label */}
                    <span className="text-[10px] font-bold text-slate-400">{growthMonths[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sales Analytics Card (Donut Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Sales Analytics</h2>
              <span className="text-[10px] text-slate-400 font-semibold">Active occupancy segment metrics</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 shadow-sm cursor-default">
              <span>Daily</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="w-36 h-36 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                {/* Segment 1: Sales / Direct (60%) */}
                <circle 
                  cx="72" 
                  cy="72" 
                  r="52" 
                  stroke="#93c5fd" 
                  strokeWidth="11" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * 0.40}
                  strokeLinecap="round"
                />
                {/* Segment 2: Distribution (25%) */}
                <circle 
                  cx="72" 
                  cy="72" 
                  r="52" 
                  stroke="#3b82f6" 
                  strokeWidth="11" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * 0.75}
                  transform="rotate(216 72 72)"
                  strokeLinecap="round"
                />
                {/* Segment 3: Return (15%) */}
                <circle 
                  cx="72" 
                  cy="72" 
                  r="52" 
                  stroke="#86efac" 
                  strokeWidth="11" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * 0.85}
                  transform="rotate(306 72 72)"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sales</span>
                <span className="text-2xl font-black text-slate-900 font-outfit">1000</span>
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="w-full mt-6 border-t border-slate-100 pt-4 text-xs font-semibold space-y-2 text-slate-650">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd] inline-block"></span>
                  Sales
                </span>
                <span className="font-bold text-slate-800">60.00%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block"></span>
                  Distribution
                </span>
                <span className="font-bold text-slate-800">25.00%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#86efac] inline-block"></span>
                  Return
                </span>
                <span className="font-bold text-slate-800">15.00%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bookings Overview & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bookings overview */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Upcoming Reservations</h2>
              <span className="text-xs text-slate-400 font-semibold">Upcoming arrivals ledger</span>
            </div>
            <Link to="/app/bookings" className="text-xs text-[#3872fa] font-bold hover:underline">View all</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 font-bold">Guest</th>
                  <th className="py-2.5 font-bold">Room Category</th>
                  <th className="py-2.5 font-bold">Check-in</th>
                  <th className="py-2.5 font-bold">Check-out</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-850">
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-900">{b.guestName}</td>
                    <td className="py-3 text-slate-500 font-medium">{b.roomType}</td>
                    <td className="py-3 font-medium">{b.checkIn}</td>
                    <td className="py-3 font-medium">{b.checkOut}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        b.status === 'checked-in' ? 'bg-emerald-50 text-emerald-700' :
                        b.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                        b.status === 'checked-out' ? 'bg-slate-100 text-slate-700' :
                        b.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 font-extrabold text-right text-slate-900">{currencySymbol}{b.amountPaid.toLocaleString()}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400 font-semibold italic">
                      No reservations found. Open public site to book!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Recent Activity</h2>
            <span className="text-xs text-slate-400 font-semibold">Live platform events</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex gap-3 text-xs items-start">
                <span className="mt-0.5 text-[#3872fa] shrink-0">
                  <CircleDot className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-800 leading-snug">{act.text}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
