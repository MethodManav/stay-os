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
  serviceRequestDetails?: any;
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
    const wifiPassword = hotel?.wifiPassword || 'stayos_guests';
    const breakfastPolicy = hotel?.breakfastPolicy || 'included';
    const cancellationPolicy = hotel?.cancellationPolicy || 'Standard 24-hour cancellation policy.';
    const amenities = hotel?.amenities && hotel.amenities.length > 0
      ? hotel.amenities.join(', ')
      : 'Complimentary High-Speed Wi-Fi, Air Conditioning, 24/7 Front Desk, Daily Housekeeping';
    const description = hotel?.description || 'A boutique hospitality property providing comfortable stays.';

    // If Gemini client is unavailable (no API key configured), use intelligent simulated concierge
    if (!client) {
      return this.runSimulatedConcierge(params.message, verifiedTenant, hotel, params.guestInfo, params.history);
    }

    const guestCtx = [
      params.guestInfo?.name ? `Name: ${params.guestInfo.name}` : '',
      params.guestInfo?.email ? `Email: ${params.guestInfo.email}` : '',
      params.guestInfo?.phone ? `Phone: ${params.guestInfo.phone}` : ''
    ].filter(Boolean).join(', ');

    const systemInstruction = `You are the AI Front Desk Concierge for "${hotelName}".
Property Details:
- Hotel Name: ${hotelName}
- Description: ${description}
- Address: ${hotel?.address || 'City Center'}, ${hotel?.city || ''}
- Amenities: ${amenities}
- Wi-Fi Access: Complimentary high-speed Wi-Fi throughout the hotel. Wi-Fi Password: "${wifiPassword}"
- Breakfast Policy: ${breakfastPolicy === 'included' ? 'Complimentary breakfast buffet included for staying guests' : breakfastPolicy === 'paid' ? 'Paid breakfast available on request' : 'No breakfast provided'}
- Currency: ${currency}
- Standard Check-in: ${checkInTime}
- Standard Check-out: ${checkOutTime}
- Cancellation Policy: ${cancellationPolicy}
${guestCtx ? `- Known Guest Context: ${guestCtx}` : ''}

Your responsibilities:
1. Warmly welcome guests and answer questions regarding amenities, rooms, hotel policies, and rates.
2. Language Rule: ALWAYS reply in the EXACT SAME language that the guest uses in their message. If the guest asks in English, reply in English. If the guest asks in Hindi, reply in Hindi. Do NOT switch to Hindi when the user writes in English.
3. Wi-Fi Password Verification Rule (MANDATORY):
   - Wi-Fi at ${hotelName} is complimentary but reserved ONLY for guests who have a confirmed room reservation.
   - When a guest asks for the Wi-Fi password (or Wi-Fi credentials / internet access code):
     * You MUST check if the user has a confirmed room booking before giving the password.
     * Check if a booking confirmation code (e.g. STY-XXXXXX), email, or phone is present in the message, conversation history, or Known Guest Context.
     * If booking details (bookingId, email, or phone) are available, CALL 'getBooking' tool immediately to verify their reservation.
     * If 'getBooking' confirms a valid booking (status CONFIRMED or CHECKED_IN): Warmly greet the guest, confirm their booking (Booking ID and Room), and provide the Wi-Fi password ("${wifiPassword}").
     * If NO booking confirmation ID, email, or phone has been provided yet: Do NOT reveal the Wi-Fi password. Politely inform the guest that Wi-Fi is complimentary for staying guests, and ask them to share their **Booking Confirmation ID** (e.g. STY-XXXXXX), **Room Number**, or registered **email / phone number** so you can verify their reservation first.
     * If 'getBooking' is executed and reports no booking found: Politely explain that no active reservation was found matching those details, and ask them to double-check their confirmation code or contact the front desk.
   - If the guest simply asks "Do you have free Wi-Fi?": confirm directly that complimentary high-speed Wi-Fi is provided for all staying guests upon verifying their room reservation.
4. For general questions, FAQs, greetings, or amenity inquiries (e.g., whether the hotel has free Wi-Fi, breakfast, parking, pool, check-in/out times, location, or policies):
   - Answer directly and politely using the Property Details above.
   - NEVER call 'searchRooms' or any room booking tools for general questions, FAQs, or amenity inquiries.
5. Use the provided tools ONLY when the guest explicitly requests room searches, rates, or reservations:
   - Use 'searchRooms' ONLY when the guest specifically asks to search rooms, view room options, check room availability, or check room rates and pricing.
   - Use 'getRoomDetails' when guests inquire about details of a specific room.
   - Use 'checkAvailability' to verify dates before booking.
   - Use 'createBooking' ONLY when you have: roomId, checkIn, checkOut, and complete guest details (full name, email, phone number). If the guest asks to book without specifying a room category, pick the first available room category returned by 'searchRooms' to proceed with the reservation.
   - If any required booking details (such as guest name, email, or phone) are missing, politely ask the user for them before executing 'createBooking'.
   - Use 'getBooking' when a guest asks about an existing booking, or to verify if a guest has a room reservation before sharing the Wi-Fi password.
   - Use 'cancelBooking' when a guest requests cancellation.
   - Use 'requestRoomService' when a guest requests room cleaning, housekeeping, fresh towels, maintenance, or room service for their room.
6. Room Service & Service Requests Rule (CRITICAL & MANDATORY):
   - Whenever the guest asks or requests ANY hotel service, room service, cleaning, housekeeping, fresh towels, linens, maintenance, repairs, food/dining, wake-up call, luggage, or assistance (e.g., "i want cleaning service", "can you clean my room", "need housekeeping", "fresh towels", "fix AC", "maintenance", "room service", "breakfast in room", etc.):
     * ANALYZE their message to extract:
       - serviceType: "cleaning", "towels", "maintenance", "dining", "room_service", "luggage", etc.
       - roomNumber: extract if mentioned (e.g., "room 101", "204") or from context.
       - bookingId: extract if mentioned (e.g., "STY-XXXXXX") or from context.
       - details: the guest's specific message or needs.
     * ALWAYS CALL 'requestRoomService' immediately! DO NOT refuse, do NOT ask for booking confirmation before calling the tool.
     * Calling 'requestRoomService' immediately creates a live service record in the hotel management panel for hotel staff.
     * Once 'requestRoomService' confirms the request, clearly inform the guest that the service has been scheduled, quoting their Request Reference ID (e.g. SR-XXXXXX), room number, and estimated arrival time. If room number was not provided, kindly ask them to confirm their room number so staff can deliver it promptly.
7. Pricing & Policy Rules:
   - State prices clearly in ${currency}.
   - Never invent or guess room availability or prices; always use tool outputs.
   - Do not make cancellation or refund decisions yourself; rely strictly on 'cancelBooking' results.
8. Tone & Style:
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
    let serviceRequestResult: any = null;

    try {
      // Loop up to 5 turns to resolve tool calls if needed
      for (let turn = 0; turn < 5; turn++) {
        const responsePromise = client.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations }]
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out')), 15000)
        );

        const response: any = await Promise.race([responsePromise, timeoutPromise]);

        // Check if the model wants to call functions
        const functionCalls = response.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
          // Model emitted function call(s) - preserve candidate content for thought_signature
          if (response.candidates?.[0]?.content) {
            contents.push(response.candidates[0].content);
          } else {
            contents.push({
              role: 'model',
              parts: functionCalls.map((call: any) => ({
                functionCall: {
                  name: call.name,
                  args: call.args
                }
              }))
            });
          }

          const functionResponses: any[] = [];
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
            if (toolName === 'requestRoomService' && toolResult.serviceRequest) {
              serviceRequestResult = toolResult.serviceRequest;
            }

            functionResponses.push({
              functionResponse: {
                name: toolName,
                response: toolResult
              }
            });
          }

          // Append function response turn
          contents.push({
            role: 'user',
            parts: functionResponses
          });

          // Continue loop to let Gemini generate response based on function results
          continue;
        }

        // Model generated final text response
        const text = response.text || "I'm happy to help you with your booking. How else may I assist you?";
        return {
          reply: text,
          toolCallsExecuted: executedTools,
          bookingDetails: bookingResult,
          serviceRequestDetails: serviceRequestResult
        };
      }

      return {
        reply: "I have processed your request. Please let me know if you need anything else.",
        toolCallsExecuted: executedTools,
        bookingDetails: bookingResult,
        serviceRequestDetails: serviceRequestResult
      };
    } catch (error: any) {
      Logger.error(`[Gemini Agent Error]: ${error.message}`, error);
      // If API quota or network issue occurs, fallback smoothly
      return this.runSimulatedConcierge(params.message, verifiedTenant, hotel, params.guestInfo, params.history);
    }
  }

  /**
   * High-fidelity fallback simulated concierge when Gemini API key is not configured or in tests.
   */
  private async runSimulatedConcierge(
    message: string,
    tenant: TenantContext,
    hotel: HotelProfile | null,
    guestInfo?: { name?: string; email?: string; phone?: string },
    history?: ChatMessage[]
  ): Promise<AgentResponse> {
    const textLower = message.toLowerCase();
    const hotelName = hotel?.name || tenant.hotelName || 'StayOS Hotel';
    const currency = hotel?.currency || 'INR';
    const checkInTime = hotel?.checkInTime || '14:00';
    const checkOutTime = hotel?.checkOutTime || '11:00';
    const cancellationPolicy = hotel?.cancellationPolicy || 'Free cancellation up to 24 hours prior to check-in.';
    const amenitiesList = hotel?.amenities || [];

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

    // 2. Check if user requests Room Service / Housekeeping / Cleaning / Maintenance / Dining / Any service
    const isServiceRequest =
      textLower.includes('cleaning') ||
      textLower.includes('clean') ||
      textLower.includes('housekeep') ||
      textLower.includes('towel') ||
      textLower.includes('linen') ||
      textLower.includes('sheet') ||
      textLower.includes('pillow') ||
      textLower.includes('blanket') ||
      textLower.includes('maintenance') ||
      textLower.includes('repair') ||
      textLower.includes('fix') ||
      textLower.includes('leak') ||
      textLower.includes('plumb') ||
      textLower.includes('ac ') ||
      textLower.includes('air conditioning') ||
      textLower.includes('dining') ||
      textLower.includes('food') ||
      textLower.includes('breakfast') ||
      textLower.includes('meal') ||
      textLower.includes('room service') ||
      textLower.includes('wake up') ||
      textLower.includes('alarm') ||
      textLower.includes('luggage') ||
      textLower.includes('laundry') ||
      textLower.includes('iron') ||
      textLower.includes('service');

    if (isServiceRequest) {
      // 1. Extract booking code from current message or history
      let bookingId = message.match(/STY-[A-Z0-9]{6}|[0-9a-fA-F]{24}/i)?.[0];
      if (!bookingId && history) {
        for (let i = history.length - 1; i >= 0; i--) {
          const match = history[i].content.match(/STY-[A-Z0-9]{6}|[0-9a-fA-F]{24}/i);
          if (match) {
            bookingId = match[0];
            break;
          }
        }
      }

      // 2. Extract room number if mentioned, e.g. "room 204", "rm 101", "room: 305"
      const roomMatch = message.match(/(?:room|rm|suite)[\s#:]*([A-Za-z0-9\-]+)/i);
      const roomNumber = roomMatch ? roomMatch[1] : undefined;

      // 3. Extract contact details
      const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
      const phoneMatch = message.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/)?.[0];
      const guestEmail = emailMatch || (guestInfo?.email && !guestInfo.email.includes('guest@stayos.com') ? guestInfo.email : undefined);
      const guestPhone = phoneMatch || (guestInfo?.phone && !guestInfo.phone.includes('Valued') ? guestInfo.phone : undefined);
      const guestName = guestInfo?.name && !guestInfo.name.includes('Valued') ? guestInfo.name : undefined;

      // 4. Analyze service category
      let detectedServiceType = 'cleaning';
      if (textLower.includes('towel') || textLower.includes('linen') || textLower.includes('sheet') || textLower.includes('pillow')) {
        detectedServiceType = 'towels';
      } else if (textLower.includes('maintenance') || textLower.includes('fix') || textLower.includes('repair') || textLower.includes('plumb') || textLower.includes('ac')) {
        detectedServiceType = 'maintenance';
      } else if (textLower.includes('food') || textLower.includes('dine') || textLower.includes('dining') || textLower.includes('meal') || textLower.includes('breakfast')) {
        detectedServiceType = 'dining';
      } else if (textLower.includes('clean') || textLower.includes('housekeep')) {
        detectedServiceType = 'cleaning';
      } else {
        detectedServiceType = 'room_service';
      }

      try {
        const res = await stayosMcpServer.executeTool('requestRoomService', {
          bookingId,
          roomNumber,
          serviceType: detectedServiceType,
          details: message,
          guestName,
          email: guestEmail,
          phone: guestPhone
        }, tenant);

        if (res.serviceRequest) {
          const sr = res.serviceRequest;
          const roomNotice = sr.roomNumber && !sr.roomNumber.includes('To be confirmed')
            ? `for **${sr.roomNumber}**`
            : `(Service Ticket: ${sr.requestId})`;

          return {
            reply: `✨ Service Scheduled! We have dispatched **${sr.serviceType}** ${roomNotice} (Reference: **${sr.requestId}**). Staff will arrive ${sr.estimatedArrival.toLowerCase()}.${sr.roomNumber.includes('To be confirmed') ? ' If you haven\'t given your room number, please let us know so we can bring it straight to your door!' : ''}`,
            toolCallsExecuted: [{ name: 'requestRoomService', args: { bookingId, roomNumber, serviceType: detectedServiceType, details: message }, result: res }],
            serviceRequestDetails: sr
          };
        }
      } catch (err: any) {
        Logger.warn(`[Agent] Failed to dispatch simulated room service: ${err.message}`);
      }
    }

    // 3. Check if user provides a booking code or inquires about their reservation
    const bookingCodeMatch = message.match(/STY-[A-Z0-9]{6}|[0-9a-fA-F]{24}/i);
    const asksBookingInfo = textLower.includes('my booking') || textLower.includes('status of booking') || textLower.includes('find booking') || textLower.includes('reservation');

    if (bookingCodeMatch) {
      const bookingId = bookingCodeMatch[0];
      try {
        const res = await stayosMcpServer.executeTool('getBooking', {
          bookingId,
          email: guestInfo?.email
        }, tenant);

        if (res.booking) {
          const b = res.booking;
          const wifiPass = hotel?.wifiPassword || 'stayos_guests';
          const askedWifi = textLower.includes('wifi') || textLower.includes('wi-fi') || textLower.includes('internet') || textLower.includes('password');

          if (askedWifi) {
            return {
              reply: `Welcome ${b.guest?.name || ''}! We've verified your reservation (${b.confirmationCode} - ${b.roomName}). Your complimentary high-speed Wi-Fi password is **${wifiPass}**. Enjoy your stay!`,
              toolCallsExecuted: [{ name: 'getBooking', args: { bookingId }, result: res }],
              bookingDetails: b
            };
          }

          return {
            reply: `Found your reservation (${b.confirmationCode})!\n- Room: ${b.roomName}\n- Check-in: ${b.checkIn}\n- Check-out: ${b.checkOut}\n- Guests: ${b.numberOfGuests}\n- Total: ${currency} ${b.pricing.total}\n- Status: ${b.bookingStatus}\n\nOur complimentary guest Wi-Fi password for staying guests is **${wifiPass}**.`,
            toolCallsExecuted: [{ name: 'getBooking', args: { bookingId }, result: res }],
            bookingDetails: b
          };
        }
      } catch {
        return {
          reply: `I could not locate an active reservation for booking code "${bookingId}". Please check your confirmation reference or contact our front desk.`,
          toolCallsExecuted: []
        };
      }
    }

    if (asksBookingInfo) {
      return {
        reply: "Please provide your booking ID or confirmation code (e.g. STY-XXXXXX) so I can pull up your reservation.",
        toolCallsExecuted: []
      };
    }

    // 3. Check for booking creation intent with dates
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

    // 4. Check for Wi-Fi / Internet questions
    if (textLower.includes('wi-fi') || textLower.includes('wifi') || textLower.includes('internet') || textLower.includes('wireless')) {
      const wifiPass = hotel?.wifiPassword || 'stayos_guests';
      const asksPassword = textLower.includes('password') || textLower.includes('pass') || textLower.includes('key') || textLower.includes('code') || textLower.includes('passcode');
      const isHindi = /[\u0900-\u097F]/.test(message);

      if (asksPassword) {
        // 1. Check if user provided booking ID in message or conversation history
        let bookingId = message.match(/STY-[A-Z0-9]{6}|[0-9a-fA-F]{24}/i)?.[0];
        if (!bookingId && history) {
          for (let i = history.length - 1; i >= 0; i--) {
            const match = history[i].content.match(/STY-[A-Z0-9]{6}|[0-9a-fA-F]{24}/i);
            if (match) {
              bookingId = match[0];
              break;
            }
          }
        }

        // 2. Extract room number if mentioned, e.g. "room 204", "rm 101"
        const roomMatch = message.match(/(?:room|rm|suite)[\s#:]*([A-Za-z0-9\-]+)/i);
        const roomNumber = roomMatch ? roomMatch[1] : undefined;

        // 3. Extract email from message, guestInfo, or history
        const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
        let guestEmail = emailMatch || (guestInfo?.email && !guestInfo.email.includes('guest@stayos.com') ? guestInfo.email : undefined);
        if (!guestEmail && history) {
          for (let i = history.length - 1; i >= 0; i--) {
            const match = history[i].content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (match) {
              guestEmail = match[0];
              break;
            }
          }
        }

        // 4. Extract phone from message, guestInfo, or history
        const phoneMatch = message.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/)?.[0];
        let guestPhone = phoneMatch || (guestInfo?.phone && !guestInfo.phone.includes('Valued') ? guestInfo.phone : undefined);
        if (!guestPhone && history) {
          for (let i = history.length - 1; i >= 0; i--) {
            const match = history[i].content.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/);
            if (match) {
              guestPhone = match[0];
              break;
            }
          }
        }

        if (bookingId || roomNumber || guestEmail || guestPhone) {
          try {
            const bookingRes = await stayosMcpServer.executeTool('getBooking', {
              bookingId,
              roomNumber,
              email: guestEmail,
              phone: guestPhone
            }, tenant);

            if (bookingRes && bookingRes.booking && bookingRes.booking.bookingStatus !== 'CANCELLED') {
              const b = bookingRes.booking;
              return {
                reply: isHindi
                  ? `धन्यवाद ${b.guest?.name || ''}! आपकी बुकिंग (${b.confirmationCode} - ${b.roomName}) सत्यापित हो गई है। होटल का Wi-Fi पासवर्ड **${wifiPass}** है।`
                  : `Welcome ${b.guest?.name || ''}! We've verified your reservation (${b.confirmationCode} - ${b.roomName}). Your complimentary high-speed Wi-Fi password is **${wifiPass}**. Enjoy your stay!`,
                toolCallsExecuted: [{ name: 'getBooking', args: { bookingId, roomNumber, email: guestEmail, phone: guestPhone }, result: bookingRes }],
                bookingDetails: b
              };
            }
          } catch {
            return {
              reply: isHindi
                ? `हमें आपके दिए गए विवरण के साथ कोई सक्रिय बुकिंग नहीं मिली। Wi-Fi केवल पंजीकृत अतिथियों के लिए उपलब्ध है। कृपया अपना Booking Confirmation ID जांचें या फ्रंट डेस्क से संपर्क करें।`
                : `We couldn't locate an active booking matching those details. Complimentary Wi-Fi is reserved exclusively for guests with a confirmed booking. Please check your booking confirmation code or visit our front desk.`,
              toolCallsExecuted: []
            };
          }
        }

        // No booking details provided yet: prompt for verification
        return {
          reply: isHindi
            ? `हमारे होटल का हाई-स्पीड Wi-Fi अतिथियों के लिए निःशुल्क उपलब्ध है! कृपया अपना **Booking Confirmation ID** (जैसे STY-XXXXXX), **कमरा नंबर**, या पंजीकृत **ईमेल / फोन नंबर** बताएं ताकि आपकी बुकिंग सत्यापित करके Wi-Fi पासवर्ड प्रदान किया जा सके।`
            : `Our complimentary high-speed Wi-Fi is reserved for staying guests! Please provide your **Booking Confirmation ID** (e.g. STY-XXXXXX), **Room Number**, or the **email / phone number** used for your reservation so I can verify your booking and share the Wi-Fi password.`,
          toolCallsExecuted: []
        };
      }

      const hasWifi = amenitiesList.length === 0 || amenitiesList.some(a => /wifi|wi-fi|internet/i.test(a));
      if (hasWifi) {
        return {
          reply: isHindi
            ? `हाँ! हम ${hotelName} में सभी अतिथियों को निःशुल्क हाई-स्पीड Wi-Fi प्रदान करते हैं। बुकिंग सत्यापित होने पर Wi-Fi पासवर्ड उपलब्ध करा दिया जाता है।`
            : `Yes! We offer complimentary high-speed Wi-Fi throughout ${hotelName} for all our staying guests. Once your room reservation is verified, you can access the network password.`,
          toolCallsExecuted: []
        };
      } else {
        return {
          reply: isHindi
            ? `वर्तमान में Wi-Fi हमारी मानक सुविधाओं में सूचीबद्ध नहीं है, लेकिन हमारी फ्रंट डेस्क टीम सहायता के लिए उपलब्ध है।`
            : `Currently, Wi-Fi is not listed among our standard amenities, but our front desk team is happy to assist you with connectivity during your stay.`,
          toolCallsExecuted: []
        };
      }
    }

    // 5. Check for Breakfast / Dining / Meal questions
    if (
      textLower.includes('breakfast') ||
      textLower.includes('food') ||
      textLower.includes('dining') ||
      textLower.includes('restaurant') ||
      textLower.includes('lunch') ||
      textLower.includes('dinner') ||
      textLower.includes('meal') ||
      textLower.includes('meals') ||
      textLower.includes('eat') ||
      textLower.includes('buffet') ||
      textLower.includes('room service')
    ) {
      const hasBreakfast = amenitiesList.some(a => /breakfast|dining|restaurant|food|meal/i.test(a));
      const mentionsFree = textLower.includes('free') || textLower.includes('complimentary') || textLower.includes('included');

      if (mentionsFree) {
        return {
          reply: hasBreakfast
            ? `Complimentary dining/breakfast is available on select room rates and packages at ${hotelName}. Room service and restaurant facilities are also available for all guests!`
            : `Free meals are not included by default, but dining options and room service are available on property at ${hotelName}. Please check with our front desk for specific meal plan options.`,
          toolCallsExecuted: []
        };
      }

      return {
        reply: hasBreakfast
          ? `Yes, ${hotelName} offers dining and breakfast options. Room service is also available for your convenience.`
          : `We offer dining assistance and room service at ${hotelName}. Please let our reception know if you have any special dietary requirements!`,
        toolCallsExecuted: []
      };
    }

    // 6. Check for Parking questions
    if (textLower.includes('parking') || textLower.includes('valet') || textLower.includes('garage')) {
      return {
        reply: `Yes, parking facilities are available for our staying guests at ${hotelName}. Feel free to contact our front desk on arrival for assistance.`,
        toolCallsExecuted: []
      };
    }

    // 7. Check for Check-in / Check-out timing questions
    if (
      textLower.includes('check-in') ||
      textLower.includes('check in') ||
      textLower.includes('checkin') ||
      textLower.includes('check-out') ||
      textLower.includes('check out') ||
      textLower.includes('checkout') ||
      textLower.includes('timing') ||
      textLower.includes('timings')
    ) {
      return {
        reply: `At ${hotelName}, our standard check-in time is **${checkInTime}** and check-out time is **${checkOutTime}**. Early check-in or late check-out can often be arranged upon request subject to room availability.`,
        toolCallsExecuted: []
      };
    }

    // 8. Check for Cancellation policy questions
    if (textLower.includes('cancellation') || textLower.includes('refund policy')) {
      return {
        reply: `Our cancellation policy: ${cancellationPolicy}`,
        toolCallsExecuted: []
      };
    }

    // 9. Check for Location / Address questions
    if (textLower.includes('location') || textLower.includes('address') || textLower.includes('where are you') || textLower.includes('how to reach')) {
      return {
        reply: `${hotelName} is located at: ${hotel?.address || 'City Center'}, ${hotel?.city || ''}${hotel?.country ? ', ' + hotel.country : ''}.`,
        toolCallsExecuted: []
      };
    }

    // 10. Check for General Greetings
    const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste)\b/i.test(textLower.trim());
    if (isGreeting && !textLower.includes('room') && !textLower.includes('book') && !textLower.includes('rate') && !textLower.includes('price')) {
      return {
        reply: `Hello! Welcome to ${hotelName}. I am your virtual front desk concierge. How can I assist you today? You can ask me about our amenities (like free Wi-Fi and dining), check-in policies, room rates, or check availability for your stay!`,
        toolCallsExecuted: []
      };
    }

    // 11. Room search / inquiries - ONLY execute when guest explicitly asks about rooms, rates, prices, dates or availability
    const isRoomInquiry =
      textLower.includes('room') ||
      textLower.includes('rooms') ||
      textLower.includes('rate') ||
      textLower.includes('rates') ||
      textLower.includes('price') ||
      textLower.includes('pricing') ||
      textLower.includes('cost') ||
      textLower.includes('available') ||
      textLower.includes('availability') ||
      textLower.includes('vacan') ||
      textLower.includes('stay') ||
      textLower.includes('suite') ||
      textLower.includes('deluxe') ||
      textLower.includes('standard') ||
      textLower.includes('night') ||
      dates !== null;

    if (isRoomInquiry) {
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
          toolCallsExecuted: [{ name: 'searchRooms', args: { checkIn: dates?.[0] || defaultCheckIn, checkOut: dates?.[1] || defaultCheckOut }, result: searchRes }]
        };
      }
    }

    // 12. Default polite concierge fallback for unrecognized questions - DO NOT trigger searchRooms or room cards
    return {
      reply: `Hello! I am your AI concierge for ${hotelName}. How can I assist you today? You can ask me about our amenities (like free Wi-Fi), check-in policies, room rates, or check availability for your stay!`,
      toolCallsExecuted: []
    };
  }
}

export const geminiBookingAgent = new GeminiBookingAgent();
export default geminiBookingAgent;
