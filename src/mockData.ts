export interface HotelConfig {
  name: string;
  address: string;
  city: string;
  starRating: number;
  checkInTime: string;
  checkOutTime: string;
  wifiPassword: string;
  breakfastPolicy: 'included' | 'paid' | 'none';
  cancellationPolicy: string;
  connectedWhatsapp?: string; // Connected phone number if any
}

export interface RoomTypeSetup {
  id: string;
  name: string;
  maxGuests: number;
  basePrice: number;
  count: number;
}

export interface FloorSetup {
  floorNumber: number;
  roomTypes: RoomTypeSetup[];
}

export interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amountPaid: number;
  razorpayPaymentId: string;
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
  lastMessageText: string;
  timestamp: string;
  unread: boolean;
  escalated: boolean;
  messages: Message[];
}

// Initial mock setup for the 13-floor hotel
const defaultHotelConfig: HotelConfig = {
  name: "StayOS Grand Hotel",
  address: "77 Orchid Boulevard, Sector 4",
  city: "Mumbai",
  starRating: 4,
  checkInTime: "14:00",
  checkOutTime: "11:00",
  wifiPassword: "orchid_grand_guest",
  breakfastPolicy: "included",
  cancellationPolicy: "free cancellation up to 24 hours before check-in. late cancellations or no-shows will be charged the first night's rate.",
  connectedWhatsapp: "+1 (555) 019-9230"
};

// Generate room setups for 13 floors, 20 rooms per floor
const generateDefaultFloors = (): FloorSetup[] => {
  const floors: FloorSetup[] = [];
  for (let f = 1; f <= 13; f++) {
    floors.push({
      floorNumber: f,
      roomTypes: [
        { id: `f${f}-type1`, name: "Standard Single", maxGuests: 1, basePrice: 85, count: 8 },
        { id: `f${f}-type2`, name: "Deluxe Double", maxGuests: 2, basePrice: 130, count: 8 },
        { id: `f${f}-type3`, name: "Executive Suite", maxGuests: 4, basePrice: 260, count: 4 }
      ]
    });
  }
  return floors;
};

// Sample bookings in July 2026
const defaultBookings: Booking[] = [
  {
    id: "B-1001",
    guestName: "Arjun Mehta",
    roomNumber: "402",
    roomType: "Deluxe Double",
    checkIn: "2026-07-16",
    checkOut: "2026-07-20",
    status: "confirmed",
    amountPaid: 520,
    razorpayPaymentId: "pay_RzP91a8B3c"
  },
  {
    id: "B-1002",
    guestName: "Sarah Jenkins",
    roomNumber: "1105",
    roomType: "Executive Suite",
    checkIn: "2026-07-18",
    checkOut: "2026-07-22",
    status: "confirmed",
    amountPaid: 1040,
    razorpayPaymentId: "pay_RzP32b9C4d"
  },
  {
    id: "B-1003",
    guestName: "Rohan Deshmukh",
    roomNumber: "208",
    roomType: "Standard Single",
    checkIn: "2026-07-15",
    checkOut: "2026-07-17",
    status: "confirmed",
    amountPaid: 170,
    razorpayPaymentId: "pay_RzP43c0D5e"
  },
  {
    id: "B-1004",
    guestName: "Priya Sharma",
    roomNumber: "712",
    roomType: "Deluxe Double",
    checkIn: "2026-07-20",
    checkOut: "2026-07-25",
    status: "pending",
    amountPaid: 0,
    razorpayPaymentId: "unpaid"
  },
  {
    id: "B-1005",
    guestName: "Michael Chang",
    roomNumber: "104",
    roomType: "Standard Single",
    checkIn: "2026-07-14",
    checkOut: "2026-07-16",
    status: "confirmed",
    amountPaid: 170,
    razorpayPaymentId: "pay_RzP54d1E6f"
  },
  {
    id: "B-1006",
    guestName: "Aanya Sen",
    roomNumber: "903",
    roomType: "Deluxe Double",
    checkIn: "2026-07-19",
    checkOut: "2026-07-21",
    status: "cancelled",
    amountPaid: 260, // Refund pending
    razorpayPaymentId: "pay_RzP65e2F7g"
  },
  {
    id: "B-1007",
    guestName: "David Miller",
    roomNumber: "1202",
    roomType: "Executive Suite",
    checkIn: "2026-07-22",
    checkOut: "2026-07-26",
    status: "confirmed",
    amountPaid: 1040,
    razorpayPaymentId: "pay_RzP76f3G8h"
  }
];

