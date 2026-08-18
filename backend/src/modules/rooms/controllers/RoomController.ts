import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/RoomService';

export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // -------------------------------------------------------------
  // RoomType Request Handlers
  // -------------------------------------------------------------

  public createRoomType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const roomType = await this.roomService.createRoomType(orgId, businessId, req.body);
      
      res.status(201).json({
        success: true,
        data: roomType,
        message: 'Room type created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public getRoomTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const filter: Record<string, any> = {};
      if (req.query.capacity) {
        filter.capacity = Number(req.query.capacity);
      }
      
      const roomTypes = await this.roomService.getRoomTypes(orgId, filter);
      res.status(200).json({
        success: true,
        data: roomTypes
      });
    } catch (error) {
      next(error);
    }
  };

  public getRoomTypeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const roomType = await this.roomService.getRoomTypeById(orgId, id);
      
      res.status(200).json({
        success: true,
        data: roomType
      });
    } catch (error) {
      next(error);
    }
  };

  public updateRoomType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const roomType = await this.roomService.updateRoomType(orgId, id, req.body);
      
      res.status(200).json({
        success: true,
        data: roomType,
        message: 'Room type updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteRoomType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      await this.roomService.deleteRoomType(orgId, id);
      
      res.status(200).json({
        success: true,
        message: 'Room type deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // -------------------------------------------------------------
  // Room Request Handlers
  // -------------------------------------------------------------

  public createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const room = await this.roomService.createRoom(orgId, businessId, req.body);
      
      res.status(201).json({
        success: true,
        data: room,
        message: 'Room created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public getRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const filter: Record<string, any> = {};
      
      if (req.query.roomTypeId) {
        filter.roomTypeId = req.query.roomTypeId;
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
      
      const rooms = await this.roomService.getRooms(orgId, filter);
      res.status(200).json({
        success: true,
        data: rooms
      });
    } catch (error) {
      next(error);
    }
  };

  public getRoomById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const room = await this.roomService.getRoomById(orgId, id);
      
      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      next(error);
    }
  };

  public updateRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const room = await this.roomService.updateRoom(orgId, id, req.body);
      
      res.status(200).json({
        success: true,
        data: room,
        message: 'Room updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      await this.roomService.deleteRoom(orgId, id);
      
      res.status(200).json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default RoomController;
