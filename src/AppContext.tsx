import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Tenant, 
  SaaSUser, 
  Booking, 
  Guest, 
  Room, 
  Message, 
  Conversation, 
  WebsiteTheme, 
  TenantBranding, 
  TenantSettings, 
  TeamMember
} from './db';
import {
  getTenants,
  setActiveTenantId,
  getActiveTenant,
  saveActiveTenant,
  getSaaSUser,
  getOnboardingCompleted,
  setOnboardingCompleted,
  createNewTenant,
  resetToDefaults
} from './db';

interface AppContextType {
  tenants: Tenant[];
  activeTenant: Tenant;
  currentUser: SaaSUser | null;
  onboardingCompleted: boolean;
  switchTenant: (id: string) => void;
  updateActiveTenant: (tenant: Tenant) => void;
  registerNewTenant: (
    hotelName: string,
    businessType: string,
    settings: Partial<TenantSettings>,
    branding: Partial<TenantBranding>,
    rooms: Room[],
    websiteTemplate: 'luxury' | 'modern' | 'boutique' | 'minimal'
  ) => Tenant;
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  addGuest: (guestData: Omit<Guest, 'id'>) => Guest;
  updateGuest: (guest: Guest) => void;
  addRoom: (roomData: Omit<Room, 'id'>) => Room;
  updateRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;
  addMessage: (conversationId: string, sender: 'guest' | 'staff' | 'ai', text: string) => void;
  createConversation: (guestName: string, guestPhone: string) => Conversation;
  updateConversationStatus: (id: string, status: 'active' | 'resolved' | 'escalated') => void;
  updateWebsiteTheme: (website: WebsiteTheme) => void;
  updateBranding: (branding: TenantBranding) => void;
  updateSettings: (settings: TenantSettings) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
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

  // Sync state from storage
  const syncState = () => {
    const allTenants = getTenants();
    const active = getActiveTenant();
    const user = getSaaSUser();
    const onboarded = getOnboardingCompleted();

    setTenants(allTenants);
    setActiveTenantState(active);
    setCurrentUser(user);
    setOnboardingCompletedState(onboarded);
  };

