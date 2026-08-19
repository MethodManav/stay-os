import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { MongoUserRepository } from '../../src/modules/users/repositories/MongoUserRepository';
import { MongoRefreshTokenRepository } from '../../src/modules/auth/repositories/MongoRefreshTokenRepository';
import { MongoOrganizationRepository } from '../../src/modules/organizations/repositories/MongoOrganizationRepository';
import { MongoBusinessRepository } from '../../src/modules/businesses/repositories/MongoBusinessRepository';
import { AuthService } from '../../src/modules/auth/services/AuthService';

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

describe('Room Types HTTP Router Integration Tests', () => {
  let authService: AuthService;
  let userRepo: MongoUserRepository;
  let tokenRepo: MongoRefreshTokenRepository;
  let orgRepo: MongoOrganizationRepository;
  let businessRepo: MongoBusinessRepository;

  let accessToken: string;
  let organizationId: string;

  beforeEach(async () => {
    userRepo = new MongoUserRepository();
    tokenRepo = new MongoRefreshTokenRepository();
    orgRepo = new MongoOrganizationRepository();
    businessRepo = new MongoBusinessRepository();
    authService = new AuthService(userRepo, tokenRepo, orgRepo, businessRepo);

    // Register and onboard Owner A
    const onboard = await authService.registerAndOnboard({
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

    accessToken = onboard.tokens.accessToken;
    organizationId = onboard.organization.id;
  });

  it('should successfully perform CRUD operations on room types', async () => {
    // 1. POST /api/v1/room-types (Create Room Type)
    const createRes = await request(app)
      .post('/api/v1/room-types')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-organization-id', organizationId)
      .send({
        name: 'Deluxe Suite',
        capacity: 2,
        pricePerNight: 5000,
        amenities: ['Wi-Fi', 'TV', 'AC'],
        images: ['https://example.com/deluxe.jpg']
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.name).toBe('Deluxe Suite');
    expect(createRes.body.data.pricePerNight).toBe(5000);

    const roomTypeId = createRes.body.data._id || createRes.body.data.id;
    expect(roomTypeId).toBeDefined();

    // 2. GET /api/v1/room-types (Get Many Room Types)
    const listRes = await request(app)
      .get('/api/v1/room-types')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-organization-id', organizationId);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].name).toBe('Deluxe Suite');

    // 3. GET /api/v1/room-types/:id (Get Single Room Type)
    const getSingleRes = await request(app)
      .get(`/api/v1/room-types/${roomTypeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-organization-id', organizationId);

    expect(getSingleRes.status).toBe(200);
    expect(getSingleRes.body.success).toBe(true);
    expect(getSingleRes.body.data.name).toBe('Deluxe Suite');

    // 4. PATCH /api/v1/room-types/:id (Update Room Type)
    const updateRes = await request(app)
      .patch(`/api/v1/room-types/${roomTypeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-organization-id', organizationId)
      .send({
        name: 'Super Deluxe Suite',
        pricePerNight: 6500
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.name).toBe('Super Deluxe Suite');
    expect(updateRes.body.data.pricePerNight).toBe(6500);

    // 5. DELETE /api/v1/room-types/:id (Delete Room Type)
    const deleteRes = await request(app)
      .delete(`/api/v1/room-types/${roomTypeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-organization-id', organizationId);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify deleted room type returns 404 on subsequent get
    const verifyGetRes = await request(app)
      .get(`/api/v1/room-types/${roomTypeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-organization-id', organizationId);

    expect(verifyGetRes.status).toBe(404);
  });
});
