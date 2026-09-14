import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TenantContext, validateTenantContext } from './context';
import {
  searchRoomsSchema,
  executeSearchRooms,
  getRoomDetailsSchema,
  executeGetRoomDetails
} from './tools/rooms';
import {
  checkAvailabilitySchema,
  executeCheckAvailability
} from './tools/availability';
import {
  createBookingSchema,
  executeCreateBooking,
  getBookingSchema,
  executeGetBooking,
  cancelBookingSchema,
  executeCancelBooking
} from './tools/bookings';
import { BadRequestError } from '../core/errors/BadRequestError';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (input: any, context: TenantContext) => Promise<any>;
}

export class StayOSMcpServer {
  private readonly tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.registerTools();
  }

  private registerTools() {
    this.tools.set('searchRooms', {
      name: 'searchRooms',
      description: 'Search available rooms and rates for the current hotel for a given date range and number of guests. Returns room categories, pricing per night, and remaining available counts.',
      parameters: {
        type: 'OBJECT',
        properties: {
          checkIn: {
            type: 'STRING',
            description: 'Check-in date in YYYY-MM-DD format (e.g. 2026-09-20)'
          },
          checkOut: {
            type: 'STRING',
            description: 'Check-out date in YYYY-MM-DD format (e.g. 2026-09-22)'
          },
          guests: {
            type: 'NUMBER',
            description: 'Number of guests staying (default 2)'
          }
        },
        required: ['checkIn', 'checkOut']
      },
      execute: (input, ctx) => executeSearchRooms(searchRoomsSchema.parse(input), ctx)
    });

    this.tools.set('getRoomDetails', {
      name: 'getRoomDetails',
      description: 'Retrieve detailed information, amenities, capacity, and descriptions for a specific room or room category.',
      parameters: {
        type: 'OBJECT',
        properties: {
          roomId: {
            type: 'STRING',
            description: 'The unique ID of the room category or room'
          }
        },
        required: ['roomId']
      },
      execute: (input, ctx) => executeGetRoomDetails(getRoomDetailsSchema.parse(input), ctx)
    });

    this.tools.set('checkAvailability', {
      name: 'checkAvailability',
      description: 'Verify if a specific room is available for the given dates and calculate the exact total price and taxes on the backend.',
      parameters: {
        type: 'OBJECT',
        properties: {
          roomId: {
            type: 'STRING',
            description: 'The unique ID of the room to check'
          },
          checkIn: {
            type: 'STRING',
            description: 'Check-in date in YYYY-MM-DD format'
          },
          checkOut: {
            type: 'STRING',
            description: 'Check-out date in YYYY-MM-DD format'
          }
        },
        required: ['roomId', 'checkIn', 'checkOut']
      },
      execute: (input, ctx) => executeCheckAvailability(checkAvailabilitySchema.parse(input), ctx)
    });

    this.tools.set('createBooking', {
      name: 'createBooking',
      description: 'Confirm and create a hotel booking reservation for a guest. Calculates official backend pricing, prevents double booking, and issues a confirmed booking ID. Call only when dates, room, guest name, email, and phone number are all provided.',
      parameters: {
        type: 'OBJECT',
        properties: {
          roomId: {
            type: 'STRING',
            description: 'The room category ID to reserve'
          },
          checkIn: {
            type: 'STRING',
            description: 'Check-in date in YYYY-MM-DD format'
          },
          checkOut: {
            type: 'STRING',
            description: 'Check-out date in YYYY-MM-DD format'
          },
          guests: {
            type: 'NUMBER',
            description: 'Number of guests'
          },
          guest: {
            type: 'OBJECT',
            description: 'Guest identity and contact details',
            properties: {
              name: { type: 'STRING', description: 'Full name of guest' },
              email: { type: 'STRING', description: 'Email address of guest' },
              phone: { type: 'STRING', description: 'Phone number of guest' }
            },
            required: ['name', 'email', 'phone']
          }
        },
        required: ['roomId', 'checkIn', 'checkOut', 'guest']
      },
      execute: (input, ctx) => executeCreateBooking(createBookingSchema.parse(input), ctx)
    });

    this.tools.set('getBooking', {
      name: 'getBooking',
      description: 'Retrieve an existing booking by booking confirmation ID or code with secure guest verification.',
      parameters: {
        type: 'OBJECT',
        properties: {
          bookingId: {
            type: 'STRING',
            description: 'The booking confirmation ID (e.g. STY-XXXXXX)'
          },
          email: {
            type: 'STRING',
            description: 'Guest email address for security verification'
          },
          phone: {
            type: 'STRING',
            description: 'Guest phone number for security verification'
          }
        },
        required: ['bookingId']
      },
      execute: (input, ctx) => executeGetBooking(getBookingSchema.parse(input), ctx)
    });

    this.tools.set('cancelBooking', {
      name: 'cancelBooking',
      description: 'Request cancellation for an existing booking. Cancellation policies and refund rules are strictly evaluated on the backend.',
      parameters: {
        type: 'OBJECT',
        properties: {
          bookingId: {
            type: 'STRING',
            description: 'The booking confirmation ID to cancel'
          },
          email: {
            type: 'STRING',
            description: 'Guest email address for security verification'
          },
          phone: {
            type: 'STRING',
            description: 'Guest phone number for security verification'
          },
          reason: {
            type: 'STRING',
            description: 'Optional reason for cancellation'
          }
        },
        required: ['bookingId']
      },
      execute: (input, ctx) => executeCancelBooking(cancelBookingSchema.parse(input), ctx)
    });
  }

  /**
   * Returns tools formatted as Google Gemini function declarations.
   */
  public getGeminiFunctionDeclarations() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));
  }

  /**
   * Execute a tool by name with secure tenant context.
   */
  public async executeTool(toolName: string, args: any, context: TenantContext): Promise<any> {
    const verifiedContext = validateTenantContext(context);
    const tool = this.tools.get(toolName);

    if (!tool) {
      throw new BadRequestError(`Unknown MCP tool '${toolName}' requested`);
    }

    try {
      return await tool.execute(args || {}, verifiedContext);
    } catch (error: any) {
      return {
        error: true,
        code: error.name || 'TOOL_EXECUTION_ERROR',
        message: error.message || 'An error occurred during tool execution'
      };
    }
  }

  /**
   * Instantiate an MCP SDK server instance.
   */
  public createMcpProtocolServer(context: TenantContext) {
    const verifiedContext = validateTenantContext(context);
    const server = new McpServer({
      name: 'stayos-hotel-mcp',
      version: '1.0.0'
    });

    const s: any = server;

    s.tool(
      'searchRooms',
      'Search available rooms for the current hotel',
      searchRoomsSchema.shape,
      async (args: any) => {
        const res = await executeSearchRooms(args, verifiedContext);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    );

    s.tool(
      'getRoomDetails',
      'Get room details for current hotel',
      getRoomDetailsSchema.shape,
      async (args: any) => {
        const res = await executeGetRoomDetails(args, verifiedContext);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    );

    s.tool(
      'checkAvailability',
      'Check availability of a room',
      checkAvailabilitySchema.shape,
      async (args: any) => {
        const res = await executeCheckAvailability(args, verifiedContext);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    );

    s.tool(
      'createBooking',
      'Create a booking reservation',
      createBookingSchema.shape,
      async (args: any) => {
        const res = await executeCreateBooking(args, verifiedContext);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    );

    s.tool(
      'getBooking',
      'Retrieve a booking',
      getBookingSchema.shape,
      async (args: any) => {
        const res = await executeGetBooking(args, verifiedContext);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    );

    s.tool(
      'cancelBooking',
      'Cancel a booking',
      cancelBookingSchema.shape,
      async (args: any) => {
        const res = await executeCancelBooking(args, verifiedContext);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
    );

    return server;
  }
}

export const stayosMcpServer = new StayOSMcpServer();
export default stayosMcpServer;
