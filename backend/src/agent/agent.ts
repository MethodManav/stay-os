import { getGeminiClient, GEMINI_MODEL } from './gemini';
import { stayosMcpServer } from '../mcp/server';
import { TenantContext, validateTenantContext } from '../mcp/context';
import { hotelService, HotelProfile } from '../services/hotelService';
import { Logger } from '../shared/utils/Logger';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AgentResponse {
  reply: string;
  toolCallsExecuted: Array<{
    name: string;
    args: any;
    result: any;
  }>;
  bookingDetails?: any;
}

export class GeminiBookingAgent {
  /**
   * Process a message from a guest within a hotel's tenant context.
   */
  public async handleMessage(params: {
    tenant: TenantContext;
    message: string;
    history?: ChatMessage[];
    guestInfo?: { name?: string; email?: string; phone?: string };
  }): Promise<AgentResponse> {
    const verifiedTenant = validateTenantContext(params.tenant);
    const client = getGeminiClient();

    // Fetch full hotel profile for rich system context
    let hotel: HotelProfile | null = null;
    try {
      hotel = await hotelService.getHotelById(verifiedTenant.hotelId);
    } catch {
      // Use fallback tenant details if hotel lookup fails
    }

    const hotelName = hotel?.name || verifiedTenant.hotelName || 'Our Hotel';
    const currency = hotel?.currency || verifiedTenant.currency || 'INR';
    const checkInTime = hotel?.checkInTime || '14:00';
    const checkOutTime = hotel?.checkOutTime || '11:00';
    const cancellationPolicy = hotel?.cancellationPolicy || 'Standard 24-hour cancellation policy.';

    // If Gemini client is unavailable (no API key configured), use intelligent simulated concierge
    if (!client) {
      return this.runSimulatedConcierge(params.message, verifiedTenant, hotel, params.guestInfo);
    }

    const systemInstruction = `You are the AI Front Desk Concierge for "${hotelName}".
Property Details:
- Hotel Name: ${hotelName}
- Address: ${hotel?.address || 'City Center'}, ${hotel?.city || ''}
- Currency: ${currency}
- Standard Check-in: ${checkInTime}
- Standard Check-out: ${checkOutTime}
- Cancellation Policy: ${cancellationPolicy}

Your responsibilities:
1. Warmly welcome guests and answer questions regarding rooms, amenities, policies, and rates.
2. ALWAYS use the provided tools to fetch real data:
   - Use 'searchRooms' to search room options and live pricing for specific dates.
   - Use 'getRoomDetails' when guests inquire about details of a specific room.
   - Use 'checkAvailability' to verify dates before booking.
   - Use 'createBooking' ONLY when you have: roomId, checkIn, checkOut, and complete guest details (full name, email, phone number).
   - If any required booking details (such as guest name, email, or phone) are missing, politely ask the user for them before executing 'createBooking'.
   - Use 'getBooking' when a guest asks about an existing booking.
   - Use 'cancelBooking' when a guest requests cancellation.
3. Pricing & Policy Rules:
   - State prices clearly in ${currency}.
   - Never invent or guess room availability or prices; always use tool outputs.
   - Do not make cancellation or refund decisions yourself; rely strictly on 'cancelBooking' results.
4. Tone & Style:
   - Friendly, refined, concise, and helpful.
   - Celebrate confirmed bookings and display the booking ID clearly.`;

    const functionDeclarations = stayosMcpServer.getGeminiFunctionDeclarations();

    // Prepare contents array
    const contents: any[] = [];

    // Add prior conversation history
    if (params.history && params.history.length > 0) {
      for (const msg of params.history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: params.message }]
    });

    const executedTools: Array<{ name: string; args: any; result: any }> = [];
    let bookingResult: any = null;

    try {
      // Loop up to 5 turns to resolve tool calls if needed
      for (let turn = 0; turn < 5; turn++) {
        const response = await client.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations }]
          }
        });

        // Check if the model wants to call functions
        const functionCalls = response.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
          // Model emitted function call(s)
          for (const call of functionCalls) {
            const toolName = call.name || '';
            Logger.info(`[Gemini Agent] Calling tool '${toolName}' with args: ${JSON.stringify(call.args)} for hotel ${verifiedTenant.hotelId}`);

            const toolResult = await stayosMcpServer.executeTool(
              toolName,
              call.args,
              verifiedTenant
            );

            executedTools.push({
              name: toolName,
              args: call.args,
              result: toolResult
            });

            if (toolName === 'createBooking' && toolResult.booking) {
              bookingResult = toolResult.booking;
            }

            // Append model's function call turn
            contents.push({
              role: 'model',
              parts: [{
                functionCall: {
                  name: call.name,
                  args: call.args
                }
              }]
            });

            // Append function response turn
            contents.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: call.name,
                  response: toolResult
                }
              }]
            });
          }
          // Continue loop to let Gemini generate response based on function results
          continue;
        }

        // Model generated final text response
        const text = response.text || "I'm happy to help you with your booking. How else may I assist you?";
        return {
          reply: text,
          toolCallsExecuted: executedTools,
          bookingDetails: bookingResult
        };
      }

      return {
        reply: "I have processed your request. Please let me know if you need anything else.",
        toolCallsExecuted: executedTools,
        bookingDetails: bookingResult
      };
    } catch (error: any) {
      Logger.error(`[Gemini Agent Error]: ${error.message}`, error);
      // If API quota or network issue occurs, fallback smoothly
      return this.runSimulatedConcierge(params.message, verifiedTenant, hotel, params.guestInfo);
    }
  }

  /**
   * High-fidelity fallback simulated concierge when Gemini API key is not configured or in tests.
   */
  private async runSimulatedConcierge(
    message: string,
    tenant: TenantContext,
    hotel: HotelProfile | null,
    guestInfo?: { name?: string; email?: string; phone?: string }
  ): Promise<AgentResponse> {
    const textLower = message.toLowerCase();
    const hotelName = hotel?.name || tenant.hotelName || 'StayOS Hotel';
    const currency = hotel?.currency || 'INR';

    // 1. Check if user wants to cancel booking
    if (textLower.includes('cancel')) {
      const match = message.match(/STY-[A-Z0-9]{6}|[0-9a-fA-F]{24}/i);
      if (match) {
        const bookingId = match[0];
        const res = await stayosMcpServer.executeTool('cancelBooking', {
          bookingId,
          email: guestInfo?.email,
          phone: guestInfo?.phone
        }, tenant);

        return {
          reply: res.message || `Your booking ${bookingId} has been cancelled per our policy.`,
          toolCallsExecuted: [{ name: 'cancelBooking', args: { bookingId }, result: res }]
        };
      }
      return {
        reply: "To cancel your reservation, please provide your booking confirmation code (e.g. STY-XXXXXX).",
        toolCallsExecuted: []
      };
    }

    // 2. Check if user wants to retrieve booking
    if (textLower.includes('my booking') || textLower.includes('status of booking') || textLower.includes('find booking')) {
      const match = message.match(/STY-[A-Z0-9]{6}|[0-9a-fA-F]{24}/i);
      if (match) {
        const bookingId = match[0];
        const res = await stayosMcpServer.executeTool('getBooking', {
          bookingId,
          email: guestInfo?.email
        }, tenant);

        if (res.booking) {
          const b = res.booking;
          return {
            reply: `Found your reservation (${b.confirmationCode})!\n- Room: ${b.roomName}\n- Check-in: ${b.checkIn}\n- Check-out: ${b.checkOut}\n- Guests: ${b.numberOfGuests}\n- Total: ${currency} ${b.pricing.total}\n- Status: ${b.bookingStatus}`,
            toolCallsExecuted: [{ name: 'getBooking', args: { bookingId }, result: res }],
            bookingDetails: b
          };
        }
      }
      return {
        reply: "Please provide your booking ID or confirmation code (e.g. STY-XXXXXX) so I can pull up your reservation.",
        toolCallsExecuted: []
      };
    }

    // 3. Check for booking creation intent
    const hasBookKeyword = textLower.includes('book') || textLower.includes('reserve');
    const dates = message.match(/\d{4}-\d{2}-\d{2}/g);

    if (hasBookKeyword && dates && dates.length >= 2) {
      const checkIn = dates[0];
      const checkOut = dates[1];

      // Search available rooms first
      const searchRes = await stayosMcpServer.executeTool('searchRooms', {
        checkIn,
        checkOut,
        guests: 2
      }, tenant);

      const availableRooms = searchRes.rooms || [];
      if (availableRooms.length === 0) {
        return {
          reply: `I searched our inventory for ${checkIn} to ${checkOut}, but unfortunately we do not have available rooms for those dates. Would you like to check alternative dates?`,
          toolCallsExecuted: [{ name: 'searchRooms', args: { checkIn, checkOut }, result: searchRes }]
        };
      }

      // Check if guest info is provided
      const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = message.match(/\b\d{10,12}\b/);
      const guestEmail = emailMatch ? emailMatch[0] : guestInfo?.email;
      const guestPhone = phoneMatch ? phoneMatch[0] : guestInfo?.phone;
      const guestName = guestInfo?.name || 'Guest User';

      if (guestEmail && guestPhone) {
        // Execute booking with first available room
        const roomToBook = availableRooms[0];
        const bookRes = await stayosMcpServer.executeTool('createBooking', {
          roomId: roomToBook.roomId,
          checkIn,
          checkOut,
          guests: 2,
          guest: {
            name: guestName,
            email: guestEmail,
            phone: guestPhone
          }
        }, tenant);

        if (bookRes.booking) {
          const b = bookRes.booking;
          return {
            reply: `🎉 Congratulations ${b.guest.name}! Your reservation at ${hotelName} is confirmed.\n\n` +
              `• **Confirmation Code**: ${b.confirmationCode}\n` +
              `• **Room**: ${b.roomName}\n` +
              `• **Dates**: ${b.checkIn} to ${b.checkOut} (${b.nights} night${b.nights > 1 ? 's' : ''})\n` +
              `• **Total Price**: ${currency} ${b.pricing.total} (including taxes)\n` +
              `• **Status**: ${b.bookingStatus}\n\n` +
              `We have sent your confirmation email to ${b.guest.email}. We look forward to welcoming you!`,
            toolCallsExecuted: [
              { name: 'searchRooms', args: { checkIn, checkOut }, result: searchRes },
              { name: 'createBooking', args: { roomId: roomToBook.roomId, checkIn, checkOut }, result: bookRes }
            ],
            bookingDetails: b
          };
        }
      } else {
        return {
          reply: `I found ${availableRooms.length} available room categories for ${checkIn} to ${checkOut}:\n\n` +
            availableRooms.map((r: any) => `• **${r.name}**: ${currency} ${r.pricePerNight}/night (${r.availableRooms} rooms left)`).join('\n') +
            `\n\nTo confirm your reservation, please provide your **full name, email address, and phone number**.`,
          toolCallsExecuted: [{ name: 'searchRooms', args: { checkIn, checkOut }, result: searchRes }]
        };
      }
    }

    // 4. Room search / inquiries
    const today = new Date();
    const defaultCheckIn = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultCheckOut = new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const searchRes = await stayosMcpServer.executeTool('searchRooms', {
      checkIn: dates?.[0] || defaultCheckIn,
      checkOut: dates?.[1] || defaultCheckOut,
      guests: 2
    }, tenant);

    const rooms = searchRes.rooms || [];
    if (rooms.length > 0) {
      return {
        reply: `Welcome to ${hotelName}! Here are our featured rooms and current rates:\n\n` +
          rooms.map((r: any) => `• **${r.name}**: ${currency} ${r.pricePerNight}/night - ${r.description} (Max ${r.maxGuests} guests)`).join('\n') +
          `\n\nTo reserve, simply let me know your preferred dates and guest details!`,
        toolCallsExecuted: [{ name: 'searchRooms', args: { checkIn: defaultCheckIn, checkOut: defaultCheckOut }, result: searchRes }]
      };
    }

    return {
      reply: `Hello! I am your AI concierge for ${hotelName}. How can I assist you today? You can ask me to search rooms, check rates, make a reservation, or check your booking.`,
      toolCallsExecuted: []
    };
  }
}

export const geminiBookingAgent = new GeminiBookingAgent();
export default geminiBookingAgent;
