import { Types } from 'mongoose';
import { RoomTypeModel } from '../modules/rooms/models/RoomTypeModel';
import { RoomModel } from '../modules/rooms/models/RoomModel';
import { BookingModel } from '../modules/bookings/models/BookingModel';
import { BusinessModel } from '../modules/businesses/models/BusinessModel';
import { BadRequestError } from '../core/errors/BadRequestError';
import { NotFoundError } from '../core/errors/NotFoundError';

export interface RoomSearchResult {
  roomId: string;
  name: string;
  description: string;
  pricePerNight: number;
  availableRooms: number;
  maxGuests: number;
  amenities: string[];
  images?: string[];
}

export interface RoomDetailsResult {
  roomId: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  totalInventory: number;
}

export interface AvailabilityResult {
  available: boolean;
  availableRooms: number;
  pricePerNight: number;
  nights: number;
  totalPrice: number;
  currency: string;
  roomName: string;
}

export class RoomService {
  /**
   * Search available rooms for a tenant hotel within given date range and guest count.
   * Scoped strictly to businessId = hotelId.
   */
  public async searchRooms(params: {
    hotelId: string;
    organizationId?: string;
    checkIn: string;
    checkOut: string;
    guests?: number;
  }): Promise<{ rooms: RoomSearchResult[] }> {
    const { hotelId, checkIn, checkOut } = params;
    const guests = params.guests && params.guests > 0 ? Number(params.guests) : 1;

    if (!Types.ObjectId.isValid(hotelId)) {
      throw new BadRequestError('Invalid hotel identifier');
    }

    const { checkInDate, checkOutDate } = this.validateDates(checkIn, checkOut);

    // Find all room types belonging to this hotel with sufficient capacity
    const roomTypes = await RoomTypeModel.find({
      businessId: new Types.ObjectId(hotelId),
      capacity: { $gte: guests }
    }).exec();

    if (!roomTypes || roomTypes.length === 0) {
      return { rooms: [] };
    }

    const results: RoomSearchResult[] = [];

    for (const rt of roomTypes) {
      const availableCount = await this.countAvailablePhysicalRooms(
        hotelId,
        rt._id.toString(),
        checkInDate,
        checkOutDate
      );

      if (availableCount > 0) {
        results.push({
          roomId: rt._id.toString(),
          name: rt.name,
          description: rt.description || `${rt.name} at our hotel with modern comfort.`,
          pricePerNight: rt.pricePerNight,
          availableRooms: availableCount,
          maxGuests: rt.capacity,
          amenities: rt.amenities || [],
          images: rt.images || []
        });
      }
    }

    // Sort by price ascending
    results.sort((a, b) => a.pricePerNight - b.pricePerNight);

    return { rooms: results };
  }

  /**
   * Get detailed room information. Validates tenant ownership.
   */
  public async getRoomDetails(params: {
    hotelId: string;
    organizationId?: string;
    roomId: string;
  }): Promise<RoomDetailsResult> {
    const { hotelId, roomId } = params;

    if (!Types.ObjectId.isValid(hotelId) || !Types.ObjectId.isValid(roomId)) {
      throw new BadRequestError('Invalid identifier format');
    }

    // Check if roomId is a RoomType
    let roomType = await RoomTypeModel.findOne({
      _id: new Types.ObjectId(roomId),
      businessId: new Types.ObjectId(hotelId)
    }).exec();

    // If not found directly, check if roomId is a physical room
    if (!roomType) {
      const physicalRoom = await RoomModel.findOne({
        _id: new Types.ObjectId(roomId),
        businessId: new Types.ObjectId(hotelId)
      }).exec();

      if (physicalRoom) {
        roomType = await RoomTypeModel.findOne({
          _id: physicalRoom.roomTypeId,
          businessId: new Types.ObjectId(hotelId)
        }).exec();
      }
    }

    if (!roomType) {
      throw new NotFoundError(`Room not found for this hotel property`);
    }

    const totalInventory = await RoomModel.countDocuments({
      businessId: new Types.ObjectId(hotelId),
      roomTypeId: roomType._id,
      status: { $ne: 'maintenance' }
    }).exec();

    return {
      roomId: roomType._id.toString(),
      name: roomType.name,
      description: roomType.description || `${roomType.name} offering supreme comfort and hospitality.`,
      pricePerNight: roomType.pricePerNight,
      maxGuests: roomType.capacity,
      amenities: roomType.amenities || [],
      totalInventory
    };
  }

