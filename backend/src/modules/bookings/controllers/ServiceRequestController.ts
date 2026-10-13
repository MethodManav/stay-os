import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { serviceRequestService } from '../../../services/serviceRequestService';
import { ServiceRequestModel } from '../models/ServiceRequestModel';
import { BadRequestError } from '../../../core/errors/BadRequestError';
import { NotFoundError } from '../../../core/errors/NotFoundError';

export class ServiceRequestController {
  /**
   * Get all service requests for a business/hotel
   */
  public getMany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const businessId = req.businessId || req.query.businessId as string;
      const orgId = req.organizationId || req.query.organizationId as string;

      const query: any = {};
      if (businessId && Types.ObjectId.isValid(businessId)) {
        query.businessId = new Types.ObjectId(businessId);
      } else if (orgId && Types.ObjectId.isValid(orgId)) {
        query.organizationId = new Types.ObjectId(orgId);
      }

      if (req.query.status && req.query.status !== 'all') {
        query.status = req.query.status;
      }
      if (req.query.serviceType && req.query.serviceType !== 'all') {
        query.serviceType = req.query.serviceType;
      }

      const requests = await ServiceRequestModel.find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('bookingId')
        .populate('guestId')
        .exec();

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a service request manually from hotel panel
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const businessId = req.businessId || req.body.businessId || req.query.businessId;
      const orgId = req.organizationId || req.body.organizationId;

      if (!businessId) {
        throw new BadRequestError('Business ID is required to create a service request');
      }

      const created = await serviceRequestService.createServiceRequest({
        hotelId: businessId.toString(),
        organizationId: orgId ? orgId.toString() : undefined,
        bookingId: req.body.bookingId,
        roomNumber: req.body.roomNumber,
        guestName: req.body.guestName,
        serviceType: req.body.serviceType,
        details: req.body.details,
        requestedTime: req.body.requestedTime,
        priority: req.body.priority
      });

      res.status(201).json({
        success: true,
        data: created,
        message: 'Service request created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update status of service request (e.g. scheduled, in_progress, completed, cancelled)
   */
  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, details } = req.body;

      if (!status) {
        throw new BadRequestError('Status is required');
      }

      const updated = await serviceRequestService.updateServiceRequestStatus(id, status, details);
      if (!updated) {
        throw new NotFoundError('Service request not found');
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Service request status updated'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete / dismiss a service request
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const query = Types.ObjectId.isValid(id) ? { _id: new Types.ObjectId(id) } : { _id: id };
      const deleted = await ServiceRequestModel.findOneAndDelete(query).exec();

      if (!deleted) {
        throw new NotFoundError('Service request not found');
      }

      res.status(200).json({
        success: true,
        message: 'Service request deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
