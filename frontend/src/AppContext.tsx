import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  getTenants,
  type Tenant, 
  type SaaSUser, 
  type Booking, 
  type Guest, 
  type Room, 
  type Conversation, 
  type WebsiteTheme, 
  type TenantBranding, 
  type TenantSettings, 
  type TeamMember
} from './db';
import { api } from './api';

const mapBackendToTenant = (
  business: any,
  bookings: any[],
  guests: any[],
  roomTypes: any[],
  rooms: any[],
  website: any,
  conversations: any[],
  user: any
): Tenant => {
  // Map settings
  const settings: TenantSettings = {
    address: business.address || '',
    city: business.city || '',
    country: business.country || '',
    currency: business.currency || 'INR',
    timezone: business.timezone || 'IST (UTC+5:30)',
    checkInTime: business.checkInTime || '14:00',
    checkOutTime: business.checkOutTime || '11:00',
    wifiPassword: business.wifiPassword || 'stayos_guests',
    breakfastPolicy: business.breakfastPolicy || 'included',
    description: business.description || '',
    cancellationPolicy: business.cancellationPolicy || 'Free cancellation up to 48 hours before check-in.',
    phone: business.phone || '',
    email: business.email || ''
  };

  // Map branding
  const branding: TenantBranding = {
    logo: business.logo || '🏨',
    primaryColor: website?.theme?.primaryColor || '#0f766e',
    secondaryColor: website?.theme?.secondaryColor || '#0d9488',
    font: (website?.theme?.font || 'outfit') as any,
    buttonStyle: (website?.theme?.buttonStyle || 'rounded-full') as any
  };

  // Map rooms (inventory)
  const mappedRooms: Room[] = roomTypes.map((rt: any) => {
    const physical = rooms.filter(r => r.roomTypeId === rt.id || r.roomTypeId === rt._id);
    return {
      id: rt.id || rt._id,
      name: rt.name,
      type: rt.name,
      maxGuests: rt.capacity,
      basePrice: rt.pricePerNight,
      count: physical.length || 10,
      status: physical.length > 0 ? (physical.some(r => r.status === 'available') ? 'available' : 'occupied') : 'available',
      amenities: rt.amenities || [],
      image: rt.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85'
    };
  });

  // Map bookings
  const mappedBookings: Booking[] = bookings.map((b: any) => {
    return {
      id: b.id || b._id,
      guestId: b.guestId?.email || b.guestId?.phone || '',
      guestName: b.guestId ? `${b.guestId.firstName || 'Guest'} ${b.guestId.lastName || ''}`.trim() : 'Guest',
      roomType: b.roomTypeId?.name || 'Deluxe Room',
      roomNumber: b.roomId?.roomNumber || '101',
      checkIn: b.checkIn ? b.checkIn.substring(0, 10) : '',
      checkOut: b.checkOut ? b.checkOut.substring(0, 10) : '',
      status: (b.bookingStatus || 'PENDING').toLowerCase().replace('_', '-') as any,
      amountPaid: b.pricing?.total || 0,
      paymentStatus: (b.paymentStatus || 'PENDING').toLowerCase() as any,
      guestsCount: b.numberOfGuests || 2,
      notes: b.notes || '',
      paymentMethod: b.source === 'WEBSITE' ? 'Stripe' : 'Razorpay',
      createdAt: b.createdAt
    };
  });

  // Map guests
  const mappedGuests: Guest[] = guests.map((g: any) => {
    return {
      id: g.id || g._id,
      name: `${g.firstName || 'Guest'} ${g.lastName || ''}`.trim(),
      email: g.email || '',
      phone: g.phone || '',
      tags: g.tags || [],
      notes: g.notes || '',
      preferences: g.preferences || '',
      totalBookings: g.totalBookings || 0,
      totalSpending: g.totalSpent || 0,
      lastVisit: g.lastVisit ? g.lastVisit.substring(0, 10) : ''
    };
  });

  // Map conversations
  const mappedConversations: Conversation[] = conversations.map((c: any) => {
    return {
      id: c.id || c._id,
      guestName: c.guestName,
      guestPhone: c.guestPhone,
      unread: c.unread || false,
      status: c.status || 'active',
      createdAt: c.createdAt,
      messages: (c.messages || []).map((m: any) => ({
        id: m.id || m._id || String(Math.random()),
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
      }))
    };
  });

  // Map website
  const mappedWebsite: WebsiteTheme = {
    template: website?.templateId || 'modern',
    sections: (website?.sections || []).map((s: any) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      visible: s.visible,
      content: s.content instanceof Map ? Object.fromEntries(s.content) : s.content || {}
    }))
  };

  // Map team
  const team: TeamMember[] = [
    { id: user.id || 'owner', name: user.name || 'Owner', email: user.email || '', role: 'owner' }
  ];

  return {
    id: business.id || business._id,
    subdomain: business.slug || '',
    name: business.name,
    branding,
    settings,
    rooms: mappedRooms,
    bookings: mappedBookings,
    guests: mappedGuests,
    conversations: mappedConversations,
    website: mappedWebsite,
    team
  };
};

