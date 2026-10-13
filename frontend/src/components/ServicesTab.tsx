import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { api } from '../api';
import type { ServiceRecord } from '../types';
import {
  Sparkles,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  UtensilsCrossed,
  Layers,
  User,
  Bed,
  Check,
  X,
  Bot,
  Bell
} from 'lucide-react';
import { Button } from './Button';

// Default initial operational seed records if none exist yet
const INITIAL_DEMO_SERVICES: ServiceRecord[] = [
  {
    id: 'srv-1',
    requestId: 'SR-C719A2',
    guestName: 'Priya Patel',
    roomNumber: 'Room 204',
    roomName: 'Deluxe Ocean Suite',
    serviceType: 'cleaning',
    details: 'Guest requested complete room cleaning and fresh bed linens via AI Concierge chatbot.',
    status: 'scheduled',
    priority: 'normal',
    requestedTime: 'ASAP',
    estimatedArrival: 'Within 20–30 mins',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'srv-2',
    requestId: 'SR-8E4B19',
    guestName: 'Amit Sharma',
    roomNumber: 'Room 305',
    roomName: 'Executive Suite',
    serviceType: 'towels',
    details: 'Requested 2 extra large bath towels and extra toiletries.',
    status: 'in_progress',
    priority: 'normal',
    requestedTime: 'ASAP',
    estimatedArrival: 'Staff on way',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'srv-3',
    requestId: 'SR-F20D91',
    guestName: 'David Miller',
    roomNumber: 'Room 102',
    roomName: 'Standard Comfort Room',
    serviceType: 'maintenance',
    details: 'Air conditioning unit blowing warm air; requested urgent technician inspection.',
    status: 'scheduled',
    priority: 'high',
    requestedTime: 'Urgent',
    estimatedArrival: 'Technician dispatched',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'srv-4',
    requestId: 'SR-3A94C7',
    guestName: 'Ananya Roy',
    roomNumber: 'Room 408',
    roomName: 'Presidential Suite',
    serviceType: 'dining',
    details: 'Continental breakfast order: scrambled eggs, artisan croissant, and black coffee.',
    status: 'completed',
    priority: 'normal',
    requestedTime: 'Delivered',
    estimatedArrival: 'Completed',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

export const ServicesTab: React.FC = () => {
  const { activeTenant } = useApp();

  const [services, setServices] = useState<ServiceRecord[]>(() => {
    const saved = localStorage.getItem(`stayos_services_${activeTenant?.id || 'default'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return activeTenant?.serviceRequests?.length ? activeTenant.serviceRequests : INITIAL_DEMO_SERVICES;
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [newServiceType, setNewServiceType] = useState('cleaning');
  const [newPriority, setNewPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [newDetails, setNewDetails] = useState('');
  const [newTime, setNewTime] = useState('ASAP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live service requests from backend or sync with localStorage
  const loadServices = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getServiceRequests().catch(() => null);
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: ServiceRecord[] = res.data.map((s: any) => ({
          id: s._id || s.id,
          requestId: s.requestId || `SR-${(s._id || s.id).slice(-6).toUpperCase()}`,
          bookingId: s.bookingId?._id || s.bookingId,
          bookingCode: s.bookingId?.confirmationCode || 'IN-HOUSE',
          guestName: s.guestName || (s.guestId ? `${s.guestId.firstName || ''} ${s.guestId.lastName || ''}`.trim() : 'Valued Guest'),
          roomNumber: s.roomNumber || 'Assigned Room',
          roomName: s.roomName || 'Guest Room',
          serviceType: s.serviceType || 'cleaning',
          details: s.details || '',
          status: s.status || 'scheduled',
          priority: s.priority || 'normal',
          requestedTime: s.requestedTime || 'ASAP',
          estimatedArrival: s.estimatedArrival || 'Within 20–35 mins',
          createdAt: s.createdAt || new Date().toISOString()
        }));

        setServices(mapped);
        localStorage.setItem(`stayos_services_${activeTenant?.id || 'default'}`, JSON.stringify(mapped));
      }
    } catch {
      // Keep state
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadServices();

    // Listen to real-time service requests created by the chatbot widget
    const handleServiceCreated = (event: any) => {
      const sr = event.detail;
      if (sr) {
        const newRecord: ServiceRecord = {
          id: sr.requestId ? `srv-${sr.requestId}` : `srv-${Date.now()}`,
          requestId: sr.requestId || `SR-${Date.now().toString(36).slice(-6).toUpperCase()}`,
          bookingId: sr.bookingId,
          bookingCode: sr.bookingId || 'IN-HOUSE',
          guestName: sr.guestName || 'Valued Guest',
          roomNumber: sr.roomNumber || 'Room Assigned',
          roomName: sr.roomName || 'Guest Room',
          serviceType: sr.serviceType?.toLowerCase().includes('towel')
            ? 'towels'
            : sr.serviceType?.toLowerCase().includes('maint')
            ? 'maintenance'
            : sr.serviceType?.toLowerCase().includes('din')
            ? 'dining'
            : sr.serviceType?.toLowerCase().includes('clean')
            ? 'cleaning'
            : 'room_service',
          details: sr.details || 'Guest requested room service via AI Concierge chatbot.',
          status: 'scheduled',
          priority: 'normal',
          requestedTime: 'ASAP',
          estimatedArrival: sr.estimatedArrival || 'Within 20–35 mins',
          createdAt: new Date().toISOString()
        };

        setServices((prev) => {
          const updated = [newRecord, ...prev.filter((item) => item.requestId !== newRecord.requestId)];
          localStorage.setItem(`stayos_services_${activeTenant?.id || 'default'}`, JSON.stringify(updated));
          return updated;
        });
      }
    };

    window.addEventListener('stayos:service_request_created', handleServiceCreated);
    return () => {
      window.removeEventListener('stayos:service_request_created', handleServiceCreated);
    };
  }, [activeTenant?.id]);

  const updateStatus = async (id: string, newStatus: ServiceRecord['status']) => {
    try {
      await api.updateServiceRequestStatus(id, newStatus).catch(() => {});
    } catch {
      // Non-blocking
    }

    setServices((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
      localStorage.setItem(`stayos_services_${activeTenant?.id || 'default'}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedReqId = `SR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newRecord: ServiceRecord = {
      id: `srv-${Date.now()}`,
      requestId: generatedReqId,
      guestName: newGuestName.trim() || 'Front Desk Guest',
      roomNumber: newRoomNumber.trim() ? (newRoomNumber.toLowerCase().includes('room') ? newRoomNumber.trim() : `Room ${newRoomNumber.trim()}`) : 'Front Desk / Lobby',
      roomName: 'Assigned Room',
      serviceType: newServiceType,
      details: newDetails.trim() || `Dispatched ${newServiceType} via front desk panel.`,
      status: 'scheduled',
      priority: newPriority,
      requestedTime: newTime,
      estimatedArrival: 'Within 20–30 mins',
      createdAt: new Date().toISOString()
    };

    try {
      if (activeTenant?.id) {
        await api.createServiceRequest({
          businessId: activeTenant.id,
          roomNumber: newRecord.roomNumber,
          guestName: newRecord.guestName,
          serviceType: newRecord.serviceType,
          details: newRecord.details,
          priority: newRecord.priority,
          requestedTime: newRecord.requestedTime
        }).catch(() => {});
      }
    } catch {
      // Non-blocking
    }

    setServices((prev) => {
      const updated = [newRecord, ...prev];
      localStorage.setItem(`stayos_services_${activeTenant?.id || 'default'}`, JSON.stringify(updated));
      return updated;
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewRoomNumber('');
    setNewGuestName('');
    setNewDetails('');
  };

  // Metrics calculation
  const totalCount = services.length;
  const scheduledCount = services.filter((s) => s.status === 'scheduled' || s.status === 'requested').length;
  const inProgressCount = services.filter((s) => s.status === 'in_progress').length;
  const completedCount = services.filter((s) => s.status === 'completed').length;
  const aiDispatchedCount = services.filter((s) => s.details.toLowerCase().includes('ai') || s.details.toLowerCase().includes('concierge') || s.details.toLowerCase().includes('chatbot')).length;

  // Filtered services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.guestName.toLowerCase().includes(search.toLowerCase()) ||
      (s.requestId && s.requestId.toLowerCase().includes(search.toLowerCase())) ||
      s.details.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'scheduled'
        ? s.status === 'scheduled' || s.status === 'requested'
        : s.status === statusFilter;

    const matchesType =
      typeFilter === 'all'
        ? true
        : s.serviceType.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType;
  });

  const getServiceBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('towel') || t.includes('linen')) {
      return { label: 'Fresh Towels & Linens', icon: Layers, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (t.includes('maint') || t.includes('repair') || t.includes('fix') || t.includes('ac')) {
      return { label: 'Maintenance & Repair', icon: Wrench, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (t.includes('din') || t.includes('food') || t.includes('meal')) {
      return { label: 'In-Room Dining', icon: UtensilsCrossed, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (t.includes('clean') || t.includes('housekeep')) {
      return { label: 'Room Cleaning', icon: Sparkles, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    return { label: 'Room Service', icon: Bell, bg: 'bg-teal-50 text-teal-700 border-teal-200' };
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Requests & Housekeeping</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Live dispatch board for AI Concierge guest requests, housekeeping orders, and maintenance tickets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={loadServices}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dispatch Request
          </Button>
        </div>
      </div>

      {/* AI Integration Highlight Alert */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-emerald-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-indigo-900">AI Concierge Connected</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-650 mt-0.5">
              When guests ask your chatbot for room cleaning, towels, or maintenance on your hotel site, tickets are automatically created and dispatched here instantly.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-xs font-bold text-indigo-700 bg-white/80 px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs">
          ⚡ {aiDispatchedCount} AI Dispatched
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Requests</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalCount}</div>
          <span className="text-[11px] text-slate-400">All registered service tasks</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs bg-amber-50/20">
          <div className="flex justify-between items-center text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Scheduled / Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{scheduledCount}</div>
          <span className="text-[11px] text-amber-700/80">Awaiting staff action</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-2xs bg-blue-50/20">
          <div className="flex justify-between items-center text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-2">{inProgressCount}</div>
          <span className="text-[11px] text-blue-700/80">Staff currently attending</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20">
          <div className="flex justify-between items-center text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">{completedCount}</div>
          <span className="text-[11px] text-emerald-700/80">Service delivered</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Room #, Guest, or Reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
            {(['all', 'scheduled', 'in_progress', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md transition-all capitalize ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'in_progress' ? 'In Progress' : st}
              </button>
            ))}
          </div>

          {/* Type Filter Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-250 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="cleaning">Room Cleaning</option>
            <option value="towels">Fresh Towels & Linens</option>
            <option value="maintenance">Maintenance</option>
            <option value="dining">In-Room Dining</option>
            <option value="room_service">Room Service</option>
          </select>
        </div>
      </div>

      {/* Services List / Cards */}
      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-250 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No service requests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try clearing your search or status filters to view records.'
                : 'Try typing "I want cleaning service" in the AI chatbot on your public site to see requests appear live here!'}
            </p>
            {(search || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          filteredServices.map((req) => {
            const badge = getServiceBadge(req.serviceType);
            const Icon = badge.icon;
            const isHighPriority = req.priority === 'high';

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-4 sm:p-5 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Section: Details */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Category Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {req.requestId || 'SR-ACTIVE'}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {isHighPriority && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> URGENT
                        </span>
                      )}
                      {req.details.toLowerCase().includes('ai') && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-0.5">
                          <Bot className="w-3 h-3" /> AI Chatbot
                        </span>
                      )}
                    </div>

                    {/* Room and Guest */}
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="font-extrabold text-slate-900 flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        {req.roomNumber}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-medium text-slate-650 flex items-center gap-1 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {req.guestName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Request description */}
                    <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      {req.details}
                    </p>
                  </div>
                </div>

                {/* Right Section: Status & Actions */}
                <div className="flex items-center md:flex-col justify-between md:items-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Status Pill */}
                  <div>
                    {req.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : req.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <Wrench className="w-3.5 h-3.5 animate-pulse" /> In Progress
                      </span>
                    ) : req.status === 'cancelled' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-150 text-slate-600">
                        <X className="w-3.5 h-3.5" /> Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Scheduled
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {req.status === 'scheduled' && (
                      <button
                        onClick={() => updateStatus(req.id, 'in_progress')}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        Start Service
                      </button>
                    )}

                    {req.status === 'in_progress' && (
                      <button
                        onClick={() => updateStatus(req.id, 'completed')}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Done
                      </button>
                    )}

                    {req.status !== 'completed' && req.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(req.id, 'cancelled')}
                        className="px-2 py-1 text-xs font-semibold text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Dispatch Service Request</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 204 or Suite 305"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Guest Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Patel"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Type *</label>
                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="cleaning">Room Cleaning</option>
                    <option value="towels">Fresh Towels & Linens</option>
                    <option value="maintenance">Maintenance & Repair</option>
                    <option value="dining">In-Room Dining</option>
                    <option value="room_service">General Room Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High / Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requested Time / Urgency</label>
                <input
                  type="text"
                  placeholder="e.g. ASAP or In 30 mins"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details & Special Instructions</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Guest requested deep clean before 3 PM..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 border border-slate-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {isSubmitting ? 'Dispatching...' : 'Dispatch Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
