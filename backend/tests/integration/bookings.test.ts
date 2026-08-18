import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoUserRepository } from '../../src/modules/users/repositories/MongoUserRepository';
import { MongoRefreshTokenRepository } from '../../src/modules/auth/repositories/MongoRefreshTokenRepository';
import { MongoOrganizationRepository } from '../../src/modules/organizations/repositories/MongoOrganizationRepository';
import { MongoBusinessRepository } from '../../src/modules/businesses/repositories/MongoBusinessRepository';
import { MongoRoomTypeRepository } from '../../src/modules/rooms/repositories/MongoRoomTypeRepository';
import { MongoRoomRepository } from '../../src/modules/rooms/repositories/MongoRoomRepository';
import { MongoGuestRepository } from '../../src/modules/guests/repositories/MongoGuestRepository';
import { MongoBookingRepository } from '../../src/modules/bookings/repositories/MongoBookingRepository';
import { AuthService } from '../../src/modules/auth/services/AuthService';
import { BookingService } from '../../src/modules/bookings/services/BookingService';
import { ConflictError } from '../../src/core/errors/ConflictError';
import { NotFoundError } from '../../src/core/errors/NotFoundError';

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

describe('Booking & Tenant Isolation Integration Tests', () => {
  let authService: AuthService;
  let bookingService: BookingService;
  
  let userRepo: MongoUserRepository;
  let tokenRepo: MongoRefreshTokenRepository;
  let orgRepo: MongoOrganizationRepository;
  let businessRepo: MongoBusinessRepository;
  let roomTypeRepo: MongoRoomTypeRepository;
  let roomRepo: MongoRoomRepository;
  let guestRepo: MongoGuestRepository;
  let bookingRepo: MongoBookingRepository;

  // Context caches
  let tenantAOrgId: string;
  let tenantABusinessId: string;
  let tenantARoomId: string;

  let tenantBOrgId: string;
  let tenantBBusinessId: string;

  beforeEach(async () => {
    userRepo = new MongoUserRepository();
    tokenRepo = new MongoRefreshTokenRepository();
    orgRepo = new MongoOrganizationRepository();
    businessRepo = new MongoBusinessRepository();
    roomTypeRepo = new MongoRoomTypeRepository();
    roomRepo = new MongoRoomRepository();
    guestRepo = new MongoGuestRepository();
    bookingRepo = new MongoBookingRepository();

    authService = new AuthService(userRepo, tokenRepo, orgRepo, businessRepo);
    bookingService = new BookingService(bookingRepo, roomRepo, roomTypeRepo, guestRepo);

    // 1. Setup Tenant A
    const onboardA = await authService.registerAndOnboard({
      userName: 'Owner A',
      email: 'owner.a@stayos.com',
      passwordHash: 'pass123456',
      orgName: 'Tenant A Org',
      orgSlug: 'tenant-a',
      businessName: 'Hotel A Baga',
      businessType: 'HOTEL',
      businessPhone: '+91 88888 77777',
      businessAddress: 'Baga Road Goa',
      businessCity: 'Goa',
      businessCountry: 'India',
      currency: 'INR',
      timezone: 'IST'
    });

    tenantAOrgId = onboardA.organization.id;
    tenantABusinessId = onboardA.business.id;

    // Create RoomType A & Room A
    const rtA = await roomTypeRepo.create({
      organizationId: new mongoose.Types.ObjectId(tenantAOrgId),
      businessId: new mongoose.Types.ObjectId(tenantABusinessId),
      name: 'Deluxe Room',
      capacity: 2,
      pricePerNight: 3000,
      amenities: ['Wi-Fi'],
      images: []
    });

    const rA = await roomRepo.create({
      organizationId: new mongoose.Types.ObjectId(tenantAOrgId),
      businessId: new mongoose.Types.ObjectId(tenantABusinessId),
      roomTypeId: rtA.id as any,
      roomNumber: '101',
      status: 'available',
      floor: 1
    });
    tenantARoomId = rA.id;

    // 2. Setup Tenant B
    const onboardB = await authService.registerAndOnboard({
      userName: 'Owner B',
      email: 'owner.b@stayos.com',
      passwordHash: 'pass123456',
      orgName: 'Tenant B Org',
      orgSlug: 'tenant-b',
      businessName: 'Hotel B Calangute',
      businessType: 'RESORT',
      businessPhone: '+91 99999 55555',
      businessAddress: 'Calangute Goa',
      businessCity: 'Goa',
      businessCountry: 'India',
      currency: 'INR',
      timezone: 'IST'
    });

    tenantBOrgId = onboardB.organization.id;
    tenantBBusinessId = onboardB.business.id;

    // Create RoomType B & Room B
    const rtB = await roomTypeRepo.create({
      organizationId: new mongoose.Types.ObjectId(tenantBOrgId),
      businessId: new mongoose.Types.ObjectId(tenantBBusinessId),
      name: 'Executive Suite',
      capacity: 3,
      pricePerNight: 6000,
      amenities: ['Wi-Fi', 'Pool'],
      images: []
    });

    await roomRepo.create({
      organizationId: new mongoose.Types.ObjectId(tenantBOrgId),
      businessId: new mongoose.Types.ObjectId(tenantBBusinessId),
      roomTypeId: rtB.id as any,
      roomNumber: '201',
      status: 'available',
      floor: 2
    });
  });

  it('should successfully create a booking for Tenant A and auto-onboard guest', async () => {
    const booking = await bookingService.createBooking(tenantAOrgId, tenantABusinessId, {
      guestDetails: {
        firstName: 'Guest',
        lastName: 'One',
        email: 'guest1@gmail.com',
        phone: '+91 90000 11111',
        country: 'India'
      },
      roomId: tenantARoomId,
      checkIn: '2026-09-01',
      checkOut: '2026-09-05',
      numberOfGuests: 2,
      source: 'DASHBOARD'
    });

    expect(booking).toBeDefined();
    expect(booking.pricing.subtotal).toBe(12000); // 4 nights * 3000 = 12000
    expect(booking.pricing.total).toBeGreaterThan(12000); // Including 12% default tax
    expect(booking.bookingStatus).toBe('CONFIRMED');

    // Verify Guest profile is created
    const guest = await guestRepo.findByEmail(tenantAOrgId, 'guest1@gmail.com');
    expect(guest).toBeDefined();
    expect(guest!.name).toBe('Guest One');
    expect(guest!.totalBookings).toBe(1);
    expect(guest!.totalSpent).toBe(booking.pricing.total);
  });

  it('should prevent room double bookings for overlapping date ranges', async () => {
    // Create initial booking: Sep 1st - Sep 5th
    await bookingService.createBooking(tenantAOrgId, tenantABusinessId, {
      guestDetails: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@gmail.com',
        phone: '+91 90000 22222'
      },
      roomId: tenantARoomId,
      checkIn: '2026-09-01',
      checkOut: '2026-09-05',
      numberOfGuests: 1
    });

    // Attempt overlapping check-in (e.g. Sep 3rd - Sep 7th) -> Should fail
    await expect(
      bookingService.createBooking(tenantAOrgId, tenantABusinessId, {
        guestDetails: {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@gmail.com',
          phone: '+91 90000 33333'
        },
        roomId: tenantARoomId,
        checkIn: '2026-09-03',
        checkOut: '2026-09-07',
        numberOfGuests: 2
      })
    ).rejects.toThrow(ConflictError);

    // Attempt non-overlapping booking (e.g. Sep 5th - Sep 10th) -> Should succeed
    const okBooking = await bookingService.createBooking(tenantAOrgId, tenantABusinessId, {
      guestDetails: {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@gmail.com',
        phone: '+91 90000 33333'
      },
      roomId: tenantARoomId,
      checkIn: '2026-09-05',
      checkOut: '2026-09-10',
      numberOfGuests: 2
    });
    expect(okBooking).toBeDefined();
  });

  it('should guarantee tenant data isolation - Tenant B cannot list or get Tenant A bookings', async () => {
    // 1. Create booking under Tenant A
    const bookingA = await bookingService.createBooking(tenantAOrgId, tenantABusinessId, {
      guestDetails: {
        firstName: 'TenantA',
        lastName: 'Guest',
        email: 'aguest@stayos.com',
        phone: '+91 90000 44444'
      },
      roomId: tenantARoomId,
      checkIn: '2026-09-01',
      checkOut: '2026-09-05',
      numberOfGuests: 1
    });

    // 2. Query bookings using Tenant B Org context -> should return empty list
    const bookingsForB = await bookingService.getBookings(tenantBOrgId);
    expect(bookingsForB.length).toBe(0);

    // 3. Attempt to fetch Tenant A's booking by ID using Tenant B Org context -> should throw NotFoundError
    await expect(
      bookingService.getBookingById(tenantBOrgId, bookingA.id)
    ).rejects.toThrow(NotFoundError);

    // 4. Attempt to update Tenant A's booking using Tenant B Org context -> should throw NotFoundError
    await expect(
      bookingService.updateBooking(tenantBOrgId, bookingA.id, { notes: 'Hack note' })
    ).rejects.toThrow(NotFoundError);

    // 5. Attempt to check in Tenant A's booking using Tenant B Org context -> should throw NotFoundError
    await expect(
      bookingService.checkIn(tenantBOrgId, bookingA.id)
    ).rejects.toThrow(NotFoundError);
  });
});
