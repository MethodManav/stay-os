import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import type { Room, Tenant, TenantBranding, TenantSettings, WebsiteTheme } from '../db';
import { api } from '../api';
import { 
  MapPin, 
  Wifi, 
  Coffee, 
  Phone, 
  Mail, 
  Bot, 
  Send, 
  X, 
  CheckCircle,
  Clock,
  Menu,
  ChevronRight
} from 'lucide-react';

const mapPublicToTenant = (business: any, website: any, roomTypes: any[]): Tenant => {
  const settings: TenantSettings = {
    address: business.address || '',
    city: business.city || '',
    country: business.country || '',
    currency: business.currency || 'INR',
    timezone: business.timezone || 'IST (UTC+5:30)',
    checkInTime: business.checkInTime || '14:00',
    checkOutTime: business.checkOutTime || '11:00',
    wifiPassword: '',
    breakfastPolicy: 'none',
    description: business.description || '',
    cancellationPolicy: 'Standard cancellation policy.',
    phone: business.phone || '',
    email: business.email || ''
  };

  const branding: TenantBranding = {
    logo: business.logo || '🏨',
    primaryColor: website?.theme?.primaryColor || '#0f766e',
    secondaryColor: website?.theme?.secondaryColor || '#0d9488',
    font: (website?.theme?.font || 'outfit') as any,
    buttonStyle: (website?.theme?.buttonStyle || 'rounded-full') as any
  };

  const mappedRooms: Room[] = roomTypes.map((rt: any) => ({
    id: rt.id || rt._id,
    name: rt.name,
    type: rt.name,
    maxGuests: rt.capacity,
    basePrice: rt.pricePerNight,
    count: 10,
    status: 'available',
    amenities: rt.amenities || [],
    image: rt.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85'
  }));

  const mappedWebsite: WebsiteTheme = {
    template: website?.templateId || 'modern',
    sections: (website?.sections || []).map((s: any) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      visible: s.visible,
      content: s.content || {}
    }))
  };

  return {
    id: business.id || business._id || '',
    subdomain: business.slug || '',
    name: business.name,
    branding,
    settings,
    rooms: mappedRooms,
    bookings: [],
    guests: [],
    conversations: [],
    website: mappedWebsite,
    team: []
  };
};

