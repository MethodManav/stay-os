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
  image: string;
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

// -------------------------------------------------------------
// Seed Data: Default Hotel - Azure Haven Resort
// -------------------------------------------------------------
const defaultAzureHaven: Tenant = {
  id: "tenant-azure-haven",
  subdomain: "azure-haven",
  name: "Azure Haven Resort",
  branding: {
    primaryColor: "#0f766e", // Teal-700
    secondaryColor: "#0d9488", // Teal-600
    font: "outfit",
    buttonStyle: "rounded-full"
  },
  settings: {
    address: "Calangute-Baga Road, Near Baga Creek",
    city: "Goa",
    country: "India",
    currency: "INR",
    timezone: "IST (UTC+5:30)",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    wifiPassword: "azurehaven_guests",
    breakfastPolicy: "included",
    description: "A premium luxury resort nestled by the beach in Goa. Experience coastal fine dining, bespoke hospitality, and private infinity pools.",
    cancellationPolicy: "Free cancellation up to 48 hours before check-in. Late cancellations will be charged the first night.",
    phone: "+91 98765 00123",
    email: "reservations@azurehavengoa.com",
    subscriptionTier: "premium"
  },
  rooms: [
    {
      id: "rm-1",
      name: "Deluxe Ocean Room",
      type: "Deluxe Room",
      maxGuests: 2,
      basePrice: 3499,
      count: 15,
      status: "available",
      amenities: ["Ocean View", "King Bed", "High-speed Wi-Fi", "Minibar", "Air Conditioning"],
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85"
    },
    {
      id: "rm-2",
      name: "Azure Premium Suite",
      type: "Premium Suite",
      maxGuests: 3,
      basePrice: 6999,
      count: 8,
      status: "available",
      amenities: ["Private Jacuzzi", "Ocean View", "Balcony", "Coffee Machine", "King Bed", "Minibar"],
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=85"
    },
    {
      id: "rm-3",
      name: "Coastal Family Room",
      type: "Family Room",
      maxGuests: 5,
      basePrice: 5499,
      count: 10,
      status: "available",
      amenities: ["2 Double Beds", "Garden View", "Kitchenette", "High-speed Wi-Fi", "Television"],
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=85"
    }
  ],
  bookings: [
    {
      id: "B-2001",
      guestId: "gst-1",
      guestName: "Rahul Sharma",
      roomType: "Deluxe Room",
      roomNumber: "102",
      checkIn: "2026-08-16",
      checkOut: "2026-08-20",
      status: "checked-in",
      amountPaid: 13996,
      paymentStatus: "paid",
      guestsCount: 2,
      notes: "Anniversary celebration. Requested ocean facing room.",
      paymentMethod: "Razorpay",
      createdAt: "2026-08-10T12:00:00Z"
    },
    {
      id: "B-2002",
      guestId: "gst-2",
      guestName: "Amit Patel",
      roomType: "Premium Suite",
      roomNumber: "204",
      checkIn: "2026-08-18",
      checkOut: "2026-08-22",
      status: "confirmed",
      amountPaid: 27996,
      paymentStatus: "paid",
      guestsCount: 2,
      notes: "Early check-in requested if possible.",
      paymentMethod: "Stripe",
      createdAt: "2026-08-15T09:30:00Z"
    },
    {
      id: "B-2003",
      guestId: "gst-3",
      guestName: "Sarah Connor",
      roomType: "Family Room",
      roomNumber: "108",
      checkIn: "2026-08-14",
      checkOut: "2026-08-18",
      status: "checked-out",
      amountPaid: 21996,
      paymentStatus: "paid",
      guestsCount: 4,
      notes: "Needed extra pillows.",
      paymentMethod: "Razorpay",
      createdAt: "2026-08-08T11:00:00Z"
    },
    {
      id: "B-2004",
      guestId: "gst-4",
      guestName: "Rajesh Iyer",
      roomType: "Deluxe Room",
      roomNumber: "103",
      checkIn: "2026-08-21",
      checkOut: "2026-08-23",
      status: "pending",
      amountPaid: 0,
      paymentStatus: "pending",
      guestsCount: 2,
      notes: "Awaiting payment verification.",
      paymentMethod: "Cash",
      createdAt: "2026-08-18T10:15:00Z"
    },
    {
      id: "B-2005",
      guestId: "gst-5",
      guestName: "Vikram Malhotra",
      roomType: "Premium Suite",
      roomNumber: "206",
      checkIn: "2026-08-24",
      checkOut: "2026-08-28",
      status: "confirmed",
      amountPaid: 27996,
      paymentStatus: "paid",
      guestsCount: 2,
      notes: "VIP guest. Complementary fruit basket.",
      paymentMethod: "Razorpay",
      createdAt: "2026-08-17T16:45:00Z"
    },
    {
      id: "B-2006",
      guestId: "gst-6",
      guestName: "Elena Rostova",
      roomType: "Deluxe Room",
      roomNumber: "105",
      checkIn: "2026-08-15",
      checkOut: "2026-08-17",
      status: "checked-out",
      amountPaid: 6998,
      paymentStatus: "paid",
      guestsCount: 1,
      notes: "International corporate traveler.",
      paymentMethod: "Stripe",
      createdAt: "2026-08-12T08:20:00Z"
    },
    {
      id: "B-2007",
      guestId: "gst-7",
      guestName: "Ananya Deshmukh",
      roomType: "Family Room",
      roomNumber: "110",
      checkIn: "2026-08-19",
      checkOut: "2026-08-22",
      status: "confirmed",
      amountPaid: 16497,
      paymentStatus: "paid",
      guestsCount: 5,
      notes: "Requested sea view floor.",
      paymentMethod: "Razorpay",
      createdAt: "2026-08-17T11:22:00Z"
    }
  ],
  guests: [
    {
      id: "gst-1",
      name: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      phone: "+91 99887 76655",
      tags: ["Returning Guest", "Family"],
      notes: "Prefers top floors. Always orders coastal curry.",
      preferences: "High floors, Extra towels",
      totalBookings: 3,
      totalSpending: 42000,
      lastVisit: "2026-08-16"
    },
    {
      id: "gst-2",
      name: "Amit Patel",
      email: "amit.patel@yahoo.com",
      phone: "+91 91234 56780",
      tags: ["High Value", "VIP"],
      notes: "Prefers the Premium Suite. Asks for private beach tours.",
      preferences: "Private check-in, Late checkout",
      totalBookings: 2,
      totalSpending: 56000,
      lastVisit: "2026-08-18"
    },
    {
      id: "gst-3",
      name: "Sarah Connor",
      email: "sconnor@cyberdyne.com",
      phone: "+1 310 555 1984",
      tags: ["International", "Family"],
      notes: "In Goa for relaxation. Very quiet. Excellent reviewer.",
      preferences: "Soft pillows, Airport pickup",
      totalBookings: 1,
      totalSpending: 21996,
      lastVisit: "2026-08-14"
    },
    {
      id: "gst-4",
      name: "Rajesh Iyer",
      email: "rajesh.iyer@tcs.com",
      phone: "+91 98300 12345",
      tags: ["Corporate"],
      notes: "Here on business. Requires invoice on company name.",
      preferences: "Desk setup, High speed Wi-Fi",
      totalBookings: 1,
      totalSpending: 0,
      lastVisit: "2026-08-21"
    },
    {
      id: "gst-5",
      name: "Vikram Malhotra",
      email: "v.malhotra@malhotragroup.in",
      phone: "+91 98111 22233",
      tags: ["VIP", "High Value"],
      notes: "CEO of Malhotra Group. Arrange executive lounge privileges.",
      preferences: "Express check-in, Wine upon arrival",
      totalBookings: 4,
      totalSpending: 124000,
      lastVisit: "2026-08-24"
    },
    {
      id: "gst-6",
      name: "Elena Rostova",
      email: "elena.rost@moscowmail.ru",
      phone: "+7 915 765 4321",
      tags: ["International", "High Value"],
      notes: "Stays for long weekends. Likes spa appointments.",
      preferences: "Hard mattress, Sea view rooms",
      totalBookings: 2,
      totalSpending: 38000,
      lastVisit: "2026-08-15"
    },
    {
      id: "gst-7",
      name: "Ananya Deshmukh",
      email: "ananya.d@gmail.com",
      phone: "+91 98888 77777",
      tags: ["Returning Guest", "Family"],
      notes: "Brings kids. Prefers pool access rooms.",
      preferences: "Ground floor, Crib availability",
      totalBookings: 3,
      totalSpending: 48500,
      lastVisit: "2026-08-19"
    }
  ],
  conversations: [
    {
      id: "c-1",
      guestName: "Rahul Sharma",
      guestPhone: "+91 99887 76655",
      status: "resolved",
      unread: false,
      createdAt: "2026-08-18T10:00:00Z",
      messages: [
        { id: "msg-1", sender: "guest", text: "What is your check-out time?", timestamp: "10:00 AM" },
        { id: "msg-2", sender: "ai", text: "Hello Rahul! Our check-out time is at 11:00 AM. If you require a late check-out, please let our team know and we will try our best to accommodate based on room availability.", timestamp: "10:00 AM" },
        { id: "msg-3", sender: "guest", text: "Perfect, thanks!", timestamp: "10:01 AM" }
      ]
    },
    {
      id: "c-2",
      guestName: "Sneha Reddy",
      guestPhone: "+91 88776 65544",
      status: "active",
      unread: true,
      createdAt: "2026-08-18T14:20:00Z",
      messages: [
        { id: "msg-4", sender: "guest", text: "Hi, do you provide breakfast? Is it veg?", timestamp: "02:20 PM" },
        { id: "msg-5", sender: "ai", text: "Hi Sneha! Yes, a delicious breakfast is fully included in the room price. We offer a wide range of options, including multiple local and continental vegetarian choices. It's served daily at our beachside bistro from 7:00 AM to 10:30 AM.", timestamp: "02:21 PM" },
        { id: "msg-6", sender: "guest", text: "How much is a Deluxe Ocean Room for tomorrow night?", timestamp: "02:22 PM" }
      ]
    },
    {
      id: "c-3",
      guestName: "John Doe",
      guestPhone: "+1 202 555 0143",
      status: "escalated",
      unread: true,
      createdAt: "2026-08-18T15:40:00Z",
      messages: [
        { id: "msg-7", sender: "guest", text: "I tried paying for my room service via the link but the payment is failing.", timestamp: "03:40 PM" },
        { id: "msg-8", sender: "ai", text: "I'm sorry to hear that, John. I have flagged your payment issue for our managers to review immediately. They will reach out to you shortly or you can pay at the counter during checkout.", timestamp: "03:41 PM" }
      ]
    }
  ],
  team: [
    { id: "tm-1", name: "Manav (You)", email: "manav@stayos.com", role: "owner" },
    { id: "tm-2", name: "Suresh Kumar", email: "suresh@azurehavengoa.com", role: "manager" },
    { id: "tm-3", name: "Kiran Naik", email: "kiran@azurehavengoa.com", role: "staff" }
  ],
  website: {
    template: "luxury",
    sections: [
      {
        id: "hero",
        type: "hero",
        title: "Welcome to Paradise",
        visible: true,
        content: {
          headline: "Unwind in Beachside Luxury",
          subheadline: "Indulge in Goa's finest coastal experience with private pools, pristine beaches, and unparalleled premium hospitality.",
          ctaText: "Book Your Escape",
          bgImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85"
        }
      },
      {
        id: "about",
        type: "about",
        title: "Our Story",
        visible: true,
        content: {
          text: "Located directly beside the crashing waves of Baga, Azure Haven Resort represents the pinnacle of Goan boutique luxury. We combine traditional warmth with modern design to provide our guests with an unforgettable coastal sanctuary."
        }
      },
      {
        id: "rooms",
        type: "rooms",
        title: "Suites & Sanctums",
        visible: true,
        content: {
          subheading: "Thoughtfully crafted spaces designed for absolute comfort."
        }
      },
      {
        id: "amenities",
        type: "amenities",
        title: "Resort Experiences",
        visible: true,
        content: {
          list: "Private Sand Beach, Ocean Infinity Pool, Ayurvedic Spa Center, Coastal Fine Dining, 24/7 Butler Service"
        }
      },
      {
        id: "gallery",
        type: "gallery",
        title: "Visual Gallery",
        visible: true,
        content: {
          img1: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
          img2: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
          img3: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
          img4: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80"
        }
      },
      {
        id: "testimonials",
        type: "testimonials",
        title: "Guest Appreciations",
        visible: true,
        content: {
          quote: "An absolute dream. The AI assistant answered our late-night requests in seconds, and the service was world-class. We will be back next summer!",
          author: "Sarah Connor, International Traveler"
        }
      },
      {
        id: "location",
        type: "location",
        title: "Beachfront Coordinates",
        visible: true,
        content: {
          address: "Calangute-Baga Road, Near Baga Creek, Goa, India",
          embedUrl: "https://maps.google.com/maps?q=Baga%20Beach%20Goa&t=&z=13&ie=UTF8&iwloc=&output=embed"
        }
      },
      {
        id: "footer",
        type: "footer",
        title: "Footer Section",
        visible: true,
        content: {
          copyright: "© 2026 Azure Haven Resort. Crafted with StayOS."
        }
      }
    ]
  }
};