// Sample conversations with mock history
const defaultConversations: Conversation[] = [
  {
    id: "c1",
    guestName: "Arjun Mehta",
    guestPhone: "+91 98765 43210",
    lastMessageText: "thank you, the wifi connected immediately.",
    timestamp: "20:05",
    unread: false,
    escalated: false,
    messages: [
      { id: "m1_1", sender: "guest", text: "hi, is there a wifi password for guests in room 402?", timestamp: "20:01" },
      { id: "m1_2", sender: "ai", text: "hello Arjun! yes, the wifi network is 'StayOS_Grand_Guest' and the password is 'orchid_grand_guest'. let me know if you face any issues.", timestamp: "20:02" },
      { id: "m1_3", sender: "guest", text: "thank you, the wifi connected immediately.", timestamp: "20:05" }
    ]
  },
  {
    id: "c2",
    guestName: "Sarah Jenkins",
    guestPhone: "+1 (555) 234-5678",
    lastMessageText: "is it possible to request a late checkout at 14:00 instead of 11:00 on the 22nd?",
    timestamp: "19:40",
    unread: true,
    escalated: true,
    messages: [
      { id: "m2_1", sender: "guest", text: "hello! we are arriving tomorrow. we wanted to ask: is breakfast included in our stay?", timestamp: "19:15" },
      { id: "m2_2", sender: "ai", text: "hi Sarah! yes, breakfast is fully included in your Executive Suite booking. it is served daily in the main lobby restaurant from 07:00 to 10:30.", timestamp: "19:16" },
      { id: "m2_3", sender: "guest", text: "perfect! also, on our departure date (22nd), is it possible to request a late checkout at 14:00 instead of 11:00?", timestamp: "19:40" }
    ]
  },
  {
    id: "c3",
    guestName: "Michael Chang",
    guestPhone: "+65 8123 4567",
    lastMessageText: "sorry for the delay, i am back in the room now.",
    timestamp: "18:10",
    unread: false,
    escalated: false,
    messages: [
      { id: "m3_1", sender: "guest", text: "can i request 2 extra pillows and a bottle of drinking water for room 104?", timestamp: "17:45" },
      { id: "m3_2", sender: "ai", text: "of course, Michael. i have registered this request. housekeeping will deliver 2 extra pillows and mineral water to room 104 shortly.", timestamp: "17:46" },
      { id: "m3_3", sender: "guest", text: "sorry for the delay, i am back in the room now.", timestamp: "18:10" }
    ]
  },
  {
    id: "c4",
    guestName: "David Miller",
    guestPhone: "+44 7911 123456",
    lastMessageText: "the razorpay checkout failed twice. can i pay at the counter instead?",
    timestamp: "15:30",
    unread: true,
    escalated: true,
    messages: [
      { id: "m4_1", sender: "guest", text: "hi, i am trying to pre-pay for the room service charge online via the whatsapp link.", timestamp: "15:28" },
      { id: "m4_2", sender: "guest", text: "the razorpay checkout failed twice. can i pay at the counter instead?", timestamp: "15:30" }
    ]
  },
  {
    id: "c5",
    guestName: "Priya Sharma",
    guestPhone: "+91 91234 56789",
    lastMessageText: "i will complete the payment tonight. thank you.",
    timestamp: "Yesterday",
    unread: false,
    escalated: false,
    messages: [
      { id: "m5_1", sender: "guest", text: "hi, i have a booking inquiry for room 712.", timestamp: "Yesterday" },
      { id: "m5_2", sender: "ai", text: "hello Priya! your reservation status is currently 'pending' payment. let me know if you need the booking link sent again.", timestamp: "Yesterday" },
      { id: "m5_3", sender: "guest", text: "i will complete the payment tonight. thank you.", timestamp: "Yesterday" }
    ]
  }
];

// Helper to initialize local storage
export const initializeStorage = () => {
  if (!localStorage.getItem("stayos_onboarding_completed")) {
    localStorage.setItem("stayos_onboarding_completed", "true"); // default true so user can inspect right away
  }
  if (!localStorage.getItem("stayos_hotel_config")) {
    localStorage.setItem("stayos_hotel_config", JSON.stringify(defaultHotelConfig));
  }
  if (!localStorage.getItem("stayos_floors")) {
    localStorage.setItem("stayos_floors", JSON.stringify(generateDefaultFloors()));
  }
  if (!localStorage.getItem("stayos_bookings")) {
    localStorage.setItem("stayos_bookings", JSON.stringify(defaultBookings));
  }
  if (!localStorage.getItem("stayos_conversations")) {
    localStorage.setItem("stayos_conversations", JSON.stringify(defaultConversations));
  }
};

// Fetchers
export const getHotelConfig = (): HotelConfig => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("stayos_hotel_config") || "{}");
};

export const saveHotelConfig = (config: HotelConfig) => {
  localStorage.setItem("stayos_hotel_config", JSON.stringify(config));
};

export const getFloors = (): FloorSetup[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("stayos_floors") || "[]");
};

export const saveFloors = (floors: FloorSetup[]) => {
  localStorage.setItem("stayos_floors", JSON.stringify(floors));
};

export const getBookings = (): Booking[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("stayos_bookings") || "[]");
};

export const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem("stayos_bookings", JSON.stringify(bookings));
};

export const getConversations = (): Conversation[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("stayos_conversations") || "[]");
};

export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem("stayos_conversations", JSON.stringify(conversations));
};

export const isOnboardingCompleted = (): boolean => {
  return localStorage.getItem("stayos_onboarding_completed") === "true";
};

export const setOnboardingCompleted = (val: boolean) => {
  localStorage.setItem("stayos_onboarding_completed", val ? "true" : "false");
};

// Reset function to clear storage and restore mock defaults
export const resetToDefaults = () => {
  localStorage.removeItem("stayos_onboarding_completed");
  localStorage.removeItem("stayos_hotel_config");
  localStorage.removeItem("stayos_floors");
  localStorage.removeItem("stayos_bookings");
  localStorage.removeItem("stayos_conversations");
  initializeStorage();
};
