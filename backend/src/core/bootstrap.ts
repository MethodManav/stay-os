

// Repositories
import { MongoUserRepository } from '../modules/users/repositories/MongoUserRepository';
import { MongoRefreshTokenRepository } from '../modules/auth/repositories/MongoRefreshTokenRepository';
import { MongoOrganizationRepository } from '../modules/organizations/repositories/MongoOrganizationRepository';
import { MongoBusinessRepository } from '../modules/businesses/repositories/MongoBusinessRepository';
import { MongoRoomTypeRepository } from '../modules/rooms/repositories/MongoRoomTypeRepository';
import { MongoRoomRepository } from '../modules/rooms/repositories/MongoRoomRepository';
import { MongoGuestRepository } from '../modules/guests/repositories/MongoGuestRepository';
import { MongoBookingRepository } from '../modules/bookings/repositories/MongoBookingRepository';
import { MongoWebsiteRepository } from '../modules/websites/repositories/MongoWebsiteRepository';

// Providers
import { StripePaymentProvider } from '../modules/payments/providers/StripePaymentProvider';
import { RazorpayPaymentProvider } from '../modules/payments/providers/RazorpayPaymentProvider';

// Services
import { AuthService } from '../modules/auth/services/AuthService';
import { OrganizationService } from '../modules/organizations/services/OrganizationService';
import { BusinessService } from '../modules/businesses/services/BusinessService';
import { RoomService } from '../modules/rooms/services/RoomService';
import { GuestService } from '../modules/guests/services/GuestService';
import { BookingService } from '../modules/bookings/services/BookingService';
import { WebsiteService } from '../modules/websites/services/WebsiteService';
import { PaymentService } from '../modules/payments/services/PaymentService';
import { AIService } from '../modules/ai/services/AIService';
import { AnalyticsService } from '../modules/analytics/services/AnalyticsService';

// Controllers
import { AuthController } from '../modules/auth/controllers/AuthController';
import { OrganizationController } from '../modules/organizations/controllers/OrganizationController';
import { BusinessController } from '../modules/businesses/controllers/BusinessController';
import { RoomController } from '../modules/rooms/controllers/RoomController';
import { GuestController } from '../modules/guests/controllers/GuestController';
import { BookingController } from '../modules/bookings/controllers/BookingController';
import { WebsiteController } from '../modules/websites/controllers/WebsiteController';
import { PaymentController } from '../modules/payments/controllers/PaymentController';
import { AIController } from '../modules/ai/controllers/AIController';
import { AnalyticsController } from '../modules/analytics/controllers/AnalyticsController';
import { PublicController } from '../modules/businesses/controllers/PublicController';
import { AdminController } from '../modules/admin/controllers/AdminController';

// Routers
import { createAuthRouter } from '../modules/auth/routes/AuthRoutes';
import { createOrganizationRouter } from '../modules/organizations/routes/OrganizationRoutes';
import { createBusinessRouter } from '../modules/businesses/routes/BusinessRoutes';
import { createRoomRouter, createRoomTypeRouter } from '../modules/rooms/routes/RoomRoutes';
import { createGuestRouter } from '../modules/guests/routes/GuestRoutes';
import { createBookingRouter } from '../modules/bookings/routes/BookingRoutes';
import { createWebsiteRouter } from '../modules/websites/routes/WebsiteRoutes';
import { createPaymentRouter } from '../modules/payments/routes/PaymentRoutes';
import { createAIRouter } from '../modules/ai/routes/AIRoutes';
import { createAnalyticsRouter } from '../modules/analytics/routes/AnalyticsRoutes';
import { createPublicRouter } from '../modules/businesses/routes/PublicRoutes';
import { createAdminRouter } from '../modules/admin/routes/AdminRoutes';

// Instantiate Repository layer singletons
const userRepo = new MongoUserRepository();
const tokenRepo = new MongoRefreshTokenRepository();
const orgRepo = new MongoOrganizationRepository();
const businessRepo = new MongoBusinessRepository();
const roomTypeRepo = new MongoRoomTypeRepository();
const roomRepo = new MongoRoomRepository();
const guestRepo = new MongoGuestRepository();
const bookingRepo = new MongoBookingRepository();
const websiteRepo = new MongoWebsiteRepository();

// Instantiate Mock Payment gateways
const stripeProvider = new StripePaymentProvider();
const razorpayProvider = new RazorpayPaymentProvider();

// Instantiate Service layer singletons
const authService = new AuthService(userRepo, tokenRepo, orgRepo, businessRepo);
const organizationService = new OrganizationService(orgRepo, userRepo);
const businessService = new BusinessService(businessRepo);
const roomService = new RoomService(roomRepo, roomTypeRepo);
const guestService = new GuestService(guestRepo);
const bookingService = new BookingService(bookingRepo, roomRepo, roomTypeRepo, guestRepo);
const websiteService = new WebsiteService(websiteRepo);
const paymentService = new PaymentService(bookingRepo, stripeProvider, razorpayProvider);
const aiService = new AIService(roomTypeRepo, roomRepo);
const analyticsService = new AnalyticsService(bookingRepo, roomRepo);

// Instantiate Controller layer singletons
const authController = new AuthController(authService);
const organizationController = new OrganizationController(organizationService);
const businessController = new BusinessController(businessService);
const roomController = new RoomController(roomService);
const guestController = new GuestController(guestService);
const bookingController = new BookingController(bookingService);
const websiteController = new WebsiteController(websiteService);
const paymentController = new PaymentController(paymentService);
const aiController = new AIController(aiService);
const analyticsController = new AnalyticsController(analyticsService);
const publicController = new PublicController(
  businessService,
  websiteService,
  roomService,
  bookingService,
  roomRepo,
  bookingRepo
);
const adminController = new AdminController();

// Instantiate Routers
export const authRouter = createAuthRouter(authController);
export const organizationRouter = createOrganizationRouter(organizationController);
export const businessRouter = createBusinessRouter(businessController);
export const roomRouter = createRoomRouter(roomController);
export const roomTypeRouter = createRoomTypeRouter(roomController);
export const guestRouter = createGuestRouter(guestController);
export const bookingRouter = createBookingRouter(bookingController);
export const websiteRouter = createWebsiteRouter(websiteController);
export const paymentRouter = createPaymentRouter(paymentController);
export const aiRouter = createAIRouter(aiController);
export const analyticsRouter = createAnalyticsRouter(analyticsController);
export const publicRouter = createPublicRouter(publicController);
export const adminRouter = createAdminRouter(adminController);
