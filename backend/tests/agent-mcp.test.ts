import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BusinessModel } from '../src/modules/businesses/models/BusinessModel';
import { OrganizationModel } from '../src/modules/organizations/models/OrganizationModel';
import { RoomTypeModel } from '../src/modules/rooms/models/RoomTypeModel';
import { RoomModel } from '../src/modules/rooms/models/RoomModel';
import { stayosMcpServer } from '../src/mcp/server';
import { geminiBookingAgent } from '../src/agent/agent';
import { hotelService } from '../src/services/hotelService';
import { TenantContext } from '../src/mcp/context';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

describe('StayOS AI-Powered Booking Agent & MCP Tools Suite', () => {
  jest.setTimeout(30000);
  let hotelAContext: TenantContext;
  let hotelBContext: TenantContext;
  let hotelAId: string;
  let hotelBId: string;
  let roomTypeA1Id: string;
  let roomTypeA2Id: string;
  let roomTypeB1Id: string;

  beforeEach(async () => {
    // 1. Create Organizations
    const testOwnerId = new Types.ObjectId();
    const orgA = await OrganizationModel.create({
      ownerId: testOwnerId,
      name: 'Taj Group Org',
      slug: 'taj-group',
      billingEmail: 'billing@taj.com',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE'
    });

    const orgB = await OrganizationModel.create({
      ownerId: testOwnerId,
      name: 'Paradise Group Org',
      slug: 'paradise-group',
      billingEmail: 'billing@paradise.com',
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIVE'
    });

    // 2. Create Hotels (Businesses)
    const hotelA = await BusinessModel.create({
      organizationId: orgA._id,
      name: 'Taj Gateway Resort',
      slug: 'taj-gateway',
      type: 'RESORT',
      description: 'Luxury resort by the beach',
      email: 'stay@tajgateway.com',
      phone: '+91 9876543210',
      address: 'Dumas Road',
      city: 'Surat',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.',
      amenities: ['Pool', 'WiFi', 'Spa', 'Breakfast'],
      subscriptionTier: 'premium',
      status: 'ACTIVE'
    });

    const hotelB = await BusinessModel.create({
      organizationId: orgB._id,
      name: 'Hotel Paradise Inn',
      slug: 'hotel-paradise',
      type: 'HOTEL',
      description: 'Comfort hotel in city center',
      email: 'stay@hotelparadise.com',
      phone: '+91 9123456780',
      address: 'Station Road',
      city: 'Ahmedabad',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      checkInTime: '12:00',
      checkOutTime: '10:00',
      cancellationPolicy: 'Strict non-refundable within 48 hours.',
      amenities: ['WiFi', 'Restaurant'],
      subscriptionTier: 'free',
      status: 'ACTIVE'
    });

    hotelAId = hotelA._id.toString();
    hotelBId = hotelB._id.toString();

    hotelAContext = {
      hotelId: hotelAId,
      organizationId: orgA._id.toString(),
      hotelSlug: 'taj-gateway',
      hotelName: 'Taj Gateway Resort',
      currency: 'INR'
    };

    hotelBContext = {
      hotelId: hotelBId,
      organizationId: orgB._id.toString(),
      hotelSlug: 'hotel-paradise',
      hotelName: 'Hotel Paradise Inn',
      currency: 'INR'
    };

    // 3. Create Room Types for Hotel A
    const rtA1 = await RoomTypeModel.create({
      organizationId: orgA._id,
      businessId: hotelA._id,
      name: 'Deluxe Room',
      description: 'Spacious deluxe room with sea view',
      capacity: 2,
      pricePerNight: 4000,
      amenities: ['King Bed', 'AC', 'Ocean View', 'Free WiFi']
    });

    const rtA2 = await RoomTypeModel.create({
      organizationId: orgA._id,
      businessId: hotelA._id,
      name: 'Executive Suite',
      description: 'Presidential suite with jacuzzi',
      capacity: 4,
      pricePerNight: 8500,
      amenities: ['2 Bedrooms', 'Jacuzzi', 'Balcony', 'Butler Service']
    });

    roomTypeA1Id = rtA1._id.toString();
    roomTypeA2Id = rtA2._id.toString();

    // Create 3 physical rooms for Deluxe Room (Hotel A)
    await RoomModel.create([
      { organizationId: orgA._id, businessId: hotelA._id, roomTypeId: rtA1._id, roomNumber: '101', status: 'available' },
      { organizationId: orgA._id, businessId: hotelA._id, roomTypeId: rtA1._id, roomNumber: '102', status: 'available' },
      { organizationId: orgA._id, businessId: hotelA._id, roomTypeId: rtA1._id, roomNumber: '103', status: 'available' }
    ]);

    // Create 1 physical room for Executive Suite (Hotel A)
    await RoomModel.create([
      { organizationId: orgA._id, businessId: hotelA._id, roomTypeId: rtA2._id, roomNumber: '201', status: 'available' }
    ]);

    // 4. Create Room Type for Hotel B
    const rtB1 = await RoomTypeModel.create({
      organizationId: orgB._id,
      businessId: hotelB._id,
      name: 'Standard Room B',
      description: 'Economy room',
      capacity: 2,
      pricePerNight: 2000,
      amenities: ['Double Bed', 'Free WiFi']
    });

    roomTypeB1Id = rtB1._id.toString();

    await RoomModel.create([
      { organizationId: orgB._id, businessId: hotelB._id, roomTypeId: rtB1._id, roomNumber: 'B-01', status: 'available' }
    ]);
  });

  // =========================================================================
  // TEST 1: Tenant Resolution & Security Isolation
  // =========================================================================
  describe('Tenant Resolution & Strict Scoping', () => {
    it('resolves hotel correctly by URL slug', async () => {
      const hotel = await hotelService.resolveHotelBySlug('taj-gateway');
      expect(hotel.id).toBe(hotelAId);
      expect(hotel.name).toBe('Taj Gateway Resort');
      expect(hotel.currency).toBe('INR');
    });

    it('rejects invalid or non-existent hotel slugs', async () => {
      await expect(hotelService.resolveHotelBySlug('non-existent-slug')).rejects.toThrow();
    });

    it('MCP searchRooms only returns rooms belonging to the authenticated tenant', async () => {
      const result = await stayosMcpServer.executeTool('searchRooms', {
        checkIn: '2026-09-20',
        checkOut: '2026-09-22',
        guests: 2
      }, hotelAContext);

      expect(result.rooms).toBeDefined();
      expect(result.rooms.length).toBe(2); // Deluxe and Executive

      const roomNames = result.rooms.map((r: any) => r.name);
      expect(roomNames).toContain('Deluxe Room');
      expect(roomNames).toContain('Executive Suite');
      expect(roomNames).not.toContain('Standard Room B'); // Hotel B room must NEVER appear
    });

    it('MCP getRoomDetails fails when tenant A tries to access tenant B room', async () => {
      // Hotel A tenant attempts to inspect Hotel B's room
      const result = await stayosMcpServer.executeTool('getRoomDetails', {
        roomId: roomTypeB1Id
      }, hotelAContext);

      expect(result.error).toBe(true);
      expect(result.message).toContain('Room not found');
    });
  });

  // =========================================================================
  // TEST 2: Availability & Room Details Tools
  // =========================================================================
  describe('Availability & Pricing Calculation', () => {
    it('calculates availability and nights correctly via checkAvailability', async () => {
      const result = await stayosMcpServer.executeTool('checkAvailability', {
        roomId: roomTypeA1Id,
        checkIn: '2026-09-20',
        checkOut: '2026-09-23' // 3 nights
      }, hotelAContext);

      expect(result.available).toBe(true);
      expect(result.availableRooms).toBe(3);
      expect(result.pricePerNight).toBe(4000);
      expect(result.nights).toBe(3);
      // Backend calculates 3 * 4000 = 12000 + 12% tax (1440) = 13440
      expect(result.totalPrice).toBe(13440);
    });

    it('rejects invalid check-in / check-out date ordering', async () => {
      const result = await stayosMcpServer.executeTool('checkAvailability', {
        roomId: roomTypeA1Id,
        checkIn: '2026-09-25',
        checkOut: '2026-09-20' // invalid: check-out before check-in
      }, hotelAContext);

      expect(result.error).toBe(true);
    });
  });

  // =========================================================================
  // TEST 3: Booking Creation, Backend Pricing & Double-Booking Prevention
  // =========================================================================
  describe('createBooking Tool & Safeguards', () => {
    it('creates booking with backend-calculated pricing ignoring LLM price manipulation', async () => {
      const bookingInput = {
        roomId: roomTypeA1Id,
        checkIn: '2026-09-20',
        checkOut: '2026-09-22', // 2 nights * 4000 = 8000 + 12% tax = 8960
        guests: 2,
        guest: {
          name: 'Manav Test',
          email: 'manav@example.com',
          phone: '9876543210'
        },
        // Attacker attempts to pass a fake price
        priceOverride: 100
      };

      const result = await stayosMcpServer.executeTool('createBooking', bookingInput, hotelAContext);

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.booking.confirmationCode).toMatch(/^STY-[A-Z0-9]{6}$/);
      expect(result.booking.pricing.pricePerNight).toBe(4000);
      expect(result.booking.pricing.subtotal).toBe(8000);
      expect(result.booking.pricing.total).toBe(8960); // Strictly calculated by backend
      expect(result.booking.hotelName).toBe('Taj Gateway Resort');
    });

    it('prevents double booking when all physical rooms are occupied for the date range', async () => {
      // Executive Suite (roomTypeA2Id) only has 1 physical room (room 201)
      const booking1 = await stayosMcpServer.executeTool('createBooking', {
        roomId: roomTypeA2Id,
        checkIn: '2026-10-01',
        checkOut: '2026-10-05',
        guests: 2,
        guest: { name: 'Guest One', email: 'one@example.com', phone: '1111111111' }
      }, hotelAContext);

      expect(booking1.success).toBe(true);

      // Attempt second booking overlapping same dates
      const booking2 = await stayosMcpServer.executeTool('createBooking', {
        roomId: roomTypeA2Id,
        checkIn: '2026-10-03',
        checkOut: '2026-10-07', // Overlaps Oct 3-5
        guests: 2,
        guest: { name: 'Guest Two', email: 'two@example.com', phone: '2222222222' }
      }, hotelAContext);

      expect(booking2.error).toBe(true);
      expect(booking2.message).toContain('No Executive Suite rooms are available');
    });

    it('refuses to book a room belonging to a different hotel', async () => {
      // Hotel A attempts to book Hotel B's room
      const result = await stayosMcpServer.executeTool('createBooking', {
        roomId: roomTypeB1Id,
        checkIn: '2026-09-20',
        checkOut: '2026-09-22',
        guests: 2,
        guest: { name: 'Hacker', email: 'hacker@example.com', phone: '9999999999' }
      }, hotelAContext);

      expect(result.error).toBe(true);
      expect(result.message).toContain('does not exist at this hotel');
    });
  });

  // =========================================================================
  // TEST 4: getBooking & cancelBooking Tools
  // =========================================================================
  describe('getBooking and cancelBooking Tools', () => {
    let createdBookingCode: string;

    beforeEach(async () => {
      const res = await stayosMcpServer.executeTool('createBooking', {
        roomId: roomTypeA1Id,
        checkIn: '2026-11-10',
        checkOut: '2026-11-12',
        guests: 2,
        guest: { name: 'Sarah Connor', email: 'sarah@skynet.com', phone: '9888877777' }
      }, hotelAContext);
      createdBookingCode = res.booking.confirmationCode;
    });

    it('retrieves booking using confirmation code and guest verification', async () => {
      const result = await stayosMcpServer.executeTool('getBooking', {
        bookingId: createdBookingCode,
        email: 'sarah@skynet.com'
      }, hotelAContext);

      expect(result.success).toBe(true);
      expect(result.booking.guest.email).toBe('sarah@skynet.com');
      expect(result.booking.roomName).toBe('Deluxe Room');
      expect(result.booking.bookingStatus).toBe('CONFIRMED');
    });

    it('prevents another hotel from inspecting booking (Tenant Isolation)', async () => {
      // Hotel B tenant attempts to retrieve Hotel A's booking
      const result = await stayosMcpServer.executeTool('getBooking', {
        bookingId: createdBookingCode
      }, hotelBContext);

      expect(result.error).toBe(true);
      expect(result.message).toContain('not found at this hotel');
    });

    it('cancels booking and enforces policy', async () => {
      const cancelResult = await stayosMcpServer.executeTool('cancelBooking', {
        bookingId: createdBookingCode,
        email: 'sarah@skynet.com',
        reason: 'Change of travel plans'
      }, hotelAContext);

      expect(cancelResult.success).toBe(true);
      expect(cancelResult.bookingStatus).toBe('CANCELLED');
      expect(cancelResult.refundStatus).toBe('FULL_REFUND_APPLICABLE');

      // Verify DB status is now CANCELLED
      const verify = await stayosMcpServer.executeTool('getBooking', {
        bookingId: createdBookingCode
      }, hotelAContext);

      expect(verify.booking.bookingStatus).toBe('CANCELLED');
    });
  });

  // =========================================================================
  // TEST 5: Full Conversational Agent Execution Loop
  // =========================================================================
  describe('Gemini Booking Agent Multi-Turn Orchestration', () => {
    it('answers amenity inquiries like Wi-Fi without triggering room search or room cards', async () => {
      const response = await geminiBookingAgent.handleMessage({
        tenant: hotelAContext,
        message: 'Do you have free Wi-Fi?'
      });

      expect(response.reply).toBeDefined();
      expect(response.reply.toLowerCase()).toMatch(/wi-fi|wifi|internet/i);
      // Ensure NO room cards or searchRooms tool calls are triggered
      const hasSearchTool = response.toolCallsExecuted.some(t => t.name === 'searchRooms');
      expect(hasSearchTool).toBe(false);
      expect(response.toolCallsExecuted.length).toBe(0);
    });

    it('handles natural language room inquiry and triggers searchRooms MCP tool', async () => {
      const response = await geminiBookingAgent.handleMessage({
        tenant: hotelAContext,
        message: 'What rooms do you have available from 2026-09-20 to 2026-09-22?'
      });

      expect(response.reply).toBeDefined();
      expect(response.reply.length).toBeGreaterThan(10);
      expect(response.toolCallsExecuted.length).toBeGreaterThan(0);
      expect(response.toolCallsExecuted[0].name).toBe('searchRooms');
    }, 15000);

    it('handles end-to-end natural reservation flow', async () => {
      const response = await geminiBookingAgent.handleMessage({
        tenant: hotelAContext,
        message: 'Please book a room for me from 2026-12-01 to 2026-12-03. My email is alex@travel.com and phone is 9876543210.',
        guestInfo: { name: 'Alex Traveler', email: 'alex@travel.com', phone: '9876543210' }
      });

      expect(response.reply).toBeDefined();
      expect(response.bookingDetails).toBeDefined();
      expect(response.bookingDetails.bookingStatus).toBe('CONFIRMED');
      expect(response.bookingDetails.confirmationCode).toMatch(/^STY-[A-Z0-9]{6}$/);
    }, 20000);
  });
});
