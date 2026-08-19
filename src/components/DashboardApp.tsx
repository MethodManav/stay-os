import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Bed, 
  Users, 
  Globe, 
  Bot, 
  CreditCard, 
  BarChart3, 
  UserSquare2, 
  Settings,
  Bell,
  ChevronDown,
  Building,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { tenants, activeTenant, currentUser, switchTenant, handleLogout } = useApp();
  const navigate = useNavigate();
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, text: "New booking B-2004 received from Rajesh Iyer", time: "5m ago" },
    { id: 2, text: "AI conversation escalated by John Doe", time: "1h ago" },
    { id: 3, text: "Payment of ₹27,996 confirmed from Amit Patel", time: "2h ago" }
  ];

  const handleSwitch = (id: string) => {
    switchTenant(id);
    setTenantMenuOpen(false);
    navigate('/app/dashboard');
  };

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/bookings', label: 'Bookings', icon: Calendar },
    { to: '/app/rooms', label: 'Rooms', icon: Bed },
    { to: '/app/customers', label: 'Guests CRM', icon: Users },
    { to: '/app/website', label: 'Website Builder', icon: Globe },
    { to: '/app/ai', label: 'AI Receptionist', icon: Bot },
    { to: '/app/payments', label: 'Payments', icon: CreditCard },
    { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/app/team', label: 'Team', icon: UserSquare2 },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white text-slate-600 shrink-0 border-r border-slate-200 z-30">
        
        {/* Top Header Logo */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
          {/* Logo capsule style */}
          <div className="flex gap-1 items-center">
            <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#3872fa] to-[#4f46e5] rotate-[25deg]"></div>
            <div className="w-2.5 h-7.5 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#7c3aed] rotate-[25deg] -translate-y-0.5"></div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">stayos</h1>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1 block">manager portal</span>
          </div>
        </div>

        {/* Multi-Tenant Switcher */}
        <div className="p-4 border-b border-slate-100 relative">
          <button
            onClick={() => setTenantMenuOpen(!tenantMenuOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-250 hover:bg-slate-100 text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-left overflow-hidden">
              <Building className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-sm font-bold text-slate-800 truncate">{activeTenant?.name || 'Grand Hotel'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
          
          {tenantMenuOpen && (
            <div className="absolute left-4 right-4 top-16 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 max-h-48 overflow-y-auto">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest px-3 py-1 mb-1">Switch Hotel</span>
              {tenants.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSwitch(t.id)}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex justify-between items-center ${
                    activeTenant.id === t.id ? 'bg-blue-50/50 text-[#3872fa] font-bold' : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  {activeTenant.id === t.id && <span className="w-1.5 h-1.5 rounded-full bg-[#3872fa]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    isActive
                      ? 'bg-blue-50 text-[#3872fa] border-blue-100/30 font-bold shadow-sm shadow-blue-500/5'
                      : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Profile Banner */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3872fa] border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
              {currentUser?.name[0] || 'M'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-slate-800 truncate">{currentUser?.name || 'Owner'}</span>
              <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Owner</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200/60 flex items-center justify-between px-6 md:px-8 shrink-0 z-20">
          
          {/* Left info: Active tenant path */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Organizations</span>
              <span>/</span>
              <span className="text-[#3872fa] font-extrabold">{activeTenant?.name}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            
            {/* Live website shortcut */}
            <a 
              href={`/site/${activeTenant?.subdomain}`} 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-[#3872fa] text-xs font-bold hover:bg-[#3872fa] hover:text-white transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </a>

            {/* Notification bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl border border-slate-250 hover:bg-slate-50 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-1.5 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#3872fa] uppercase tracking-wider">Notifications</span>
                    <button className="text-[10px] text-slate-400 hover:underline">Clear all</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {notifications.map(n => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 text-xs">
                        <p className="text-slate-800 font-semibold leading-normal">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User profile avatar dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3872fa] border border-blue-100 flex items-center justify-center font-bold text-sm">
                  {currentUser?.name[0] || 'M'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-450 hidden md:block" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <span className="block font-bold text-slate-800 truncate">{currentUser?.name}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{currentUser?.email}</span>
                  </div>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); navigate('/app/settings'); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 font-semibold text-slate-800 cursor-pointer"
                  >
                    My Settings
                  </button>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); navigate('/admin'); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 font-semibold text-indigo-650 flex items-center justify-between cursor-pointer border-t border-b border-slate-100/80"
                  >
                    <span>SaaS Admin Portal</span>
                    <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100">Super</span>
                  </button>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 font-bold cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>
 
        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden flex justify-start" onClick={() => setMobileNavOpen(false)}>
            <div 
              className="w-64 bg-white text-slate-700 flex flex-col h-full shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1 items-center">
                    <div className="w-2.5 h-5 rounded-full bg-gradient-to-b from-[#3872fa] to-[#4f46e5] rotate-[25deg]"></div>
                    <div className="w-2.5 h-6.5 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#7c3aed] rotate-[25deg] -translate-y-0.5"></div>
                  </div>
                  <span className="text-base font-extrabold text-slate-900">stayos</span>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hotel Profile</span>
                <span className="block text-sm font-bold text-slate-800">{activeTenant?.name}</span>
              </div>

              <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isActive ? 'bg-blue-50 text-[#3872fa]' : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="text-xs font-bold text-slate-800">{currentUser?.name}</span>
                <button onClick={onLogout} className="text-xs text-slate-400 hover:text-red-500 font-bold">Logout</button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
export default DashboardLayout;