  useEffect(() => {
    syncState();
    
    // Listen for cross-tab updates (e.g. public guest booking syncs with manager)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "stayos_v1_tenants" || e.key === "stayos_v1_active_tenant_id") {
        syncState();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const switchTenant = (id: string) => {
    setActiveTenantId(id);
    const active = getActiveTenant();
    setActiveTenantState(active);
  };

  const updateActiveTenant = (updatedTenant: Tenant) => {
    saveActiveTenant(updatedTenant);
    setActiveTenantState(updatedTenant);
    setTenants(getTenants());
  };

  const registerNewTenant = (
    hotelName: string,
    businessType: string,
    settings: Partial<TenantSettings>,
    branding: Partial<TenantBranding>,
    rooms: Room[],
    websiteTemplate: 'luxury' | 'modern' | 'boutique' | 'minimal'
  ) => {
    const newT = createNewTenant(hotelName, businessType, settings, branding, rooms, websiteTemplate);
    syncState();
    return newT;
  };

  // Connected Operations
  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    if (!activeTenant) throw new Error("No active hotel profile");
    
    const newBookingId = `B-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newBookingId,
      createdAt: new Date().toISOString()
    };

    // 1. Add booking
    const updatedBookings = [newBooking, ...activeTenant.bookings];

    // 2. Add or update guest in CRM
    let updatedGuests = [...activeTenant.guests];
    let guest = updatedGuests.find(g => g.email === bookingData.guestId || g.phone === bookingData.guestId);
    
    if (!guest) {
      // Create guest
      const newGuestId = `gst-${Date.now()}`;
      const newGuest: Guest = {
        id: newGuestId,
        name: bookingData.guestName,
        email: bookingData.guestId.includes('@') ? bookingData.guestId : "",
        phone: !bookingData.guestId.includes('@') ? bookingData.guestId : "",
        tags: bookingData.amountPaid > 15000 ? ["High Value", "VIP"] : ["Returning Guest"],
        notes: bookingData.notes || "",
        preferences: "Standard booking preferences.",
        totalBookings: 1,
        totalSpending: bookingData.amountPaid,
        lastVisit: bookingData.checkIn
      };
      updatedGuests.unshift(newGuest);
    } else {
      // Update guest spends
      guest.totalBookings += 1;
      guest.totalSpending += bookingData.amountPaid;
      guest.lastVisit = bookingData.checkIn;
    }

    // 3. Update room status to occupied if reservation is checked-in today
    let updatedRooms = [...activeTenant.rooms];
    if (newBooking.status === 'checked-in') {
      updatedRooms = updatedRooms.map(r => 
        r.type === newBooking.roomType ? { ...r, status: 'occupied' as const } : r
      );
    }

    // Save
    const nextTenant: Tenant = {
      ...activeTenant,
      bookings: updatedBookings,
      guests: updatedGuests,
      rooms: updatedRooms
    };
    updateActiveTenant(nextTenant);
    return newBooking;
  };

  const updateBooking = (updatedBooking: Booking) => {
    if (!activeTenant) return;
    const bookings = activeTenant.bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    
    // Sync guest record totals
    let guests = [...activeTenant.guests];
    const guest = guests.find(g => g.name === updatedBooking.guestName);
    if (guest && updatedBooking.status === 'cancelled') {
      guest.totalSpending = Math.max(0, guest.totalSpending - updatedBooking.amountPaid);
    }
    
    // Sync room availability
    let rooms = [...activeTenant.rooms];
    if (updatedBooking.status === 'checked-in') {
      rooms = rooms.map(r => r.type === updatedBooking.roomType ? { ...r, status: 'occupied' } : r);
    } else if (updatedBooking.status === 'checked-out' || updatedBooking.status === 'cancelled') {
      rooms = rooms.map(r => r.type === updatedBooking.roomType ? { ...r, status: 'available' } : r);
    }

    updateActiveTenant({
      ...activeTenant,
      bookings,
      guests,
      rooms
    });
  };

  const deleteBooking = (bookingId: string) => {
    if (!activeTenant) return;
    const bookings = activeTenant.bookings.filter(b => b.id !== bookingId);
    updateActiveTenant({ ...activeTenant, bookings });
  };

  const addGuest = (guestData: Omit<Guest, 'id'>): Guest => {
    if (!activeTenant) throw new Error("No active hotel profile");
    const newGuest: Guest = {
      ...guestData,
      id: `gst-${Date.now()}`
    };
    updateActiveTenant({
      ...activeTenant,
      guests: [newGuest, ...activeTenant.guests]
    });
    return newGuest;
  };

  const updateGuest = (updatedGuest: Guest) => {
    if (!activeTenant) return;
    const guests = activeTenant.guests.map(g => g.id === updatedGuest.id ? updatedGuest : g);
    updateActiveTenant({ ...activeTenant, guests });
  };

  const addRoom = (roomData: Omit<Room, 'id'>): Room => {
    if (!activeTenant) throw new Error("No active hotel profile");
    const newRoom: Room = {
      ...roomData,
      id: `rm-${Date.now()}`
    };
    updateActiveTenant({
      ...activeTenant,
      rooms: [...activeTenant.rooms, newRoom]
    });
    return newRoom;
  };

  const updateRoom = (updatedRoom: Room) => {
    if (!activeTenant) return;
    const rooms = activeTenant.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
    
    // Direct sync to website template pricing automatically!
    const website = { ...activeTenant.website };
    // Trigger render refresh
    updateActiveTenant({ ...activeTenant, rooms, website });
  };

  const deleteRoom = (roomId: string) => {
    if (!activeTenant) return;
    const rooms = activeTenant.rooms.filter(r => r.id !== roomId);
    updateActiveTenant({ ...activeTenant, rooms });
  };

  const addMessage = (conversationId: string, sender: 'guest' | 'staff' | 'ai', text: string) => {
    if (!activeTenant) return;
    const updatedConversations = activeTenant.conversations.map(c => {
      if (c.id === conversationId) {
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          sender,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...c,
          unread: sender === 'guest',
          lastMessageText: text,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    updateActiveTenant({
      ...activeTenant,
      conversations: updatedConversations
    });
  };

  const createConversation = (guestName: string, guestPhone: string): Conversation => {
    if (!activeTenant) throw new Error("No active hotel");
    
    const exist = activeTenant.conversations.find(c => c.guestPhone === guestPhone);
    if (exist) return exist;

    const newConv: Conversation = {
      id: `c-${Date.now()}`,
      guestName,
      guestPhone,
      unread: true,
      status: "active",
      createdAt: new Date().toISOString(),
      messages: []
    };

    updateActiveTenant({
      ...activeTenant,
      conversations: [newConv, ...activeTenant.conversations]
    });
    return newConv;
  };

  const updateConversationStatus = (id: string, status: 'active' | 'resolved' | 'escalated') => {
    if (!activeTenant) return;
    const conversations = activeTenant.conversations.map(c => 
      c.id === id ? { ...c, status, unread: false } : c
    );
    updateActiveTenant({ ...activeTenant, conversations });
  };

  const updateWebsiteTheme = (website: WebsiteTheme) => {
    if (!activeTenant) return;
    updateActiveTenant({ ...activeTenant, website });
  };

  const updateBranding = (branding: TenantBranding) => {
    if (!activeTenant) return;
    updateActiveTenant({ ...activeTenant, branding });
  };

  const updateSettings = (settings: TenantSettings) => {
    if (!activeTenant) return;
    updateActiveTenant({ ...activeTenant, settings });
  };

  const addTeamMember = (memberData: Omit<TeamMember, 'id'>) => {
    if (!activeTenant) return;
    const newMember: TeamMember = {
      ...memberData,
      id: `tm-${Date.now()}`
    };
    updateActiveTenant({
      ...activeTenant,
      team: [...activeTenant.team, newMember]
    });
  };

  const updateTeamMember = (updatedMember: TeamMember) => {
    if (!activeTenant) return;
    const team = activeTenant.team.map(t => t.id === updatedMember.id ? updatedMember : t);
    updateActiveTenant({ ...activeTenant, team });
  };

  const deleteTeamMember = (id: string) => {
    if (!activeTenant) return;
    const team = activeTenant.team.filter(t => t.id !== id);
    updateActiveTenant({ ...activeTenant, team });
  };

  const triggerOnboardingState = (completed: boolean) => {
    setOnboardingCompleted(completed);
    setOnboardingCompletedState(completed);
  };

  const handleLogout = () => {
    localStorage.removeItem("stayos_v1_onboarding_completed");
    syncState();
  };

  const resetAll = () => {
    resetToDefaults();
    syncState();
  };

  return (
    <AppContext.Provider value={{
      tenants,
      activeTenant: activeTenant!,
      currentUser,
      onboardingCompleted,
      switchTenant,
      updateActiveTenant,
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
      {activeTenant && children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
