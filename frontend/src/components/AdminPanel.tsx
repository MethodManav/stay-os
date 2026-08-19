import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import type { Tenant, Room, SaaSUser } from '../db';
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  Bot, 
  Terminal, 
  Plus, 
  Search, 
  ArrowLeft, 
  Trash2, 
  ExternalLink, 
  Database, 
  Activity, 
  Wifi, 
  UserPlus, 
  Sparkles, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  Calendar,
  MessageSquare,
  Sliders,
  Play
} from 'lucide-react';

interface SystemLog {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'AI' | 'WEBHOOK' | 'GATEWAY' | 'ERROR';
  message: string;
}

export const AdminPanel: React.FC = () => {
  const { tenants, updateAllTenants, handleLogout, resetAll } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'hotels' | 'users' | 'ai-simulator' | 'logs'>('overview');
  
  // Search & Filtering
  const [hotelSearch, setHotelSearch] = useState('');
  
  // Logs State
  const [logs, setLogs] = useState<SystemLog[]>([
    { id: '1', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), source: 'SYSTEM', message: 'StayOS Platform Bootstrapped successfully.' },
    { id: '2', timestamp: new Date(Date.now() - 3000000).toLocaleTimeString(), source: 'SYSTEM', message: 'Database connection pools initialized (MongoDB Mock DB).' },
    { id: '3', timestamp: new Date(Date.now() - 2400000).toLocaleTimeString(), source: 'GATEWAY', message: 'WhatsApp Live Webhook Channel listening on port 5173/api/webhooks.' },
    { id: '4', timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(), source: 'AI', message: 'Loaded default system instruction prompt template (v2.4).' },
    { id: '5', timestamp: new Date(Date.now() - 600000).toLocaleTimeString(), source: 'SYSTEM', message: 'Tenant cache refreshed. 1 active tenant synced.' }
  ]);

  // Modal States
  const [addHotelModalOpen, setAddHotelModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  
  // Add Hotel Form State
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelType, setNewHotelType] = useState('Resort');
  const [newHotelEmail, setNewHotelEmail] = useState('');
  const [newHotelPhone, setNewHotelPhone] = useState('');
  const [newHotelPrice, setNewHotelPrice] = useState('2999');
  const [newHotelTemplate, setNewHotelTemplate] = useState<'luxury' | 'modern' | 'boutique' | 'minimal'>('modern');

  // Add User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('admin');
  const [newUserTenantId, setNewUserTenantId] = useState('');

  // AI Configuration State
  const [aiModel, setAiModel] = useState('gpt-4o-mini');
  const [aiTone, setAiTone] = useState('luxury');
  const [aiTemp, setAiTemp] = useState(0.4);
  const [webhookDelay, setWebhookDelay] = useState(1); // in seconds
  
  // WhatsApp Simulator State
  const [simTenantId, setSimTenantId] = useState(tenants[0]?.id || '');
  const [simGuestName, setSimGuestName] = useState('Priya Patel');
  const [simGuestPhone, setSimGuestPhone] = useState('+91 90123 45678');
  const [simMessage, setSimMessage] = useState('Hello! I would like to know the price for a Deluxe room tonight and if wifi is included.');
  const [isSimulating, setIsSimulating] = useState(false);

  // Set default simulation tenant if tenants load
  useEffect(() => {
    if (tenants.length > 0 && !simTenantId) {
      setSimTenantId(tenants[0].id);
    }
  }, [tenants, simTenantId]);

  // Helper to add system log
  const addLog = (source: SystemLog['source'], message: string) => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      source,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // cap at 100 logs
  };

  // Metrics Computations
  const totalRevenue = tenants.reduce((sum, t) => {
    return sum + (t.bookings || []).reduce((bSum, b) => b.status !== 'cancelled' ? bSum + b.amountPaid : bSum, 0);
  }, 0);

  const totalBookingsCount = tenants.reduce((sum, t) => sum + (t.bookings || []).length, 0);
  const totalGuestsCount = tenants.reduce((sum, t) => sum + (t.guests || []).length, 0);
  
  const totalMessagesCount = tenants.reduce((sum, t) => {
    return sum + (t.conversations || []).reduce((cSum, c) => cSum + (c.messages || []).length, 0);
  }, 0);

  // Simulated Global Users List (stored in localStorage under stayos_v1_all_users or populated from tenants)
  const [platformUsers, setPlatformUsers] = useState<SaaSUser[]>([]);

  useEffect(() => {
    // Sync platform users
    const rawUser = localStorage.getItem("stayos_v1_user");
    const parsedUser = rawUser ? JSON.parse(rawUser) : null;
    
    // Seed default admin users list if not present
    const defaultUsersList: SaaSUser[] = [
      {
        id: "usr-1",
        name: parsedUser?.name || "Manav",
        email: parsedUser?.email || "manav@stayos.com",
        tenants: tenants.map(t => ({ tenantId: t.id, role: 'owner' }))
      },
      {
        id: "usr-2",
        name: "Sarah Jenkins",
        email: "sarah@stayos.com",
        tenants: [{ tenantId: tenants[0]?.id || "tenant-azure-haven", role: "admin" }]
      },
      {
        id: "usr-3",
        name: "Vikram Mehta",
        email: "vikram@resortowner.com",
        tenants: []
      }
    ];

    const storedUsers = localStorage.getItem("stayos_v1_platform_users");
    if (storedUsers) {
      setPlatformUsers(JSON.parse(storedUsers));
    } else {
      localStorage.setItem("stayos_v1_platform_users", JSON.stringify(defaultUsersList));
      setPlatformUsers(defaultUsersList);
    }
  }, [tenants]);

  const savePlatformUsers = (updatedUsers: SaaSUser[]) => {
    localStorage.setItem("stayos_v1_platform_users", JSON.stringify(updatedUsers));
    setPlatformUsers(updatedUsers);
  };

  // Add Hotel Handler
  const handleAddHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName) return;

    const subdomain = newHotelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newId = `tenant-${subdomain}-${Date.now()}`;

    // Seed mock rooms
    const basePriceNum = parseFloat(newHotelPrice) || 2999;
    const defaultRooms: Room[] = [
      {
        id: `rm-1-${Date.now()}`,
        name: "Standard Comfort Room",
        type: "Standard Room",
        maxGuests: 2,
        basePrice: basePriceNum,
        count: 10,
        status: "available",
        amenities: ["Wi-Fi", "Air Conditioning", "Flat TV", "Coffee maker"],
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85"
      },
      {
        id: `rm-2-${Date.now()}`,
        name: "Premium Deluxe Suite",
        type: "Deluxe Suite",
        maxGuests: 4,
        basePrice: Math.round(basePriceNum * 1.8),
        count: 5,
        status: "available",
        amenities: ["Ocean/Mountain View", "King Bed", "Minibar", "Bathtub", "High-speed Wi-Fi"],
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=85"
      }
    ];

    const newTenant: Tenant = {
      id: newId,
      subdomain,
      name: newHotelName,
      branding: {
        primaryColor: "#3b82f6", // Indigo/Blue default
        secondaryColor: "#1d4ed8",
        font: "sans",
        buttonStyle: "rounded-md"
      },
      settings: {
        address: "101 Grand Boulevard, City Center",
        city: "Mumbai",
        country: "India",
        currency: "INR",
        timezone: "IST (UTC+5:30)",
        checkInTime: "12:00",
        checkOutTime: "10:00",
        wifiPassword: `${subdomain}_wifi123`,
        breakfastPolicy: "paid",
        description: `Experience luxury hospitality at ${newHotelName}. Equipped with state-of-the-art room features and an automated WhatsApp AI Receptionist.`,
        cancellationPolicy: "Flexible up to 24 hours prior to arrival.",
        phone: newHotelPhone || "+91 22 9999 8888",
        email: newHotelEmail || `info@${subdomain}.com`
      },
      rooms: defaultRooms,
      bookings: [],
      guests: [],
      conversations: [
        {
          id: `c-init-${Date.now()}`,
          guestName: "Guest Support Receptionist",
          guestPhone: "+91 99999 88888",
          status: "resolved",
          unread: false,
          createdAt: new Date().toISOString(),
          messages: [
            { id: "m-init-1", sender: "ai", text: `Welcome to ${newHotelName}'s AI WhatsApp Receptionist. Ask me about our rooms, amenities, or make bookings.`, timestamp: "Just now" }
          ]
        }
      ],
      team: [
        { id: `tm-o-${Date.now()}`, name: "SaaS Platform Owner", email: newHotelEmail || `admin@${subdomain}.com`, role: "owner" }
      ],
      website: {
        template: newHotelTemplate,
        sections: [
          {
            id: "hero",
            type: "hero",
            title: "Hero Banner",
            visible: true,
            content: {
              headline: `Welcome to ${newHotelName}`,
              subheadline: `A boutique ${newHotelType} offering top-tier services and premium accommodation options.`,
              ctaText: "Explore Rooms",
              bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85"
            }
          },
          {
            id: "about",
            type: "about",
            title: "About Us",
            visible: true,
            content: {
              text: `Welcome to ${newHotelName}. Nestled in Mumbai, we specialize in high-comfort hospitality. Contact us on WhatsApp for live booking.`
            }
          },
          {
            id: "rooms",
            type: "rooms",
            title: "Our Rooms",
            visible: true,
            content: { subheading: "Premium luxury rooms equipped with standard services." }
          },
          {
            id: "amenities",
            type: "amenities",
            title: "Premium Amenities",
            visible: true,
            content: { list: "High speed Wi-Fi, Room Service, Swimming Pool, Parking" }
          },
          {
            id: "footer",
            type: "footer",
            title: "Footer details",
            visible: true,
            content: { copyright: `© 2026 ${newHotelName}. Powered by StayOS.` }
          }
        ]
      }
    };

    const updated = [...tenants, newTenant];
    updateAllTenants(updated);
    addLog('SYSTEM', `Manually registered new hotel tenant: ${newHotelName} (${subdomain}.stayos.com)`);

    // Reset Form
    setNewHotelName('');
    setNewHotelEmail('');
    setNewHotelPhone('');
    setNewHotelPrice('2999');
    setAddHotelModalOpen(false);
  };

  // Delete Hotel Handler
  const handleDeleteHotel = (tenantId: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete ${name}? All rooms, bookings, and chats will be permanently lost.`)) {
      const updated = tenants.filter(t => t.id !== tenantId);
      updateAllTenants(updated);
      addLog('SYSTEM', `Deleted hotel tenant profile: ${name} (ID: ${tenantId})`);
    }
  };

  // Change Tier Handler
  const handleToggleTier = (tenantId: string) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        // We'll store a mock subscription status or billing tier on the tenant settings
        const isPremium = t.settings.breakfastPolicy === 'included'; // map tier mock
        return {
          ...t,
          settings: {
            ...t.settings,
            // Toggle breakfastPolicy as tier representation or billing flag
            breakfastPolicy: isPremium ? 'none' as const : 'included' as const
          }
        };
      }
      return t;
    });
    updateAllTenants(updated);
    addLog('SYSTEM', `Updated Subscription Plan for hotel ID: ${tenantId}`);
  };

  // Add User Handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser: SaaSUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      tenants: newUserTenantId ? [{ tenantId: newUserTenantId, role: newUserRole }] : []
    };

    savePlatformUsers([...platformUsers, newUser]);
    addLog('SYSTEM', `Created new platform user account: ${newUserName} (${newUserEmail})`);
    
    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserTenantId('');
    setAddUserModalOpen(false);
  };

  // Delete User Handler
  const handleDeleteUser = (userId: string, email: string) => {
    if (confirm(`Are you sure you want to revoke platform access for ${email}?`)) {
      const updated = platformUsers.filter(u => u.id !== userId);
      savePlatformUsers(updated);
      addLog('SYSTEM', `Revoked access for user: ${email}`);
    }
  };

  // Reset Platform
  const handleResetPlatform = () => {
    if (confirm("This will purge all local changes and reset the platform database to seed settings. Proceed?")) {
      resetAll();
      addLog('SYSTEM', 'Platform data reset to default seed values.');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // WhatsApp Webhook Simulator Action
  const handleTriggerSimulation = () => {
    if (!simTenantId || !simMessage) return;

    const selectedTenant = tenants.find(t => t.id === simTenantId);
    if (!selectedTenant) return;

    setIsSimulating(true);
    addLog('WEBHOOK', `Inbound WhatsApp webhook received from ${simGuestName} (${simGuestPhone}) pointing to recipient hotel domain: "${selectedTenant.subdomain}"`);

    // Log the message text
    addLog('WEBHOOK', `Message contents: "${simMessage}"`);

    setTimeout(() => {
      // Step 1: Update the Tenant state in LocalStorage (Add the guest message)
      const now = new Date();
      const timestampString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Find if conversation exists, or create a new one
      let updatedConversations = [...selectedTenant.conversations];
      let conversation = updatedConversations.find(c => c.guestPhone === simGuestPhone);

      const guestMessageObj = {
        id: `msg-sim-${Date.now()}`,
        sender: 'guest' as const,
        text: simMessage,
        timestamp: timestampString
      };

      if (!conversation) {
        conversation = {
          id: `c-sim-${Date.now()}`,
          guestName: simGuestName,
          guestPhone: simGuestPhone,
          unread: true,
          status: 'active' as const,
          createdAt: now.toISOString(),
          messages: [guestMessageObj]
        };
        updatedConversations.unshift(conversation);
      } else {
        conversation.messages = [...conversation.messages, guestMessageObj];
        conversation.unread = true;
        conversation.status = 'active';
      }

      // Step 2: Formulate AI Reply in background
      addLog('AI', `Processing query through OpenAI ${aiModel} using temperature ${aiTemp} (Personality Tone: ${aiTone})...`);

      // Simple keyword matching for interactive response
      let replyText = '';
      const textLower = simMessage.toLowerCase();
      if (textLower.includes('wifi') || textLower.includes('wi-fi') || textLower.includes('internet')) {
        replyText = `Yes, high-speed Wi-Fi is included in all rooms! The network name is "${selectedTenant.name}_Guest" and the password is "${selectedTenant.settings.wifiPassword}". Let me know if you need anything else!`;
      } else if (textLower.includes('room') || textLower.includes('price') || textLower.includes('deluxe') || textLower.includes('rate')) {
        const roomsList = selectedTenant.rooms.map(r => `${r.name} (${r.type}) at ₹${r.basePrice}/night`).join(', ');
        replyText = `We have wonderful room options available tonight! Here are our rates: ${roomsList}. You can book directly on our website or check in right here!`;
      } else if (textLower.includes('book') || textLower.includes('reserve')) {
        replyText = `I can definitely help you reserve a room! Please visit our booking portal at http://localhost:5173/site/${selectedTenant.subdomain} to complete your reservation in under 2 minutes.`;
      } else {
        replyText = `Hello ${simGuestName}, thank you for contacting ${selectedTenant.name}! Our automated concierge is at your service. Let me know if you have questions about room availability, check-in times (which are after ${selectedTenant.settings.checkInTime}), or policies!`;
      }

      const aiMessageObj = {
        id: `msg-sim-ai-${Date.now()}`,
        sender: 'ai' as const,
        text: replyText,
        timestamp: timestampString
      };

      // Add AI reply to conversation
      conversation.messages = [...conversation.messages, aiMessageObj];
      conversation.unread = false; // resolved or read by AI

      // Update tenant
      const updatedTenant = {
        ...selectedTenant,
        conversations: updatedConversations
      };

      // Save
      const nextTenantsList = tenants.map(t => t.id === simTenantId ? updatedTenant : t);
      updateAllTenants(nextTenantsList);

      addLog('AI', `AI assistant generated matching reply: "${replyText}"`);
      addLog('GATEWAY', `Dispatched reply to WhatsApp Gateway API successfully. Status: 200 OK.`);
      
      setIsSimulating(false);
      setSimMessage('');
    }, webhookDelay * 1000);
  };

  const filteredHotels = tenants.filter(t => 
    t.name.toLowerCase().includes(hotelSearch.toLowerCase()) || 
    t.subdomain.toLowerCase().includes(hotelSearch.toLowerCase()) ||
    t.settings.city.toLowerCase().includes(hotelSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-page text-slate-800 font-sans antialiased flex flex-col">
      {/* Header bar */}
      <header className="h-20 bg-white border-b border-slate-200/60 flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/app/dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-brand-primary text-xs font-bold hover:bg-brand-primary hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Admin</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Administration</span>
            <span>/</span>
            <span className="text-brand-primary font-extrabold">SaaS Super Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-semibold">Production Node Cluster: Healthy</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-200"
          >
            Logout admin
          </button>
        </div>
      </header>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between py-6 px-4">
          <div className="space-y-6">
            {/* Top Logo Segment */}
            <div className="h-20 flex items-center gap-3 px-2 border-b border-slate-100 -mt-6 -mx-4 mb-4">
              <div className="flex gap-1 items-center px-2">
                <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-brand-primary to-[#4f46e5] rotate-[25deg]"></div>
                <div className="w-2.5 h-7.5 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#7c3aed] rotate-[25deg] -translate-y-0.5"></div>
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-none font-sans">stayos</h1>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1 block">super admin</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Navigation</span>
              <nav className="space-y-1 px-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === 'overview'
                      ? 'bg-blue-50 text-brand-primary border-blue-100/30 font-bold shadow-sm shadow-blue-500/5'
                      : 'text-slate-650 border-transparent hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('hotels')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === 'hotels'
                      ? 'bg-blue-50 text-brand-primary border-blue-100/30 font-bold shadow-sm shadow-blue-500/5'
                      : 'text-slate-655 border-transparent hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Hotel Tenants</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === 'users'
                      ? 'bg-blue-50 text-brand-primary border-blue-100/30 font-bold shadow-sm shadow-blue-500/5'
                      : 'text-slate-655 border-transparent hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>SaaS Accounts</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai-simulator')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === 'ai-simulator'
                      ? 'bg-blue-50 text-brand-primary border-blue-100/30 font-bold shadow-sm shadow-blue-500/5'
                      : 'text-slate-655 border-transparent hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>WhatsApp AI Simulator</span>
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === 'logs'
                      ? 'bg-blue-50 text-brand-primary border-blue-100/30 font-bold shadow-sm shadow-blue-500/5'
                      : 'text-slate-655 border-transparent hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>System Console Logs</span>
                </button>
              </nav>
            </div>

            {/* Quick Status widgets */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Microservices</span>
              <div className="space-y-2 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Platform DB</span>
                  </div>
                  <span className="text-emerald-600 flex items-center gap-1"><Activity className="w-2.5 h-2.5 animate-pulse" /> Online</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-650" />
                    <span>OpenAI API</span>
                  </div>
                  <span className="text-emerald-600 flex items-center gap-1"><Activity className="w-2.5 h-2.5" /> Normal</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-pink-600" />
                    <span>WhatsApp GW</span>
                  </div>
                  <span className="text-emerald-600 flex items-center gap-1"><Activity className="w-2.5 h-2.5 animate-pulse" /> Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* System settings/purging */}
          <div className="space-y-3 pt-6 border-t border-slate-100 bg-white">
            <button
              onClick={handleResetPlatform}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-200 text-red-650 bg-red-50 hover:bg-red-600 hover:text-white transition-all text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
            <div className="text-[10px] text-slate-400 text-center font-medium">
              StayOS Admin Node CLI v2.4
            </div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-8 bg-bg-page">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Header metrics banner */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Platform System Metrics</h1>
                  <p className="text-slate-500 text-sm mt-1">Multi-tenant business activity across all registered properties.</p>
                </div>
                <div className="text-xs bg-white border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping" />
                  <span className="text-slate-655 font-bold">Auto-syncing active (Local DB)</span>
                </div>
              </div>

              {/* KPI cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all hover:shadow-md group">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
                    <div className="p-2 rounded-xl bg-blue-50 text-brand-primary group-hover:scale-110 transition-transform">
                      <DollarSign className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+14.2% since yesterday</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all hover:shadow-md group">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Hotels</span>
                    <div className="p-2 rounded-xl bg-violet-50 text-violet-650 group-hover:scale-110 transition-transform">
                      <Building className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-900">{tenants.length} Properties</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-bold">
                      <span>1 new pending setup</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all hover:shadow-md group">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Bookings</span>
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-650 group-hover:scale-110 transition-transform">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-900">{totalBookingsCount}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-primary font-bold">
                      <span>{totalGuestsCount} registered guests in CRM</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all hover:shadow-md group">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI WhatsApp Messages</span>
                    <div className="p-2 rounded-xl bg-pink-50 text-pink-650 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-900">{totalMessagesCount}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-bold">
                      <span>98.6% automated response rate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphic breakdown & ranking */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue comparison bar charts */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Hotel Performance Breakdown</h2>
                    <span className="text-xs text-slate-400 font-bold">Total earnings rank</span>
                  </div>
                  
                  <div className="space-y-5">
                    {tenants.map(t => {
                      const tRev = t.bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + b.amountPaid : sum, 0);
                      const maxRev = tenants.reduce((max, ten) => {
                        const tr = ten.bookings.reduce((s, b) => b.status !== 'cancelled' ? s + b.amountPaid : s, 0);
                        return tr > max ? tr : max;
                      }, 1);
                      const pct = Math.max(8, (tRev / maxRev) * 100);

                      return (
                        <div key={t.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand-primary" />
                              <span className="font-bold text-slate-700">{t.name}</span>
                              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{t.subdomain}</span>
                            </div>
                            <span className="font-bold text-slate-900">₹{tRev.toLocaleString()} ({t.bookings.length} bookings)</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-indigo-500 transition-all duration-500" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* System Activity Stream */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col h-full">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Latest Webhook Events</h2>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] pr-2">
                    {logs.slice(0, 5).map(l => (
                      <div key={l.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex justify-between items-center">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            l.source === 'WEBHOOK' ? 'bg-cyan-50 text-cyan-600 border border-cyan-200/30' :
                            l.source === 'AI' ? 'bg-indigo-50 text-indigo-650 border border-indigo-200/30' :
                            l.source === 'GATEWAY' ? 'bg-pink-50 text-pink-600 border border-pink-200/30' :
                            'bg-slate-200 text-slate-500'
                          }`}>
                            {l.source}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{l.timestamp}</span>
                        </div>
                        <p className="text-slate-700 mt-1.5 leading-relaxed font-semibold">{l.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOTEL TENANTS */}
          {activeTab === 'hotels' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Hotel Properties (Tenants)</h1>
                  <p className="text-slate-500 text-sm mt-1">Manage tenant configurations, subscriptions, and view specific database counts.</p>
                </div>
                <button
                  onClick={() => setAddHotelModalOpen(true)}
                  className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Hotel Tenant</span>
                </button>
              </div>

              {/* Search bar */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/85 flex items-center gap-3 shadow-sm">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search hotel name, city, or subdomain..."
                  value={hotelSearch}
                  onChange={e => setHotelSearch(e.target.value)}
                  className="bg-transparent text-sm w-full text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase font-bold bg-slate-50/50 tracking-wider">
                      <th className="p-4">Hotel Profile</th>
                      <th className="p-4">Subdomain</th>
                      <th className="p-4">City/Country</th>
                      <th className="p-4">Rooms</th>
                      <th className="p-4">Revenue</th>
                      <th className="p-4">Bookings</th>
                      <th className="p-4">Plan / Tier</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHotels.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                          No matching hotel tenants found.
                        </td>
                      </tr>
                    ) : (
                      filteredHotels.map(t => {
                        const rTotal = t.bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + b.amountPaid : sum, 0);
                        const isPremium = t.settings.breakfastPolicy === 'included';

                        return (
                          <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                                  style={{ backgroundColor: t.branding.primaryColor || '#3b82f6' }}
                                >
                                  {t.name[0]}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-800 block text-sm">{t.name}</span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">{t.settings.email || 'No email'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <a 
                                href={`/site/${t.subdomain}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-brand-primary font-bold hover:underline flex items-center gap-1"
                              >
                                <span>{t.subdomain}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="p-4 text-slate-600 font-semibold">
                              {t.settings.city}, {t.settings.country}
                            </td>
                            <td className="p-4 text-slate-600 font-semibold">
                              {t.rooms.length} room types ({t.rooms.reduce((s, r) => s + r.count, 0)} keys)
                            </td>
                            <td className="p-4 font-bold text-emerald-650 text-sm">
                              ₹{rTotal.toLocaleString()}
                            </td>
                            <td className="p-4 text-slate-600 font-bold">
                              {t.bookings.length} reservations
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleTier(t.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border cursor-pointer transition-all ${
                                  isPremium 
                                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' 
                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                {isPremium ? '★ Enterprise' : '● Standard'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    localStorage.setItem("stayos_v1_active_tenant_id", t.id);
                                    window.location.href = '/app/dashboard';
                                  }}
                                  className="text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 text-brand-primary px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                                >
                                  Manage Hotel
                                </button>
                                <button
                                  onClick={() => handleDeleteHotel(t.id, t.name)}
                                  title="Delete Tenant"
                                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SAAS ACCOUNTS */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">SaaS Platform Users</h1>
                  <p className="text-slate-500 text-sm mt-1">Manage administrative accounts and their respective hotel workspace permissions.</p>
                </div>
                <button
                  onClick={() => setAddUserModalOpen(true)}
                  className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite User</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase font-bold bg-slate-50/50 tracking-wider">
                      <th className="p-4">User Details</th>
                      <th className="p-4">System Email</th>
                      <th className="p-4">Workspace Associations (Role)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold">
                    {platformUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-brand-primary border border-slate-200 flex items-center justify-center font-bold text-[13px]">
                              {u.name[0]}
                            </div>
                            <span className="font-bold text-slate-800 block text-sm">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">{u.email}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {u.tenants.length === 0 ? (
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">No Associated Hotels</span>
                            ) : (
                              u.tenants.map(tAssoc => {
                                const hotelObj = tenants.find(ten => ten.id === tAssoc.tenantId);
                                return (
                                  <span 
                                    key={tAssoc.tenantId} 
                                    className="text-[10px] text-indigo-650 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded flex items-center gap-1"
                                  >
                                    <span>{hotelObj?.name || 'Unknown Hotel'}</span>
                                    <span className="text-[11px] uppercase font-black text-indigo-500">({tAssoc.role})</span>
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {u.email !== 'manav@stayos.com' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-bold transition-all px-2.5 py-1.5 rounded-lg cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: WHATSAPP SIMULATOR */}
          {activeTab === 'ai-simulator' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">WhatsApp Webhook Simulator</h1>
                <p className="text-slate-500 text-sm mt-1">Simulate inbound WhatsApp webhooks directly into hotel threads to test the AI Receptionist’s logic.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Config & Send Form */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-brand-primary" />
                    <span>Simulator Parameters</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Target Hotel Profile</label>
                      <select
                        value={simTenantId}
                        onChange={e => setSimTenantId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white text-xs font-semibold"
                      >
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.subdomain})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Response Delay (seconds)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.5"
                          value={webhookDelay}
                          onChange={e => setWebhookDelay(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-800 w-8 shrink-0">{webhookDelay}s</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Mock Guest Name</label>
                      <input
                        type="text"
                        value={simGuestName}
                        onChange={e => setSimGuestName(e.target.value)}
                        placeholder="Priya Patel"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Mock Guest Phone</label>
                      <input
                        type="text"
                        value={simGuestPhone}
                        onChange={e => setSimGuestPhone(e.target.value)}
                        placeholder="+91 90123 45678"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Mock Message Text</label>
                    <textarea
                      value={simMessage}
                      onChange={e => setSimMessage(e.target.value)}
                      placeholder="Type a guest question here..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 focus:outline-none focus:border-blue-500/50 focus:bg-white text-xs font-medium leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-650" />
                      <span>Personality Engine: {aiTone.toUpperCase()} (Model: {aiModel})</span>
                    </div>
                    <button
                      onClick={handleTriggerSimulation}
                      disabled={isSimulating || !simMessage}
                      className="bg-brand-primary hover:bg-brand-hover disabled:bg-blue-300 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 shrink-0" />
                          <span>Dispatch Mock Webhook</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Configuration Parameters */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                    <span>Global AI Settings</span>
                  </h2>

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider">Model Selection</label>
                      <select
                        value={aiModel}
                        onChange={e => setAiModel(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500/50 focus:bg-white"
                      >
                        <option value="gpt-4o-mini">GPT-4o Mini (Default - Optimized)</option>
                        <option value="gpt-4o">GPT-4o (High Accuracy / Actions)</option>
                        <option value="claude-3-haiku">Claude 3 Haiku (Fast reply)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider">AI Temperature</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.1"
                          value={aiTemp}
                          onChange={e => setAiTemp(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-slate-800 w-8 shrink-0">{aiTemp}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight font-medium">Lower temperatures reduce hallucinations in room listings.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider">Tone & Personality</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['professional', 'casual', 'luxury'].map(tone => (
                          <button
                            key={tone}
                            onClick={() => setAiTone(tone)}
                            className={`py-2 px-1 rounded-xl text-center capitalize border cursor-pointer text-[10px] transition-all font-bold ${
                              aiTone === tone 
                                ? 'bg-indigo-50 text-indigo-650 border-indigo-200 shadow-sm' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console Logs Widget (Interactive) */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-650" />
                    <span>Real-Time Platform Events Console</span>
                  </h2>
                  <button 
                    onClick={() => setLogs([])}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear Terminal
                  </button>
                </div>
                
                <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 font-mono text-[11px] leading-relaxed text-[#34d399] h-60 overflow-y-auto space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-slate-600 italic">No events generated. Send a webhook simulation to test...</p>
                  ) : (
                    logs.map(l => (
                      <div key={l.id} className="flex items-start gap-2.5 font-semibold">
                        <span className="text-slate-500 font-bold shrink-0">[{l.timestamp}]</span>
                        <span className={`px-1 rounded text-[11px] font-black shrink-0 ${
                          l.source === 'SYSTEM' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          l.source === 'WEBHOOK' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          l.source === 'AI' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          l.source === 'GATEWAY' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {l.source}
                        </span>
                        <span className="text-slate-300">{l.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM CONSOLE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Full System Console</h1>
                  <p className="text-slate-500 text-sm mt-1">Audit trail of platform microservices, database operations, and outbound API calls.</p>
                </div>
                <button 
                  onClick={() => setLogs([])}
                  className="text-xs bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                >
                  Clear Console Logs
                </button>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-900 p-6 font-mono text-xs leading-relaxed text-[#34d399] min-h-[450px] overflow-y-auto space-y-3 shadow-lg">
                {logs.map(l => (
                  <div key={l.id} className="flex items-start gap-3">
                    <span className="text-slate-500 font-bold shrink-0">[{l.timestamp}]</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
                      l.source === 'SYSTEM' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      l.source === 'WEBHOOK' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      l.source === 'AI' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      l.source === 'GATEWAY' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {l.source}
                    </span>
                    <span className="text-slate-300 font-semibold">{l.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD HOTEL TENANT */}
      {addHotelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-brand-primary" />
                <span>Register New Hotel Profile</span>
              </h3>
              <button 
                onClick={() => setAddHotelModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHotel} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-550 uppercase tracking-wider text-[10px]">Hotel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whispering Palms Luxury Resort"
                  value={newHotelName}
                  onChange={e => setNewHotelName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-555 uppercase tracking-wider text-[10px]">Business Type</label>
                  <select
                    value={newHotelType}
                    onChange={e => setNewHotelType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:bg-white"
                  >
                    <option value="Resort">Beach Resort</option>
                    <option value="Boutique Hotel">Boutique Hotel</option>
                    <option value="Villas">Luxury Villas</option>
                    <option value="Homestay">Heritage Homestay</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-555 uppercase tracking-wider text-[10px]">Base Room Price (INR)</label>
                  <input
                    type="number"
                    value={newHotelPrice}
                    onChange={e => setNewHotelPrice(e.target.value)}
                    placeholder="2999"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-555 uppercase tracking-wider text-[10px]">Contact Email</label>
                  <input
                    type="email"
                    placeholder="reservations@hotel.com"
                    value={newHotelEmail}
                    onChange={e => setNewHotelEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-555 uppercase tracking-wider text-[10px]">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={newHotelPhone}
                    onChange={e => setNewHotelPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-555 uppercase tracking-wider text-[10px]">Website Template Layout</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['modern', 'luxury', 'boutique', 'minimal'] as const).map(layout => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => setNewHotelTemplate(layout)}
                      className={`py-2 px-1 rounded-xl text-center capitalize border cursor-pointer transition-all ${
                        newHotelTemplate === layout 
                          ? 'bg-blue-50 text-brand-primary border-blue-200' 
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-850'
                      }`}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddHotelModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD USER */}
      {addUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-primary" />
                <span>Invite Platform Admin</span>
              </h3>
              <button 
                onClick={() => setAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-750 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-555 uppercase tracking-wider text-[10px]">User Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-555 uppercase tracking-wider text-[10px]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@stayos.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-555 uppercase tracking-wider text-[10px]">Target Hotel Associate</label>
                  <select
                    value={newUserTenantId}
                    onChange={e => setNewUserTenantId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:bg-white"
                  >
                    <option value="">No Property (Platform Admin)</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-555 uppercase tracking-wider text-[10px]">Role Permitted</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-xl py-2.5 px-3 focus:outline-none focus:bg-white"
                  >
                    <option value="owner">Owner / Co-Founder</option>
                    <option value="admin">System Admin</option>
                    <option value="manager">Hotel Manager</option>
                    <option value="staff">Staff Operator</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Assign Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
