import { Types } from 'mongoose';
import { ConversationModel, IConversationDocument } from '../models/ConversationModel';
import { AIKnowledgeBaseModel } from '../models/AIKnowledgeBaseModel';
import { IRoomTypeRepository } from '../../rooms/repositories/IRoomTypeRepository';
import { IRoomRepository } from '../../rooms/repositories/IRoomRepository';
import { NotFoundError } from '../../../core/errors/NotFoundError';

export class AIService {
  constructor(
    private readonly roomTypeRepository: IRoomTypeRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  public async getConversations(organizationId: string, businessId: string): Promise<IConversationDocument[]> {
    return ConversationModel.find({
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId)
    })
      .sort({ updatedAt: -1 })
      .exec();
  }

  public async getConversationById(
    organizationId: string,
    businessId: string,
    id: string
  ): Promise<IConversationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Conversation not found');
    }

    const conversation = await ConversationModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId)
    }).exec();

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }
    return conversation;
  }

  public async handleGuestMessage(
    organizationId: string,
    businessId: string,
    params: {
      guestName: string;
      guestPhone: string;
      text: string;
    }
  ): Promise<IConversationDocument> {
    // 1. Resolve or create Conversation
    let conversation = await ConversationModel.findOne({
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId),
      guestPhone: params.guestPhone
    }).exec();

    if (!conversation) {
      conversation = new ConversationModel({
        organizationId: new Types.ObjectId(organizationId),
        businessId: new Types.ObjectId(businessId),
        guestName: params.guestName,
        guestPhone: params.guestPhone,
        status: 'active',
        unread: true,
        messages: []
      });
    }

    // 2. Append Guest message
    conversation.messages.push({
      sender: 'guest',
      text: params.text,
      timestamp: new Date()
    });
    conversation.unread = true;
    conversation.status = 'active';

    // 3. Generate AI Receptionist response
    const aiResponseText = await this.generateAIResponse(organizationId, businessId, params.text);
    
    // 4. Append AI response
    conversation.messages.push({
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date()
    });

    // Check if the receptionist had to escalate the request
    if (aiResponseText.toLowerCase().includes('escalate') || aiResponseText.toLowerCase().includes('human agent')) {
      conversation.status = 'escalated';
    }

    await conversation.save();
    return conversation;
  }

  public async addMessage(
    organizationId: string,
    businessId: string,
    id: string,
    sender: 'guest' | 'staff' | 'ai',
    text: string
  ): Promise<IConversationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Conversation not found');
    }

    const conversation = await ConversationModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId)
    }).exec();

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    conversation.messages.push({
      sender,
      text,
      timestamp: new Date()
    });
    conversation.unread = sender === 'guest';

    await conversation.save();
    return conversation;
  }

  public async updateConversationStatus(
    organizationId: string,
    businessId: string,
    id: string,
    status: 'active' | 'resolved' | 'escalated',
    unread?: boolean
  ): Promise<IConversationDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Conversation not found');
    }

    const updated = await ConversationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        organizationId: new Types.ObjectId(organizationId),
        businessId: new Types.ObjectId(businessId)
      },
      {
        status,
        ...(unread !== undefined ? { unread } : {})
      },
      { new: true }
    ).exec();

    if (!updated) {
      throw new NotFoundError('Conversation not found');
    }

    return updated;
  }

  // AI Receptionist reasoning engine
  private async generateAIResponse(organizationId: string, businessId: string, text: string): Promise<string> {
    const queryLower = text.toLowerCase();

    // A. Check Availability Queries (e.g. "available", "booking", "stay")
    if (queryLower.includes('available') || queryLower.includes('availability') || queryLower.includes('book a room') || queryLower.includes('price')) {
      try {
        // Retrieve property details from repositories
        const roomTypes = await this.roomTypeRepository.findMany(organizationId, { businessId });
        const rooms = await this.roomRepository.findMany(organizationId, { businessId, status: 'available' });

        if (roomTypes.length === 0 || rooms.length === 0) {
          return "Currently, all rooms are fully booked or unavailable. Please contact our front desk directly for reservations.";
        }

        // List categories and pricing
        const optionsList = roomTypes.map(rt => {
          return `- **${rt.name}**: Capacity of ${rt.capacity} guests, at ${rt.pricePerNight} ${rt.pricePerNight > 1000 ? 'INR' : 'USD'} per night.`;
        }).join('\n');

        return `Yes, we have availability! Here are our room options:\n${optionsList}\n\nWould you like me to guide you to create a booking? Please tell me your check-in and check-out dates.`;
      } catch (err) {
        return "I am having trouble checking room catalogs right now. Let me escalate this to our reservation team to assist you.";
      }
    }

    // B. Scan Custom Knowledge Base FAQs / Policies
    try {
      const faqs = await AIKnowledgeBaseModel.find({
        organizationId: new Types.ObjectId(organizationId),
        businessId: new Types.ObjectId(businessId)
      }).exec();

      for (const faq of faqs) {
        // Check if question key phrases match query
        const matchRegex = new RegExp(`\\b(${faq.question.toLowerCase().split(' ').slice(0, 3).join('|')})\\b`, 'i');
        if (matchRegex.test(queryLower)) {
          return faq.answer;
        }
      }
    } catch (err) {
      // Ignore and fallback
    }

    // C. Default Fallback Response
    if (queryLower.includes('hi') || queryLower.includes('hello') || queryLower.includes('hey')) {
      return "Hello! I am your AI front desk assistant. How can I help you today? You can ask me about room availability, prices, check-in policies, or property services.";
    }

    // Escalation fallback
    return "I am not sure I have the exact answer for that request. I have escalated this conversation to a human receptionist who will reply shortly.";
  }
}
export default AIService;