  /**
   * Check room availability for specific dates. Validates tenant ownership and performs real calculation.
   */
  public async checkAvailability(params: {
    hotelId: string;
    organizationId?: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
  }): Promise<AvailabilityResult> {
    const { hotelId, roomId, checkIn, checkOut } = params;

    if (!Types.ObjectId.isValid(hotelId) || !Types.ObjectId.isValid(roomId)) {
      throw new BadRequestError('Invalid identifier format');
    }

    const { checkInDate, checkOutDate, nights } = this.validateDates(checkIn, checkOut);

    // Verify room type belongs to this hotel
    let roomType = await RoomTypeModel.findOne({
      _id: new Types.ObjectId(roomId),
      businessId: new Types.ObjectId(hotelId)
    }).exec();

    if (!roomType) {
      const physicalRoom = await RoomModel.findOne({
        _id: new Types.ObjectId(roomId),
        businessId: new Types.ObjectId(hotelId)
      }).exec();

      if (physicalRoom) {
        roomType = await RoomTypeModel.findOne({
          _id: physicalRoom.roomTypeId,
          businessId: new Types.ObjectId(hotelId)
        }).exec();
      }
    }

    if (!roomType) {
      throw new NotFoundError(`Room with ID '${roomId}' does not exist for this hotel`);
    }

    const availableCount = await this.countAvailablePhysicalRooms(
      hotelId,
      roomType._id.toString(),
      checkInDate,
      checkOutDate
    );

    const business = await BusinessModel.findById(new Types.ObjectId(hotelId)).select('currency').exec();
    const currency = business?.currency || 'INR';

    const pricePerNight = roomType.pricePerNight;
    const subtotal = pricePerNight * nights;
    const tax = Math.round(subtotal * 0.12);
    const totalPrice = subtotal + tax;

    return {
      available: availableCount > 0,
      availableRooms: availableCount,
      pricePerNight,
      nights,
      totalPrice,
      currency,
      roomName: roomType.name
    };
  }

  /**
   * Internal helper to count physical rooms available without conflicting bookings.
   */
  public async countAvailablePhysicalRooms(
    hotelId: string,
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<number> {
    const physicalRooms = await RoomModel.find({
      businessId: new Types.ObjectId(hotelId),
      roomTypeId: new Types.ObjectId(roomTypeId),
      status: 'available'
    }).exec();

    if (physicalRooms.length === 0) {
      // If hotel hasn't defined physical room numbers yet, default to virtual availability
      return 5;
    }

    let availableCount = 0;
    for (const room of physicalRooms) {
      const conflict = await BookingModel.findOne({
        roomId: room._id,
        businessId: new Types.ObjectId(hotelId),
        bookingStatus: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate }
      }).exec();

      if (!conflict) {
        availableCount++;
      }
    }

    return availableCount;
  }

  /**
   * Find an available physical room for booking.
   */
  public async allocatePhysicalRoom(
    hotelId: string,
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<string | null> {
    const physicalRooms = await RoomModel.find({
      businessId: new Types.ObjectId(hotelId),
      roomTypeId: new Types.ObjectId(roomTypeId),
      status: 'available'
    }).exec();

    if (physicalRooms.length === 0) {
      const rt = await RoomTypeModel.findById(roomTypeId);
      if (rt) {
        const newRoom = await RoomModel.create({
          organizationId: rt.organizationId,
          businessId: new Types.ObjectId(hotelId),
          roomTypeId: new Types.ObjectId(roomTypeId),
          roomNumber: `Room-${Math.floor(100 + Math.random() * 900)}`,
          status: 'available'
        });
        return newRoom._id.toString();
      }
    }

    for (const room of physicalRooms) {
      const conflict = await BookingModel.findOne({
        roomId: room._id,
        businessId: new Types.ObjectId(hotelId),
        bookingStatus: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate }
      }).exec();

      if (!conflict) {
        return room._id.toString();
      }
    }

    return null;
  }

  private validateDates(checkIn: string, checkOut: string): { checkInDate: Date; checkOutDate: Date; nights: number } {
    if (!checkIn || !checkOut) {
      throw new BadRequestError('checkIn and checkOut dates are required in YYYY-MM-DD format');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestError('Invalid date format. Please provide YYYY-MM-DD');
    }

    if (checkInDate >= checkOutDate) {
      throw new BadRequestError('checkIn date must be strictly before checkOut date');
    }

    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { checkInDate, checkOutDate, nights };
  }
}

export const roomService = new RoomService();
export default roomService;