// -------------------------------------------------------------
// Database Operations (Local Storage Wrappers)
// -------------------------------------------------------------
const TENANTS_KEY = "stayos_v1_tenants";
const LOGGED_IN_USER_KEY = "stayos_v1_user";
const ONBOARDING_COMPLETED_KEY = "stayos_v1_onboarding_completed";
const ACTIVE_TENANT_ID_KEY = "stayos_v1_active_tenant_id";

export const initializeDB = () => {
  if (!localStorage.getItem(TENANTS_KEY)) {
    localStorage.setItem(TENANTS_KEY, JSON.stringify([defaultAzureHaven]));
  }
  if (!localStorage.getItem(ACTIVE_TENANT_ID_KEY)) {
    localStorage.setItem(ACTIVE_TENANT_ID_KEY, "tenant-azure-haven");
  }
  if (!localStorage.getItem(ONBOARDING_COMPLETED_KEY)) {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
  }
  if (!localStorage.getItem(LOGGED_IN_USER_KEY)) {
    const mockUser: SaaSUser = {
      id: "usr-1",
      name: "Manav",
      email: "manav@stayos.com",
      tenants: [{ tenantId: "tenant-azure-haven", role: "owner" }]
    };
    localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(mockUser));
  }
};

export const getTenants = (): Tenant[] => {
  initializeDB();
  const raw = localStorage.getItem(TENANTS_KEY);
  return raw ? JSON.parse(raw) : [defaultAzureHaven];
};