interface AppContextType {
  tenants: Tenant[];
  activeTenant: Tenant;
  currentUser: SaaSUser | null;
  onboardingCompleted: boolean;
  switchTenant: (id: string) => void;
  syncState: () => Promise<void>;
  updateActiveTenant: (tenant: Tenant) => void;
  updateAllTenants: (tenants: Tenant[]) => void;
  registerNewTenant: (
    accountDetails: { name: string; email: string; pass: string },
    hotelName: string,
    businessType: string,
    settings: Partial<TenantSettings>,
    branding: Partial<TenantBranding>,
    rooms: Room[],
    websiteTemplate: 'luxury' | 'modern' | 'boutique' | 'minimal'
  ) => Promise<Tenant>;
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  updateBooking: (booking: Booking) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  addGuest: (guestData: Omit<Guest, 'id'>) => Promise<Guest>;
  updateGuest: (guest: Guest) => Promise<void>;
  addRoom: (roomData: Omit<Room, 'id'>) => Promise<Room>;
  updateRoom: (room: Room) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  addMessage: (conversationId: string, sender: 'guest' | 'staff' | 'ai', text: string) => Promise<void>;
  createConversation: (guestName: string, guestPhone: string) => Promise<Conversation>;
  updateConversationStatus: (id: string, status: 'active' | 'resolved' | 'escalated') => Promise<void>;
  updateWebsiteTheme: (website: WebsiteTheme) => Promise<void>;
  updateBranding: (branding: TenantBranding) => Promise<void>;
  updateSettings: (settings: TenantSettings) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (member: TeamMember) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  triggerOnboardingState: (completed: boolean) => void;
  handleLogout: () => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenantState] = useState<Tenant | null>(null);
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>(null);
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const syncState = async () => {
    try {
      let meRes;
      try {
        meRes = await api.getMe();
      } catch (err) {
        setTenants([]);
        setActiveTenantState(null);
        setCurrentUser(null);
        setOnboardingCompletedState(false);
        return;
      }
      const user = meRes.data.user;

      const loggedInUser: SaaSUser = {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        tenants: (user.organizations || []).map((org: any) => ({
          tenantId: org.organizationId,
          role: org.role.toLowerCase()
        }))
      };

      setCurrentUser(loggedInUser);
      setOnboardingCompletedState((user.organizations || []).length > 0);

      if ((user.organizations || []).length > 0) {
        const tenantList: Tenant[] = [];
        let activeId = api.getOrganizationId();
        if (!activeId || !user.organizations.some((o: any) => o.organizationId === activeId)) {
          activeId = user.organizations[0].organizationId;
          api.setOrganizationId(activeId);
        }

        for (const org of user.organizations) {
          try {
            api.setOrganizationId(org.organizationId);
            const [businessRes, bookingsRes, guestsRes, roomTypesRes, roomsRes, websiteRes, conversationsRes] = await Promise.all([
              api.getBusinessProfile().catch(() => null),
              api.getBookings().catch(() => ({ data: [] })),
              api.getGuests().catch(() => ({ data: [] })),
              api.getRoomTypes().catch(() => ({ data: [] })),
              api.getRooms().catch(() => ({ data: [] })),
              api.getWebsiteProfile().catch(() => null),
              api.getConversations().catch(() => ({ data: [] }))
            ]);

            if (businessRes && businessRes.data) {
              const mapped = mapBackendToTenant(
                businessRes.data,
                bookingsRes.data || [],
                guestsRes.data || [],
                roomTypesRes.data || [],
                roomsRes.data || [],
                websiteRes?.data,
                conversationsRes.data || [],
                user
              );
              tenantList.push(mapped);
            }
          } catch (err) {
            console.error('Error fetching organization data:', err);
          }
        }

        api.setOrganizationId(activeId);
        setTenants(tenantList);
        const active = tenantList.find(t => t.id === activeId) || tenantList[0] || null;
        setActiveTenantState(active);
      } else {
        setTenants([]);
        setActiveTenantState(null);
      }
    } catch (err) {
      console.error('Error syncing backend state:', err);
      setTenants([]);
      setActiveTenantState(null);
      setCurrentUser(null);
      setOnboardingCompletedState(false);
    }
  };

  useEffect(() => {
    syncState().finally(() => setIsAuthReady(true));
  }, []);

  const switchTenant = (id: string) => {
    api.setOrganizationId(id);
    syncState();
  };

  const updateActiveTenant = (updatedTenant: Tenant) => {
    // Keep locally updated active state as well
    setActiveTenantState(updatedTenant);
  };

  const updateAllTenants = (updatedTenants: Tenant[]) => {
    setTenants(updatedTenants);
  };

  const registerNewTenant = async (
    accountDetails: { name: string; email: string; pass: string },
    hotelName: string,
    businessType: string,
    settings: Partial<TenantSettings>,
    branding: Partial<TenantBranding>,
    rooms: Room[],
    websiteTemplate: 'luxury' | 'modern' | 'boutique' | 'minimal'
  ): Promise<Tenant> => {
    const typeMap: Record<string, string> = {
      'Boutique Hotel': 'BOUTIQUE',
      'Resort & Spa': 'RESORT',
      'Homestay / Villa': 'HOMESTAY',
      'Business Hotel': 'HOTEL'
    };
    const bType = typeMap[businessType] || 'OTHER';
    const orgSlug = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // 1. Onboard core tenant (User + Org + Business)
    await api.registerOnboard({
      userName: accountDetails.name,
      email: accountDetails.email,
      password: accountDetails.pass,
      orgName: hotelName,
      orgSlug,
      businessName: hotelName,
      businessType: bType,
      businessPhone: settings.phone || '+91 99999 88888',
      businessAddress: settings.address || 'Address',
      businessCity: settings.city || 'City',
      businessCountry: settings.country || 'India',
      currency: settings.currency || 'INR',
      timezone: settings.timezone || 'IST (UTC+5:30)'
    });

    // 2. Setup public website theme sections
    const sections = [
      { id: 'hero', type: 'hero' as const, title: 'Welcome Page', visible: true, content: { headline: `Relax at ${hotelName}`, subheadline: `Experience exceptional hospitality at our property.`, ctaText: 'Check Availability', bgImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85' } },
      { id: 'about', type: 'about' as const, title: 'Our Story', visible: true, content: { text: settings.description || `Welcome to ${hotelName}. We are dedicated to providing our guests with top-tier relaxation and service.` } },
      { id: 'rooms', type: 'rooms' as const, title: 'Suites & Sanctums', visible: true, content: { subheading: 'Thoughtfully crafted spaces designed for absolute comfort.' } },
      { id: 'amenities', type: 'amenities' as const, title: 'Resort Experiences', visible: true, content: { list: 'Free Wi-Fi, Air Conditioning, Guest Services, Pool Access' } },
      { id: 'gallery', type: 'gallery' as const, title: 'Visual Gallery', visible: true, content: { img1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', img2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80' } },
      { id: 'testimonials', type: 'testimonials' as const, title: 'Guest Feedback', visible: true, content: { quote: 'An absolute dream stay. Excellent rooms and concierge service.', author: 'Happy Guest' } },
      { id: 'location', type: 'location' as const, title: 'Resort Coordinates', visible: true, content: { address: settings.address || settings.city || 'India', embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(settings.address || settings.city || "")}&output=embed` } },
      { id: 'footer', type: 'footer' as const, title: 'Footer Details', visible: true, content: { copyright: `© 2026 ${hotelName}. Powered by StayOS.` } }
    ];

    await api.createWebsiteProfile({
      templateId: websiteTemplate,
      theme: {
        primaryColor: branding.primaryColor || '#0f766e',
        secondaryColor: branding.secondaryColor || '#0d9488',
        font: branding.font || 'outfit',
        buttonStyle: branding.buttonStyle || 'rounded-full'
      },
      sections,
      subdomain: orgSlug,
      published: true
    });

    // 3. Create room inventory
    for (const r of rooms) {
      const rtRes = await api.createRoomType({
        name: r.name,
        description: r.type,
        capacity: r.maxGuests,
        pricePerNight: r.basePrice,
        amenities: r.amenities,
        images: [r.image]
      });

      // Create physical room instances under this category
      const rtId = rtRes.data.id || rtRes.data._id;
      for (let i = 0; i < r.count; i++) {
        await api.createRoom({
          roomTypeId: rtId,
          roomNumber: String(100 + i + 1),
          status: 'available',
          floor: 1
        });
      }
    }

    // Refresh context and return newly synced tenant
    await syncState();
    const all = getTenants(); // fallback logic
    return all.find(t => t.subdomain === orgSlug) || all[0];
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
    if (!activeTenant) throw new Error("No active hotel profile");

    // Fetch physical rooms list to find matching number
    const roomsRes = await api.request('/rooms');
    const physicalRooms = roomsRes.data || [];
    let selectedRoom = physicalRooms.find((r: any) => r.roomNumber === bookingData.roomNumber);

    if (!selectedRoom && physicalRooms.length > 0) {
      selectedRoom = physicalRooms[0];
    }
    if (!selectedRoom) {
      throw new Error("No rooms configured in the property. Please setup rooms first.");
    }

    const [firstName, ...rest] = bookingData.guestName.split(' ');
    const lastName = rest.join(' ') || 'Guest';

    const bRes = await api.createBooking({
      guestDetails: {
        firstName,
        lastName,
        email: bookingData.guestId.includes('@') ? bookingData.guestId : 'guest@stayos.com',
        phone: !bookingData.guestId.includes('@') ? bookingData.guestId : '+91 99999 88888',
        country: 'India'
      },
      roomId: selectedRoom.id || selectedRoom._id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      numberOfGuests: bookingData.guestsCount || 2,
      notes: bookingData.notes || '',
      source: 'DASHBOARD'
    });

    await syncState();
    
    // Map response to match frontend Booking
    return {
      ...bookingData,
      id: bRes.data.id || bRes.data._id,
      createdAt: new Date().toISOString()
    };
  };

  const updateBooking = async (updatedBooking: Booking): Promise<void> => {
    if (!activeTenant) return;
    
    // Resolve status values to backend capital enum values
    const bookingStatus = updatedBooking.status.toUpperCase().replace('-', '_');
    const paymentStatus = updatedBooking.paymentStatus.toUpperCase();

    await api.updateBooking(updatedBooking.id, {
      notes: updatedBooking.notes,
      bookingStatus,
      paymentStatus
    });

    // Handle checkin/checkout endpoints explicitly if triggered
    if (updatedBooking.status === 'checked-in') {
      await api.checkInBooking(updatedBooking.id).catch(() => {});
    } else if (updatedBooking.status === 'checked-out') {
      await api.checkOutBooking(updatedBooking.id).catch(() => {});
    } else if (updatedBooking.status === 'cancelled') {
      await api.cancelBooking(updatedBooking.id).catch(() => {});
    }

    await syncState();
  };

  const deleteBooking = async (bookingId: string): Promise<void> => {
    await api.deleteBooking(bookingId);
    await syncState();
  };

  const addGuest = async (guestData: Omit<Guest, 'id'>): Promise<Guest> => {
    const [firstName, ...rest] = guestData.name.split(' ');
    const lastName = rest.join(' ') || 'Guest';

    const res = await api.createGuest({
      firstName,
      lastName,
      email: guestData.email,
      phone: guestData.phone,
      country: 'India',
      tags: guestData.tags || [],
      preferences: guestData.preferences,
      notes: guestData.notes
    });

    await syncState();
    return {
      ...guestData,
      id: res.data.id || res.data._id
    };
  };

  const updateGuest = async (updatedGuest: Guest): Promise<void> => {
    const [firstName, ...rest] = updatedGuest.name.split(' ');
    const lastName = rest.join(' ') || 'Guest';

    await api.updateGuest(updatedGuest.id, {
      firstName,
      lastName,
      email: updatedGuest.email,
      phone: updatedGuest.phone,
      tags: updatedGuest.tags,
      preferences: updatedGuest.preferences,
      notes: updatedGuest.notes
    });
    await syncState();
  };

  const addRoom = async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    // 1. Create RoomType
    const rtRes = await api.createRoomType({
      name: roomData.name,
      description: roomData.type,
      capacity: roomData.maxGuests,
      pricePerNight: roomData.basePrice,
      amenities: roomData.amenities,
      images: [roomData.image]
    });

    const rtId = rtRes.data.id || rtRes.data._id;

    // 2. Create physical room instances based on count
    for (let i = 0; i < roomData.count; i++) {
      await api.createRoom({
        roomTypeId: rtId,
        roomNumber: String(200 + Math.floor(Math.random() * 800)),
        status: 'available',
        floor: 1
      });
    }

    await syncState();
    return {
      ...roomData,
      id: rtId
    };
  };

  const updateRoom = async (updatedRoom: Room): Promise<void> => {
    await api.updateRoomType(updatedRoom.id, {
      name: updatedRoom.name,
      description: updatedRoom.type,
      capacity: updatedRoom.maxGuests,
      pricePerNight: updatedRoom.basePrice,
      amenities: updatedRoom.amenities,
      images: [updatedRoom.image]
    });
    await syncState();
  };

  const deleteRoom = async (roomId: string): Promise<void> => {
    if (!activeTenant) return;

    // Fetch physical rooms list
    const roomsRes = await api.getRooms();
    const physical = (roomsRes.data || []).filter((r: any) => r.roomTypeId === roomId);

    // Delete associated physical rooms first
    for (const r of physical) {
      await api.deleteRoom(r.id || r._id).catch(() => {});
    }

    // Delete Room Type
    await api.deleteRoomType(roomId);
    await syncState();
  };

  const addMessage = async (conversationId: string, sender: 'guest' | 'staff' | 'ai', text: string): Promise<void> => {
    if (sender === 'staff') {
      await api.addStaffMessage(conversationId, sender, text);
    } else {
      // Simulate guest + ai reply
      if (activeTenant) {
        const activeChat = activeTenant.conversations.find(c => c.id === conversationId);
        if (activeChat) {
          await api.sendGuestMessage(activeChat.guestName, activeChat.guestPhone, text);
        }
      }
    }
    await syncState();
  };

  const createConversation = async (guestName: string, guestPhone: string): Promise<Conversation> => {
    const res = await api.sendGuestMessage(guestName, guestPhone, 'Initial message');
    await syncState();
    return {
      id: res.data.id || res.data._id,
      guestName,
      guestPhone,
      unread: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      messages: []
    };
  };

  const updateConversationStatus = async (id: string, status: 'active' | 'resolved' | 'escalated'): Promise<void> => {
    await api.updateConversationStatus(id, status);
    await syncState();
  };

  const updateWebsiteTheme = async (website: WebsiteTheme): Promise<void> => {
    await api.updateWebsiteProfile({
      templateId: website.template,
      sections: website.sections
    });
    await syncState();
  };

  const updateBranding = async (branding: TenantBranding): Promise<void> => {
    await api.updateWebsiteProfile({
      theme: {
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        font: branding.font,
        buttonStyle: branding.buttonStyle
      }
    });
    await syncState();
  };

  const updateSettings = async (settings: TenantSettings): Promise<void> => {
    await api.updateBusinessProfile({
      address: settings.address,
      city: settings.city,
      country: settings.country,
      currency: settings.currency,
      timezone: settings.timezone,
      checkInTime: settings.checkInTime,
      checkOutTime: settings.checkOutTime,
      wifiPassword: settings.wifiPassword,
      breakfastPolicy: settings.breakfastPolicy,
      description: settings.description,
      cancellationPolicy: settings.cancellationPolicy,
      phone: settings.phone,
      email: settings.email
    });
    await syncState();
  };

  const addTeamMember = async (_memberData: Omit<TeamMember, 'id'>): Promise<void> => {
    // Backend has no separate team endpoints, mock locally by keeping local updates
    await syncState();
  };

  const updateTeamMember = async (_updatedMember: TeamMember): Promise<void> => {
    await syncState();
  };

  const deleteTeamMember = async (_id: string): Promise<void> => {
    await syncState();
  };

  const triggerOnboardingState = (completed: boolean) => {
    setOnboardingCompletedState(completed);
    if (completed) {
      localStorage.setItem("stayos_v1_onboarding_completed", "true");
    } else {
      localStorage.removeItem("stayos_v1_onboarding_completed");
    }
  };

  const handleLogout = () => {
    api.clearSession();
    setTenants([]);
    setActiveTenantState(null);
    setCurrentUser(null);
    setOnboardingCompletedState(false);
  };

  const resetAll = () => {
    api.clearSession();
    syncState();
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      tenants,
      activeTenant: activeTenant!,
      currentUser,
      onboardingCompleted,
      switchTenant,
      syncState,
      updateActiveTenant,
      updateAllTenants,
      registerNewTenant,
      addBooking,
      updateBooking,
      deleteBooking,
      addGuest,
      updateGuest,
      addRoom,
      updateRoom,
      deleteRoom,
      addMessage,
      createConversation,
      updateConversationStatus,
      updateWebsiteTheme,
      updateBranding,
      updateSettings,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      triggerOnboardingState,
      handleLogout,
      resetAll
    }}>
      {(!currentUser || activeTenant) && children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
