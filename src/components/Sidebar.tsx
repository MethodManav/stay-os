import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, CalendarRange, Settings2 } from 'lucide-react';
import { getHotelConfig, getConversations, getBookings } from '../mockData';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const hotel = getHotelConfig();

  // Compute metrics for quick stats in sidebar
  const conversations = getConversations();
  const bookings = getBookings();
  
  const unreadCount = conversations.filter(c => c.unread).length;
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <aside className="w-64 bg-[#1b4332] text-white min-h-screen flex flex-col justify-between py-6 px-4 shrink-0 shadow-md">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Logo & Hotel Title */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-[#1b4332] font-bold text-base shadow-sm">
            ⚡
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-none">stayos</h2>
            <span className="text-xs text-[#a3c2b2] font-semibold mt-1 block">{hotel.name || 'Grand Hotel'}</span>
          </div>
        </div>

        {/* Overview / Stats Indicators */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#7ca08e] uppercase tracking-widest px-2">overview</span>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-3.5 py-2 rounded-lg text-sm text-[#c8dfd4] bg-[#143324]/50 border border-[#234e3a]">
              <span>active bookings</span>
              <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded text-xs">{activeBookings}</span>
            </div>
            <div className="flex justify-between items-center px-3.5 py-2 rounded-lg text-sm text-[#c8dfd4] bg-[#143324]/50 border border-[#234e3a]">
              <span>unread messages</span>
              <span className="font-bold text-white bg-[#ec4899] px-2 py-0.5 rounded text-xs">{unreadCount}</span>
            </div>
          </div>
        </div>

        {/* Main Menu Nav */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#7ca08e] uppercase tracking-widest px-2">main menu</span>
          
          <NavLink
            to="/dashboard/inbox"
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                isActive
                  ? 'bg-white text-[#1b4332] border-transparent font-bold shadow-sm'
                  : 'text-[#a3c2b2] border-transparent hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4.5 h-4.5" />
              <span>inbox</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-[#ec4899] text-white rounded px-2 py-0.5 text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/dashboard/bookings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                isActive
                  ? 'bg-white text-[#1b4332] border-transparent font-bold shadow-sm'
                  : 'text-[#a3c2b2] border-transparent hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <CalendarRange className="w-4.5 h-4.5" />
            <span>bookings</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                isActive
                  ? 'bg-white text-[#1b4332] border-transparent font-bold shadow-sm'
                  : 'text-[#a3c2b2] border-transparent hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Settings2 className="w-4.5 h-4.5" />
            <span>settings</span>
          </NavLink>
        </div>
      </div>

      {/* Bottom Section: WhatsApp Status Banner */}
      <div className="space-y-4">
        {/* Connection Widget */}
        <div className="p-3.5 bg-[#143324]/50 border border-[#234e3a] rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full blur-xl" />
          <div className="flex items-start gap-2.5 relative">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-white text-[#1b4332] font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              wa
            </div>
            <div>
              <span className="block text-xs text-white font-bold uppercase tracking-wider">whatsapp live</span>
              <span className="block text-xs text-[#a3c2b2] leading-tight mt-1 font-semibold">
                {hotel.connectedWhatsapp || 'not connected'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-[#234e3a]">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-[#a3c2b2] font-semibold">operational</span>
          </div>
        </div>

        {/* User Actions */}
        <div className="border-t border-[#234e3a] pt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/10 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              M
            </div>
            <div className="text-xs">
              <span className="block font-bold text-white">owner account</span>
              <span className="block text-[#a3c2b2] font-semibold mt-0.5">online</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-[#a3c2b2] hover:text-red-400 cursor-pointer font-bold transition-colors"
          >
            logout
          </button>
        </div>
      </div>
    </aside>
  );
};
