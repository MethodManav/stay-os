import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  IndianRupee, 
  DollarSign, 
  CalendarRange, 
  UserCheck, 
  UserMinus, 
  Percent,
  Plus,
  TrendingUp,
  CircleDot
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardTab: React.FC = () => {
  const { activeTenant } = useApp();
  const [revenueFilter, setRevenueFilter] = useState<'today' | '7d' | '30d'>('7d');

  // Dynamic statistics calculated from bookings list
  const currencySymbol = activeTenant.settings.currency === 'INR' ? '₹' : '$';
  
  // Bookings list
  const bookings = activeTenant.bookings || [];
  
  // Today's bookings and revenue calculations
  const todayStr = "2026-08-18"; // Set static mock today coordinate to match metadata date
  
  // todayBookings calculation removed to fix unused declaration warning
  
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

  // Revenue chart dataset mapping
  const revenueData = {
    today: [12000, 15000, 18500, 24000, 31000, todayRevenue || 42000],
    '7d': [28000, 34000, 41000, 32000, 48000, 39000, 52000],
    '30d': [120000, 145000, 110000, 175000, 195000, 245000, 285000]
  };

  const chartLabels = {
    today: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
    '7d': ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    '30d': ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"]
  };

  const selectedDataset = revenueData[revenueFilter];
  const selectedLabels = chartLabels[revenueFilter];

  // Helper to generate SVG polyline path
  const generateSvgPath = (data: number[]) => {
    const width = 500;
    const height = 150;
    const maxVal = Math.max(...data) * 1.15;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const y = height - (val / maxVal) * (height - 30) - 15;
      return `${x},${y}`;
    }).join(' ');
    return points;
  };

  const generateSvgArea = (data: number[]) => {
    const height = 150;
    const path = generateSvgPath(data);
    if (!path) return '';
    const firstPoint = path.split(' ')[0];
    const lastPoint = path.split(' ').pop();
    const firstX = firstPoint.split(',')[0];
    const lastX = lastPoint?.split(',')[0];
    return `${firstPoint} ${path} ${lastX},${height - 10} ${firstX},${height - 10}`;
  };

  // Recent system activity notifications
  const recentActivity = [
    { text: "Rahul Sharma completed room check-in.", time: "10 mins ago", type: "check-in" },
    { text: "AI Receptionist generated new lead Sneha Reddy.", time: "25 mins ago", type: "lead" },
    { text: "Amit Patel paid reservation deposit of ₹27,996.", time: "2 hours ago", type: "payment" },
    { text: "New booking confirmed for Rajesh Iyer.", time: "4 hours ago", type: "booking" }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1a1a1e] font-outfit">
            Good morning, {activeTenant.name}
          </h1>
          <p className="text-xs text-[#7a7974] mt-1 font-semibold">
            Here's the current operational overview for {activeTenant.settings.city}, {activeTenant.settings.country}.
          </p>
        </div>
        
        <Link 
          to="/app/bookings" 
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#1b4332] text-white hover:bg-[#143324] font-bold text-xs shadow-md shadow-[#1b4332]/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Today's Revenue */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#e8efe9] rounded-bl-full -z-0 opacity-40" />
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] uppercase font-bold text-[#7a7974] tracking-wider">Today's Revenue</span>
            <span className="p-1.5 rounded-lg bg-[#e8efe9] text-[#1b4332]">
              {activeTenant.settings.currency === 'INR' ? <IndianRupee className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
            </span>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-2xl font-extrabold text-[#1a1a1e] font-outfit">
              {currencySymbol}{Math.round(todayRevenue).toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.5% vs yesterday
            </span>
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#e8efe9] rounded-bl-full -z-0 opacity-40" />
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] uppercase font-bold text-[#7a7974] tracking-wider">Occupancy</span>
            <span className="p-1.5 rounded-lg bg-[#e8efe9] text-[#1b4332]">
              <Percent className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-2xl font-extrabold text-[#1a1a1e] font-outfit">
              {occupancyRate}%
            </h3>
            <span className="text-[10px] text-[#7a7974] font-semibold block">
              {occupiedCount} of {totalRoomsCount} rooms active
            </span>
          </div>
        </div>

        {/* Check-ins */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#e8efe9] rounded-bl-full -z-0 opacity-40" />
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] uppercase font-bold text-[#7a7974] tracking-wider">Check-ins</span>
            <span className="p-1.5 rounded-lg bg-[#e8efe9] text-[#1b4332]">
              <UserCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-2xl font-extrabold text-[#1a1a1e] font-outfit">
              {checkinsTodayCount}
            </h3>
            <span className="text-[10px] text-[#7a7974] font-semibold block">
              Arrivals scheduled today
            </span>
          </div>
        </div>

        {/* Check-outs */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#e8efe9] rounded-bl-full -z-0 opacity-40" />
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] uppercase font-bold text-[#7a7974] tracking-wider">Check-outs</span>
            <span className="p-1.5 rounded-lg bg-[#e8efe9] text-[#1b4332]">
              <UserMinus className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-2xl font-extrabold text-[#1a1a1e] font-outfit">
              {checkoutsTodayCount}
            </h3>
            <span className="text-[10px] text-[#7a7974] font-semibold block">
              Departures scheduled today
            </span>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#e8efe9] rounded-bl-full -z-0 opacity-40" />
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] uppercase font-bold text-[#7a7974] tracking-wider">Active Bookings</span>
            <span className="p-1.5 rounded-lg bg-[#e8efe9] text-[#1b4332]">
              <CalendarRange className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-2xl font-extrabold text-[#1a1a1e] font-outfit">
              {totalActiveBookings}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold block">
              Confirmed reservations
            </span>
          </div>
        </div>

      </div>

      {/* Main Charts & Booking details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue SVG Chart Card */}
        <div className="lg:col-span-2 bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide">Revenue Overview</h2>
              <span className="text-xs text-[#7a7974] font-semibold">Track your digital incoming revenue flows</span>
            </div>
            
            <div className="flex border border-[#e2e1d7] rounded-lg p-0.5 bg-[#f4f3ed]">
              {(['today', '7d', '30d'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setRevenueFilter(filter)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    revenueFilter === filter ? 'bg-white text-[#1b4332] shadow-sm' : 'text-[#7a7974] hover:text-[#1a1a1e]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Custom Area Chart */}
          <div className="w-full h-44 relative bg-[#fcfbf9] border border-dashed border-[#e2e1d7] rounded-xl flex items-end py-1">
            <svg 
              viewBox="0 0 500 150" 
              className="w-full h-full text-[#1b4332]"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1b4332" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1b4332" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="#e2e1d7" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#e2e1d7" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="#e2e1d7" strokeWidth="0.5" strokeDasharray="3" />
              
              {/* Fill Area */}
              <polygon points={generateSvgArea(selectedDataset)} fill="url(#gradient)" />
              {/* Line */}
              <polyline 
                fill="none" 
                stroke="#1b4332" 
                strokeWidth="2.5" 
                points={generateSvgPath(selectedDataset)} 
              />
              
              {/* Circles on dots */}
              {selectedDataset.map((val, idx) => {
                const width = 500;
                const height = 150;
                const maxVal = Math.max(...selectedDataset) * 1.15;
                const x = (idx / (selectedDataset.length - 1)) * (width - 40) + 20;
                const y = height - (val / maxVal) * (height - 30) - 15;
                return (
                  <circle 
                    key={idx} 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="#1b4332" 
                    stroke="white" 
                    strokeWidth="1" 
                  />
                );
              })}
            </svg>

            {/* Labels overlay */}
            <div className="absolute bottom-1.5 left-2 right-2 flex justify-between px-3 text-[9px] text-[#7a7974] font-bold uppercase tracking-wider">
              {selectedLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Occupancy Radial Card */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-[#e2e1d7] pb-3">
            <h2 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide">Capacity Allocation</h2>
            <span className="text-[10px] text-[#7a7974] font-semibold">Active occupancy percentage</span>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="w-28 h-28 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle 
                  cx="56" 
                  cy="56" 
                  r="45" 
                  stroke="#e2e1d7" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="45" 
                  stroke="#1b4332" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - occupancyRate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-[#1b4332] font-outfit">{occupancyRate}%</span>
                <span className="text-[9px] text-[#7a7974] font-bold uppercase tracking-widest mt-0.5">Occupied</span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 mt-6 border-t border-[#e2e1d7] pt-4 text-center">
              <div>
                <span className="block text-xs font-extrabold text-[#1a1a1e]">{occupiedCount} Rooms</span>
                <span className="text-[9px] text-[#7a7974] uppercase tracking-wider font-semibold">Occupied</span>
              </div>
              <div>
                <span className="block text-xs font-extrabold text-[#1a1a1e]">{totalRoomsCount - occupiedCount} Rooms</span>
                <span className="text-[9px] text-[#7a7974] uppercase tracking-wider font-semibold">Available</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bookings Overview & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bookings overview */}
        <div className="lg:col-span-2 bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#e2e1d7] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide">Upcoming Reservations</h2>
              <span className="text-xs text-[#7a7974] font-semibold">Upcoming arrivals ledger</span>
            </div>
            <Link to="/app/bookings" className="text-xs text-[#1b4332] font-bold hover:underline">View all</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#7a7974] border-b border-[#e2e1d7] uppercase tracking-wider">
                  <th className="py-2.5 font-bold">Guest</th>
                  <th className="py-2.5 font-bold">Room Category</th>
                  <th className="py-2.5 font-bold">Check-in</th>
                  <th className="py-2.5 font-bold">Check-out</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e1d7]/60 text-[#1a1a1e]">
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id} className="hover:bg-[#f4f3ed]/40">
                    <td className="py-3 font-bold">{b.guestName}</td>
                    <td className="py-3 text-[#7a7974] font-medium">{b.roomType}</td>
                    <td className="py-3 font-medium">{b.checkIn}</td>
                    <td className="py-3 font-medium">{b.checkOut}</td>
                    <td className="py-3">
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
                    <td className="py-3 font-extrabold text-right">{currencySymbol}{b.amountPaid.toLocaleString()}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-[#7a7974] font-semibold italic">
                      No reservations found. Open public site to book!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[#e2e1d7] pb-3">
            <h2 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide">Recent Activity</h2>
            <span className="text-xs text-[#7a7974] font-semibold">Live platform events</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex gap-3 text-xs items-start">
                <span className="mt-0.5 text-[#1b4332] shrink-0">
                  <CircleDot className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="font-semibold text-[#1a1a1e] leading-snug">{act.text}</p>
                  <span className="text-[10px] text-[#7a7974] mt-0.5 block font-semibold">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