export const saveTenants = (tenants: Tenant[]) => {
  localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
};

export const getActiveTenantId = (): string => {
  initializeDB();
  return localStorage.getItem(ACTIVE_TENANT_ID_KEY) || "tenant-azure-haven";
};

export const setActiveTenantId = (id: string) => {
  localStorage.setItem(ACTIVE_TENANT_ID_KEY, id);
};

export const getActiveTenant = (): Tenant => {
  const tenants = getTenants();
  const activeId = getActiveTenantId();
  return tenants.find(t => t.id === activeId) || tenants[0] || defaultAzureHaven;
};

export const saveActiveTenant = (tenant: Tenant) => {
  const tenants = getTenants();
  const updated = tenants.map(t => t.id === tenant.id ? tenant : t);
  saveTenants(updated);
};

export const getSaaSUser = (): SaaSUser | null => {
  initializeDB();
  const raw = localStorage.getItem(LOGGED_IN_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const saveSaaSUser = (user: SaaSUser) => {
  localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
};

export const getOnboardingCompleted = (): boolean => {
  initializeDB();
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
};

export const setOnboardingCompleted = (val: boolean) => {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, val ? "true" : "false");
};

// Seed a newly onboarded hotel
export const createNewTenant = (
  hotelName: string,
  businessType: string,
  settings: Partial<TenantSettings>,
  branding: Partial<TenantBranding>,
  rooms: Room[],
  websiteTemplate: 'luxury' | 'modern' | 'boutique' | 'minimal'
): Tenant => {
  const subdomain = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const newId = `tenant-${subdomain}-${Date.now()}`;
  
  const newTenant: Tenant = {
    id: newId,
    subdomain,
    name: hotelName,
    branding: {
      primaryColor: branding.primaryColor || "#0f766e",
      secondaryColor: branding.secondaryColor || "#0d9488",
      font: branding.font || "sans",
      buttonStyle: branding.buttonStyle || "rounded-full",
      logo: branding.logo
    },
    settings: {
      address: settings.address || "",
      city: settings.city || "",
      country: settings.country || "",
      currency: settings.currency || "INR",
      timezone: settings.timezone || "IST (UTC+5:30)",
      checkInTime: settings.checkInTime || "14:00",
      checkOutTime: settings.checkOutTime || "11:00",
      wifiPassword: settings.wifiPassword || "stayos_guests",
      breakfastPolicy: settings.breakfastPolicy || "included",
      description: settings.description || `Welcome to ${hotelName}. Powered by StayOS.`,
      cancellationPolicy: settings.cancellationPolicy || "Free cancellation 24 hours prior to check-in.",
      phone: settings.phone || "",
      email: settings.email || "",
      subscriptionTier: settings.subscriptionTier || "free"
    },
    rooms: rooms.map((r, i) => ({ ...r, id: `rm-${i}-${Date.now()}` })),
    bookings: [],
    guests: [],
    conversations: [
      {
        id: `c-init-${Date.now()}`,
        guestName: "Guest Receptionist",
        guestPhone: "+91 99999 88888",
        status: "resolved",
        unread: false,
        createdAt: new Date().toISOString(),
        messages: [
          { id: "m-init-1", sender: "ai", text: `Hello! Welcome to ${hotelName}'s AI receptionist. How can I help you today?`, timestamp: "Just now" }
        ]
      }
    ],
    team: [
      { id: `tm-o-${Date.now()}`, name: "Owner Account", email: settings.email || "admin@hotel.com", role: "owner" }
    ],
    website: {
      template: websiteTemplate,
      sections: [
        {
          id: "hero",
          type: "hero",
          title: "Welcome Page",
          visible: true,
          content: {
            headline: `Relax at ${hotelName}`,
            subheadline: `Experience exceptional hospitality, curated rooms, and beautiful details at our ${businessType}.`,
            ctaText: "Check Availability",
            bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85"
          }
        },
        {
          id: "about",
          type: "about",
          title: "About Us",
          visible: true,
          content: {
            text: settings.description || `Welcome to ${hotelName}. We are dedicated to providing our guests with top-tier relaxation and unforgettable service.`
          }
        },
        {
          id: "rooms",
          type: "rooms",
          title: "Accommodation Options",
          visible: true,
          content: {
            subheading: "Browse our beautiful, fully equipped rooms designed for your pleasure."
          }
        },
        {
          id: "amenities",
          type: "amenities",
          title: "Amenities Offered",
          visible: true,
          content: {
            list: "Free Wi-Fi, Air Conditioning, Guest Services, Daily Housekeeping"
          }
        },
        {
          id: "gallery",
          type: "gallery",
          title: "Resort Gallery",
          visible: true,
          content: {
            img1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
            img2: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
            img3: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
            img4: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80"
          }
        },
        {
          id: "testimonials",
          type: "testimonials",
          title: "Guest Feedback",
          visible: true,
          content: {
            quote: `We loved our stay at ${hotelName}. Booking online was seamless and the room was perfect!`,
            author: "A Happy Guest"
          }
        },
        {
          id: "location",
          type: "location",
          title: "Our Location",
          visible: true,
          content: {
            address: settings.address || `${settings.city}, ${settings.country}`,
            embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(settings.address || settings.city || "")}&t=&z=13&ie=UTF8&iwloc=&output=embed`
          }
        },
        {
          id: "footer",
          type: "footer",
          title: "Footer details",
          visible: true,
          content: {
            copyright: `© 2026 ${hotelName}. Powered by StayOS.`
          }
        }
      ]
    }
  };

  const tenants = getTenants();
  saveTenants([...tenants, newTenant]);
  
  // Associate tenant with user
  const user = getSaaSUser();
  if (user) {
    user.tenants.push({ tenantId: newId, role: "owner" });
    saveSaaSUser(user);
  }
  
  // Set active tenant to the new one
  setActiveTenantId(newId);
  return newTenant;
};

// Reset to initial mock database state
export const resetToDefaults = () => {
  localStorage.removeItem(TENANTS_KEY);
  localStorage.removeItem(ACTIVE_TENANT_ID_KEY);
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  localStorage.removeItem(LOGGED_IN_USER_KEY);
  initializeDB();
};
