import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/AIService';
import { AIKnowledgeBaseModel } from '../models/AIKnowledgeBaseModel';
import { Types } from 'mongoose';

export class AIController {
  constructor(private readonly aiService: AIService) {}

  public getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const conversations = await this.aiService.getConversations(orgId, businessId);

      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  };

  public getConversationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const { id } = req.params;

      const conversation = await this.aiService.getConversationById(orgId, businessId, id);

      res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  };

  public handleGuestMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const conversation = await this.aiService.handleGuestMessage(orgId, businessId, req.body);

      res.status(200).json({
        success: true,
        data: conversation,
        message: 'Message processed and replied'
      });
    } catch (error) {
      next(error);
    }
  };

  public addMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const { id } = req.params;
      const { sender, text } = req.body;

      const conversation = await this.aiService.addMessage(orgId, businessId, id, sender, text);

      res.status(200).json({
        success: true,
        data: conversation,
        message: 'Message added successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const { id } = req.params;
      const { status, unread } = req.body;

      const conversation = await this.aiService.updateConversationStatus(orgId, businessId, id, status, unread);

      res.status(200).json({
        success: true,
        data: conversation,
        message: 'Conversation status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Knowledge base actions
  public createKBItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;

      const item = new AIKnowledgeBaseModel({
        ...req.body,
        organizationId: new Types.ObjectId(orgId),
        businessId: new Types.ObjectId(businessId)
      });
      await item.save();

      res.status(201).json({
        success: true,
        data: item,
        message: 'Knowledge base entry created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public getKBItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;

      const items = await AIKnowledgeBaseModel.find({
        organizationId: new Types.ObjectId(orgId),
        businessId: new Types.ObjectId(businessId)
      }).exec();

      res.status(200).json({
        success: true,
        data: items
      });
    } catch (error) {
      next(error);
    }
  };
}
export default AIController;
