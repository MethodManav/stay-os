import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { RoomCard } from './generative/RoomCard';
import { BookingConfirmationCard } from './generative/BookingConfirmationCard';
import { AvailabilityBadge } from './generative/AvailabilityBadge';
import { api } from '../../api';

interface TamboChatWidgetProps {
  subdomain: string;
  tenant: any;
  primaryColor?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (room: any) => void;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

interface ChatMessage {
  id: string;
  sender: 'guest' | 'ai';
  text: string;
  generativeComponents?: Array<{
    type: 'RoomCard' | 'BookingConfirmationCard' | 'AvailabilityBadge';
    props: any;
  }>;
}

const QUICK_PROMPTS = [
  'Show available rooms',
  'What is the check-in time?',
  'Do you have free Wi-Fi?',
  'Are meals included in the stay?',
];

export const TamboChatWidget: React.FC<TamboChatWidgetProps> = (props) => {
  if (!props.isOpen) return null;

  // StayOS Backend Agent (Gemini + MCP) with Tambo Generative UI Component Engine
  return <StayOSGenerativeChatView {...props} />;
};

/**
 * StayOS Generative Concierge with Tambo UI Architecture
 * Connects directly to StayOS Gemini Agent & MCP backend and dynamically renders registered Generative Components!
 */
const StayOSGenerativeChatView: React.FC<TamboChatWidgetProps> = ({
  subdomain,
  tenant,
  primaryColor = '#1b4332',
  onClose,
  onSelectRoom,
  guestName,
  guestEmail,
  guestPhone,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        sender: 'ai',
        text: `Welcome to ${tenant?.name || 'our property'}! I'm your AI concierge powered by Tambo Generative UI. Ask me about room rates, availability, policies, or book directly in this chat.`,
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleBookRoom = (roomId: string) => {
    let room = tenant?.rooms?.find((r: any) => r.id === roomId || r._id === roomId);
    if (!room) {
      // Find room in recent generative components if loaded dynamically from backend
      for (const m of messages) {
        const rc = m.generativeComponents?.find((c) => c.type === 'RoomCard' && c.props.roomId === roomId);
        if (rc) {
          room = {
            id: rc.props.roomId,
            name: rc.props.name,
            description: rc.props.description,
            price: rc.props.price,
            basePrice: rc.props.price,
            capacity: rc.props.capacity,
            amenities: rc.props.amenities,
            images: rc.props.imageUrl ? [rc.props.imageUrl] : [],
          };
          break;
        }
      }
    }
    if (room && onSelectRoom) {
      onSelectRoom(room);
    } else {
      window.dispatchEvent(new CustomEvent('stayos:book_room', { detail: { roomId } }));
    }
  };

  const handleSend = async (userText: string) => {
    const query = userText.trim();
    if (!query) return;

    const guestMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'guest',
      text: query,
    };

    setMessages((prev) => [...prev, guestMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let savedPhone = localStorage.getItem('stayos_guest_phone');
      if (!savedPhone) {
        savedPhone = guestPhone || '+91 98' + Math.floor(10000000 + Math.random() * 90000000);
        localStorage.setItem('stayos_guest_phone', savedPhone);
      }

      const history = messages.map((m) => ({
        role: m.sender === 'guest' ? ('user' as const) : ('model' as const),
        content: m.text,
      }));

      const res = await api.chatWithAgent(subdomain, {
        message: query,
        history,
        guestName: guestName || 'Valued Guest',
        guestEmail: guestEmail || undefined,
        guestPhone: savedPhone,
      });

      setIsTyping(false);

      const generativeComponents: ChatMessage['generativeComponents'] = [];

      // Inspect tool calls executed by the StayOS Gemini MCP agent
      const tools = res?.toolCalls || res?.toolCallsExecuted || [];
      if (tools.length > 0) {
        for (const tool of tools) {
          if ((tool.name === 'searchRooms' || tool.name === 'getRoomDetails') && tool.result) {
            const returnedRooms = Array.isArray(tool.result)
              ? tool.result
              : tool.result.rooms
              ? tool.result.rooms
              : [tool.result];

            returnedRooms.slice(0, 3).forEach((rm: any) => {
              const matchedTenantRoom = tenant?.rooms?.find(
                (r: any) =>
                  (r.id && (r.id === rm.roomId || r.id === rm.id || r.id === rm._id)) ||
                  (r.name && r.name.toLowerCase() === (rm.name || '').toLowerCase())
              );
              const roomImage =
                rm.images?.[0] ||
                rm.imageUrl ||
                matchedTenantRoom?.images?.[0] ||
                matchedTenantRoom?.imageUrl ||
                undefined;

              generativeComponents.push({
                type: 'RoomCard',
                props: {
                  roomId: rm.roomId || rm.id || rm._id || matchedTenantRoom?.id || 'room-1',
                  name: rm.name,
                  description: rm.description || matchedTenantRoom?.description,
                  price: rm.pricePerNight || rm.basePrice || rm.price || matchedTenantRoom?.basePrice || 3000,
                  currency: tenant?.settings?.currency || 'INR',
                  capacity: rm.maxGuests || rm.capacity || matchedTenantRoom?.capacity || 2,
                  amenities: rm.amenities || matchedTenantRoom?.amenities || ['Free Wi-Fi', 'AC', 'Room Service'],
                  imageUrl: roomImage,
                },
              });
            });
          }

          if (tool.name === 'checkAvailability' && tool.result) {
            generativeComponents.push({
              type: 'AvailabilityBadge',
              props: {
                roomName: tool.args?.roomName || tool.args?.roomId || 'Selected Room',
                roomId: tool.args?.roomId,
                checkIn: tool.args?.checkIn || 'Requested Date',
                checkOut: tool.args?.checkOut || 'Next Day',
                isAvailable: tool.result.isAvailable ?? true,
                pricePerNight: tool.result.pricePerNight,
                currency: tenant?.settings?.currency || 'INR',
              },
            });
          }

          if ((tool.name === 'createBooking' || tool.name === 'getBooking') && (tool.result?.booking || res.booking || res.bookingDetails)) {
            const bk = tool.result?.booking || res.booking || res.bookingDetails;
            generativeComponents.push({
              type: 'BookingConfirmationCard',
              props: {
                bookingId: bk.confirmationCode || bk.id || bk._id || 'STY-CONFIRMED',
                guestName: bk.guestName || guestName || 'Valued Guest',
                roomName: bk.roomName || 'Hotel Suite',
                checkIn: bk.checkIn ? new Date(bk.checkIn).toISOString().split('T')[0] : '2026-09-21',
                checkOut: bk.checkOut ? new Date(bk.checkOut).toISOString().split('T')[0] : '2026-09-22',
                totalAmount: bk.totalAmount || bk.price || 4500,
                currency: tenant?.settings?.currency || 'INR',
                status: (bk.status || 'confirmed').toLowerCase(),
              },
            });
          }
        }
      }

      // If user specifically asked about rooms and no tool rendered a card yet, synthesize room cards from tenant profile
      const lowerQuery = query.toLowerCase();
      if (
        generativeComponents.length === 0 &&
        (lowerQuery.includes('room') || lowerQuery.includes('suite') || lowerQuery.includes('show') || lowerQuery.includes('available')) &&
        tenant?.rooms &&
        tenant.rooms.length > 0
      ) {
        tenant.rooms.slice(0, 2).forEach((rm: any) => {
          generativeComponents.push({
            type: 'RoomCard',
            props: {
              roomId: rm.id || rm._id,
              name: rm.name,
              description: rm.description,
              price: rm.basePrice || rm.price || 3500,
              currency: tenant?.settings?.currency || 'INR',
              capacity: rm.capacity || 2,
              amenities: rm.amenities || ['Free Wi-Fi', 'King Bed'],
              imageUrl: rm.images?.[0] || undefined,
            },
          });
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res?.reply || `I'm happy to help you with ${tenant?.name || 'the hotel'}. Let me know if you would like to reserve a room.`,
          generativeComponents: generativeComponents.length > 0 ? generativeComponents : undefined,
        },
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I had a momentary hiccup connecting to our reservation system. Please try asking again or contact our front desk.',
        },
      ]);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `Conversation restarted. How may I assist your stay at ${tenant?.name || 'our property'} today?`,
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[530px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div
        className="px-4 py-3 text-white flex justify-between items-center shrink-0 shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center font-bold text-xs shadow-inner">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold leading-tight">{tenant?.name || 'AI Concierge'}</span>
              <span className="inline-flex items-center gap-0.5 bg-emerald-400 text-emerald-950 px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-wide shadow-xs">
                <Sparkles className="w-2.5 h-2.5" /> TAMBO UI
              </span>
            </div>
            <span className="block text-[11px] text-emerald-100/90 mt-0.5 leading-none">
              Interactive Generative Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Reset Chat"
            onClick={resetChat}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/60">
        {messages.map((m) => {
          const isGuest = m.sender === 'guest';
          return (
            <div
              key={m.id}
              className={`flex gap-2 max-w-[90%] ${isGuest ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs ${
                  isGuest ? 'bg-slate-200 text-slate-800' : 'bg-emerald-900 text-emerald-300'
                }`}
              >
                {isGuest ? 'G' : 'AI'}
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                {/* Text body */}
                <div
                  className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                    isGuest
                      ? 'text-white font-normal'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                  }`}
                  style={{ backgroundColor: isGuest ? primaryColor : undefined }}
                >
                  {m.text}
                </div>

                {/* Generative UI Components stream */}
                {m.generativeComponents && m.generativeComponents.map((comp, cIdx) => {
                  if (comp.type === 'RoomCard') {
                    return (
                      <RoomCard
                        key={cIdx}
                        {...comp.props}
                        onBookNow={handleBookRoom}
                      />
                    );
                  }
                  if (comp.type === 'BookingConfirmationCard') {
                    return <BookingConfirmationCard key={cIdx} {...comp.props} />;
                  }
                  if (comp.type === 'AvailabilityBadge') {
                    return (
                      <AvailabilityBadge
                        key={cIdx}
                        {...comp.props}
                        onBookNow={handleBookRoom}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2 max-w-[85%]">
            <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0">
              AI
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 italic flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Checking live hotel inventory...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Fast Prompt Suggestions */}
      <div className="px-3 py-1.5 bg-slate-100/80 border-t border-slate-200/80 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-[10px] font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-2.5 border-t border-slate-200 bg-white flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask about rooms, Wi-Fi, checkout..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="p-2 rounded-xl text-white shadow-xs disabled:opacity-50 cursor-pointer transition-all active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
