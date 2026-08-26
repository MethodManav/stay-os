export interface TenantBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  font: 'sans' | 'serif' | 'outfit';
  buttonStyle: 'rounded-full' | 'rounded-md' | 'square';
}

export interface TenantSettings {
  address: string;
  city: string;
  country: string;
  currency: string;
  timezone: string;
  checkInTime: string;
  checkOutTime: string;
  wifiPassword: string;
  breakfastPolicy: 'included' | 'paid' | 'none';
  description: string;
  cancellationPolicy: string;
  phone: string;
  email: string;
  subscriptionTier?: 'free' | 'premium';
}

export interface Room {
  id: string;
  name: string;
  type: string;
  maxGuests: number;
  basePrice: number;
  count: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
  images: string[];
}

export interface Booking {
  id: string;
  guestId: string;
  guestName: string;
  roomType: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  amountPaid: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  guestsCount: number;
  notes: string;
  paymentMethod: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: ('VIP' | 'Returning Guest' | 'Corporate' | 'Family' | 'International' | 'High Value')[];
  notes: string;
  preferences: string;
  totalBookings: number;
  totalSpending: number;
  lastVisit: string;
}

export interface Message {
  id: string;
  sender: 'guest' | 'staff' | 'ai';
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  guestName: string;
  guestPhone: string;
  messages: Message[];
  unread: boolean;
  status: 'active' | 'resolved' | 'escalated';
  createdAt: string;
  leads?: { email?: string; notes?: string };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
}

export interface WebsiteSection {
  id: string;
  type: 'hero' | 'about' | 'rooms' | 'amenities' | 'gallery' | 'testimonials' | 'location' | 'contact' | 'footer';
  title: string;
  visible: boolean;
  content: Record<string, string>;
}

export interface WebsiteTheme {
  template: 'luxury' | 'modern' | 'boutique' | 'minimal';
  sections: WebsiteSection[];
}

export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  status?: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  branding: TenantBranding;
  settings: TenantSettings;
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  conversations: Conversation[];
  team: TeamMember[];
  website: WebsiteTheme;
}

export interface SaaSUser {
  id: string;
  name: string;
  email: string;
  tenants: { tenantId: string; role: string }[];
}