export const PublicSite: React.FC = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState('');
  
  // Navigation
  const [mobileMenu, setMobileMenu] = useState(false);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  // Form fields
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState('2026-08-19');
  const [checkOut, setCheckOut] = useState('2026-08-22');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const notes = '';

  // AI Assistant Chat Widget
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'guest' | 'ai'; text: string; link?: string }>>([]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTenant = async () => {
      try {
        setLoading(true);
        setErrorState('');
        const data = await api.getPublicBusiness(subdomain!);
        const roomTypes = await api.getPublicRooms(subdomain!);
        
        const mappedTenant = mapPublicToTenant(data.business, data.website, roomTypes);
        setTenant(mappedTenant);
        
        setMessages([
          { sender: 'ai', text: `Hello! Welcome to ${mappedTenant.name}. I am your AI receptionist concierge. Ask me anything about our room rates, check-in policies, wifi, or request a booking reservation!` }
        ]);
      } catch (err: any) {
        console.error('Failed to load public tenant profile:', err);
        setErrorState(err.message || 'Hotel profile not found.');
      } finally {
        setLoading(false);
      }
    };
    if (subdomain) {
      loadTenant();
    }
  }, [subdomain]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiChatOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-center p-6 text-[#1a1a1e]">
        <div className="space-y-4">
          <Clock className="w-10 h-10 animate-spin mx-auto text-[#1b4332]" />
          <h2 className="text-xl font-bold font-outfit">Loading Hotel Portal...</h2>
        </div>
      </div>
    );
  }

  if (errorState || !tenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center p-6 text-[#1a1a1e]">
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold">404: Hotel Profile Not Found</h1>
          <p className="text-sm text-slate-500">{errorState || 'This property subdomain is not registered on the platform.'}</p>
          <Link to="/" className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-lg font-bold">Go to StayOS home</Link>
        </div>
      </div>
    );
  }

  // Branding configurations
  const primaryColor = tenant.branding.primaryColor;
  const fontClass = tenant.branding.font === 'serif' ? 'font-serif' : tenant.branding.font === 'outfit' ? 'font-outfit' : 'font-sans';
  const buttonRadius = tenant.branding.buttonStyle === 'rounded-full' ? '9999px' : tenant.branding.buttonStyle === 'rounded-md' ? '8px' : '0px';

  // Calculate booking nights and totals
  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
  const totalCost = selectedRoom ? selectedRoom.basePrice * nights : 0;
  const currencySymbol = tenant.settings.currency === 'INR' ? '₹' : '$';

  const handleOpenBookingModal = (room?: Room) => {
    setSelectedRoom(room || tenant.rooms[0]);
    setBookingSuccess(null);
    setBookingModalOpen(true);
  };

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      const [firstName, ...rest] = guestName.split(' ');
      const lastName = rest.join(' ') || 'Guest';

      const res = await api.createPublicBooking(subdomain!, {
        roomTypeId: selectedRoom.id,
        checkIn,
        checkOut,
        numberOfGuests: guestsCount,
        guestDetails: {
          firstName,
          lastName,
          email: guestEmail,
          phone: guestPhone,
          country: 'India'
        }
      });

      setBookingSuccess(res.data.bookingId || `B-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Booking reservation failed. Please check date availability.');
    }
  };

  const handleAiSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userQuery = aiInput.trim();
    setMessages(prev => [...prev, { sender: 'guest', text: userQuery }]);
    setAiInput('');
    setIsTyping(true);

    try {
      let guestPhoneNum = localStorage.getItem('stayos_guest_phone');
      if (!guestPhoneNum) {
        guestPhoneNum = '+91 99' + Math.floor(10000000 + Math.random() * 90000000);
        localStorage.setItem('stayos_guest_phone', guestPhoneNum);
      }

      const res = await api.sendGuestMessage(guestName || 'Guest User', guestPhoneNum, userQuery);
      setIsTyping(false);

      const allMsgs = res.data.messages || [];
      const aiReply = allMsgs[allMsgs.length - 1];

      if (aiReply) {
        const q = userQuery.toLowerCase();
        if (q.includes('book') || q.includes('reserve') || q.includes('reservation')) {
          setMessages(prev => [
            ...prev,
            { sender: 'ai', text: aiReply.text },
            ...tenant.rooms.map((r: any) => ({
              sender: 'ai' as const,
              text: `Book ${r.name} for ${currencySymbol}${r.basePrice}/night`,
              link: r.id
            }))
          ]);
        } else {
          setMessages(prev => [...prev, { sender: 'ai', text: aiReply.text }]);
        }
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: `I am happy to assist you at ${tenant.name}. Please contact our front desk at ${tenant.settings.phone} for details.` }]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am currently having trouble connecting to my concierge brain. Please try again in a few moments.' }]);
    }
  };

  const handleLinkClick = (roomId: string) => {
    const targetRoom = tenant.rooms.find(r => r.id === roomId);
    if (targetRoom) {
      setAiChatOpen(false);
      handleOpenBookingModal(targetRoom);
    }
  };

  return (
    <div className={`min-h-screen bg-white text-[#1a1a1e] antialiased ${fontClass}`}>
      
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <a href="#" className="text-xl font-black tracking-tight text-[#1a1a1e] flex items-center gap-2">
            <span className="text-xl">{tenant.branding.logo || '🏨'}</span>
            <span>{tenant.name}</span>
          </a>

          {/* Links desktop */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            <a href="#rooms" className="hover:text-black">Accommodations</a>
            <a href="#amenities" className="hover:text-black">Experiences</a>
            <a href="#about" className="hover:text-black">About Us</a>
            <a href="#location" className="hover:text-black">Location</a>
          </nav>

          <div className="hidden md:block">
            <button
              onClick={() => handleOpenBookingModal()}
              className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-sm transition-all"
              style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }}
            >
              Book Now
            </button>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden">
            <Menu className="w-6 h-6 text-slate-800" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div className="fixed inset-0 top-20 bg-white z-30 border-t border-slate-100 flex flex-col p-6 gap-6 md:hidden">
          <a href="#rooms" onClick={() => setMobileMenu(false)} className="text-lg font-bold text-slate-800">Accommodations</a>
          <a href="#amenities" onClick={() => setMobileMenu(false)} className="text-lg font-bold text-slate-800">Experiences</a>
          <a href="#about" onClick={() => setMobileMenu(false)} className="text-lg font-bold text-slate-800">About Us</a>
          <a href="#location" onClick={() => setMobileMenu(false)} className="text-lg font-bold text-slate-800">Location</a>
          <button
            onClick={() => { setMobileMenu(false); handleOpenBookingModal(); }}
            className="w-full py-3.5 text-sm font-bold text-white text-center mt-4"
            style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }}
          >
            Book Now
          </button>
        </div>
      )}

      {/* Website Sections mapped dynamically from visual theme ordering */}
      {tenant.website.sections.filter(s => s.visible).map((sec) => {
        
        if (sec.type === 'hero') {
          return (
            <section key={sec.id} className="relative h-[80vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden bg-slate-950">
              <img 
                src={sec.content.bgImage} 
                alt="Hotel Hero Cover" 
                className="absolute inset-0 w-full h-full object-cover opacity-50" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35 z-10" />
              
              <div className="relative z-20 space-y-6 max-w-3xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight font-outfit">
                  {sec.content.headline}
                </h1>
                <p className="text-base sm:text-lg text-slate-200 max-w-xl mx-auto font-medium leading-relaxed">
                  {sec.content.subheadline}
                </p>
                <button
                  onClick={() => handleOpenBookingModal()}
                  className="px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-xl hover:scale-102 active:scale-98 transition-all mt-4"
                  style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }}
                >
                  {sec.content.ctaText}
                </button>
              </div>
            </section>
          );
        }

        if (sec.type === 'about') {
          return (
            <section key={sec.id} id="about" className="py-24 px-6 text-center bg-slate-50">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-xs uppercase tracking-widest font-extrabold" style={{ color: primaryColor }}>{sec.title}</h2>
                <p className="text-base sm:text-lg leading-relaxed text-slate-600 font-medium italic">
                  "{sec.content.text}"
                </p>
              </div>
            </section>
          );
        }

        if (sec.type === 'rooms') {
          return (
            <section key={sec.id} id="rooms" className="py-24 px-6 max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <h2 className="text-xs uppercase tracking-widest font-extrabold" style={{ color: primaryColor }}>{sec.title}</h2>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-800 font-outfit">{sec.content.subheading}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tenant.rooms.map((room) => (
                  <div key={room.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group bg-white">
                    <div className="h-56 bg-slate-150 overflow-hidden relative">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold font-mono">
                        {currencySymbol}{room.basePrice.toLocaleString()} <span className="text-[9px] font-normal text-slate-350">/ night</span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <span className="text-[9px] uppercase font-bold text-[#7a7974]">{room.type}</span>
                        <h4 className="text-base font-extrabold text-slate-900 leading-snug">{room.name}</h4>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {room.amenities.slice(0, 4).map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-150 text-[10px] font-bold text-slate-700">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenBookingModal(room)}
                        className="w-full py-2.5 text-xs font-extrabold uppercase tracking-widest text-white transition-all text-center block"
                        style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }}
                      >
                        Reserve Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sec.type === 'amenities') {
          return (
            <section key={sec.id} id="amenities" className="py-24 px-6 bg-slate-50 text-center space-y-12">
              <div className="max-w-xl mx-auto space-y-2">
                <h2 className="text-xs uppercase tracking-widest font-extrabold" style={{ color: primaryColor }}>{sec.title}</h2>
                <p className="text-xl font-extrabold text-slate-800 font-outfit">Curated spaces for exceptional comfort</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                {sec.content.list.split(',').map((am, i) => (
                  <div key={i} className="px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center gap-2.5 font-bold text-xs">
                    {am.trim().toLowerCase().includes('wifi') ? <Wifi className="w-4 h-4 text-[#1b4332]" /> : <Coffee className="w-4 h-4 text-[#1b4332]" />}
                    <span>{am.trim()}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (sec.type === 'gallery') {
          return (
            <section key={sec.id} className="py-24 px-6 max-w-7xl mx-auto space-y-8">
              <h2 className="text-xs uppercase tracking-widest font-extrabold text-center" style={{ color: primaryColor }}>{sec.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <img src={sec.content.img1} alt="" className="rounded-xl h-48 w-full object-cover hover:opacity-90 transition-opacity" />
                <img src={sec.content.img2} alt="" className="rounded-xl h-48 w-full object-cover hover:opacity-90 transition-opacity" />
                <img src={sec.content.img3} alt="" className="rounded-xl h-48 w-full object-cover hover:opacity-90 transition-opacity" />
                <img src={sec.content.img4} alt="" className="rounded-xl h-48 w-full object-cover hover:opacity-90 transition-opacity" />
              </div>
            </section>
          );
        }

        if (sec.type === 'testimonials') {
          return (
            <section key={sec.id} className="py-24 px-6 bg-slate-900 text-white text-center space-y-4">
              <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{sec.title}</h2>
              <p className="text-lg sm:text-xl italic max-w-2xl mx-auto leading-relaxed font-medium">
                "{sec.content.quote}"
              </p>
              <span className="block text-xs font-bold text-slate-400 mt-2">— {sec.content.author}</span>
            </section>
          );
        }

        if (sec.type === 'location') {
          return (
            <section key={sec.id} id="location" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-xs uppercase tracking-widest font-extrabold" style={{ color: primaryColor }}>{sec.title}</h2>
                <h3 className="text-2xl font-extrabold text-slate-800 font-outfit">Contact & Directions</h3>
                
                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <p className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-[#a3c2b2]" /> {sec.content.address}</p>
                  <p className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-[#a3c2b2]" /> {tenant.settings.phone}</p>
                  <p className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-[#a3c2b2]" /> {tenant.settings.email}</p>
                </div>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden border border-slate-150 shadow-sm relative">
                <iframe
                  title="Google Maps"
                  src={sec.content.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </section>
          );
        }

        if (sec.type === 'footer') {
          return (
            <footer key={sec.id} className="py-12 bg-slate-950 text-slate-500 text-center text-xs border-t border-slate-900">
              <p className="font-semibold">{sec.content.copyright}</p>
            </footer>
          );
        }

        return null;
      })}

      {/* Booking Form Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccess ? (
              <form onSubmit={handleCompleteBooking} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="border-b border-slate-150 pb-3">
                  <h3 className="text-base font-extrabold text-[#1a1a1e] font-outfit">Reservations Desk</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Secure your direct stay with instant confirmation</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Select Room Type</label>
                    <select
                      value={selectedRoom?.id || ''}
                      onChange={e => setSelectedRoom(tenant.rooms.find(r => r.id === e.target.value) || null)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      {tenant.rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Guests Count</label>
                    <input
                      type="number"
                      min={1}
                      value={guestsCount}
                      onChange={e => setGuestsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Check-in Date</label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={e => setCheckIn(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Check-out Date</label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={e => setCheckOut(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Guest Full Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      placeholder="e.g. Amit Patel"
                      onChange={e => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={guestPhone}
                      placeholder="+91 99000 88000"
                      onChange={e => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      placeholder="amit@patel.com"
                      onChange={e => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="block font-bold text-slate-700">Total Settlement Quote ({nights} nights)</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Includes taxes and policies</span>
                  </div>
                  <span className="text-base font-extrabold text-slate-900">
                    {currencySymbol}{totalCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white font-bold rounded-lg shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Pay & Confirm
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-250 shadow-inner">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-[#1a1a1e] font-outfit">Reservation Confirmed!</h3>
                  <p className="text-xs text-slate-500">Your reservation has been locked and synced to the CRM database.</p>
                  <div className="inline-block px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-150 font-mono font-bold text-xs text-slate-800 mt-2">
                    Reference ID: {bookingSuccess}
                  </div>
                </div>
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className="px-6 py-2.5 text-white text-xs font-bold rounded-lg inline-block transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  Close Desk
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Floating AI Receptionist widget */}
      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Toggle bubble button */}
        {!aiChatOpen && (
          <button
            onClick={() => setAiChatOpen(true)}
            className="w-14 h-14 bg-[#1b4332] hover:bg-[#143324] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#1b4332]/25 relative animate-bounce cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <Bot className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-orange-500 border border-white" />
          </button>
        )}

        {/* Chat Drawer Dialog */}
        {aiChatOpen && (
          <div className="w-80 sm:w-96 h-[460px] bg-white border border-slate-150 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header info */}
            <div className="px-4 py-3 bg-[#1b4332] text-white flex justify-between items-center shrink-0" style={{ backgroundColor: primaryColor }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">AI Receptionist Concierge</span>
                  <span className="block text-[9px] opacity-85 mt-0.5 leading-none">Answers instantly 24/7</span>
                </div>
              </div>

              <button onClick={() => setAiChatOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {messages.map((m, i) => {
                const isGuest = m.sender === 'guest';
                return (
                  <div key={i} className={`flex gap-2.5 max-w-[80%] ${isGuest ? 'ml-auto flex-row-reverse text-right' : ''}`}>
                    <div className={`w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-inner ${
                      isGuest ? 'bg-slate-100 text-slate-800' : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {isGuest ? 'G' : 'AI'}
                    </div>

                    <div className="space-y-1 text-left">
                      {m.link ? (
                        <button
                          onClick={() => handleLinkClick(m.link!)}
                          className="p-2.5 rounded-xl text-[10px] font-bold text-left bg-emerald-100 hover:bg-emerald-600 border border-emerald-250 text-emerald-900 hover:text-white transition-all flex items-center justify-between w-full cursor-pointer"
                        >
                          <span>{m.text}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className={`p-2.5 rounded-xl text-[10px] font-semibold leading-relaxed ${
                          isGuest ? 'bg-[#1b4332] text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }`} style={{ backgroundColor: isGuest ? primaryColor : undefined }}>
                          {m.text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    AI
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-400 italic font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input bottom form */}
            <form onSubmit={handleAiSend} className="p-3 border-t border-slate-150 bg-white flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask about wifi, checkout policy..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none text-xs text-[#1a1a1e]"
              />
              <button
                type="submit"
                className="p-1.5 bg-[#1b4332] hover:bg-[#143324] text-white rounded-xl cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </div>

    </div>
  );
};
export default PublicSite;
