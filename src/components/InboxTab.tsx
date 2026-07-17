import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Flag, CheckCircle, Smartphone, AlertTriangle, MessageSquare } from 'lucide-react';
import type { Conversation, Message } from '../mockData';
import { getConversations, saveConversations } from '../mockData';

export const InboxTab: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    const list = getConversations();
    setConversations(list);
    if (list.length > 0 && !selectedChatId) {
      setSelectedChatId(list[0].id);
    }
  }, []);

  // Sync back to storage on update
  const updateConversationsList = (updated: Conversation[]) => {
    setConversations(updated);
    saveConversations(updated);
  };

  // Select a conversation and mark as read
  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    const updated = conversations.map(c => {
      if (c.id === id) {
        return { ...c, unread: false };
      }
      return c;
    });
    updateConversationsList(updated);
  };

  // Retrieve current active conversation
  const activeChat = conversations.find(c => c.id === selectedChatId);

  // Auto-scroll chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Toggle Human Staff Escalation
  const toggleEscalation = () => {
    if (!activeChat) return;
    const updated = conversations.map(c => {
      if (c.id === activeChat.id) {
        const isNowEscalated = !c.escalated;
        const newMsg: Message = {
          id: `sys-${Date.now()}`,
          sender: 'staff',
          text: isNowEscalated 
            ? '⚠️ conversation escalated to human staff. ai concierge paused.' 
            : '✅ conversation returned to ai concierge control.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return { 
          ...c, 
          escalated: isNowEscalated,
          lastMessageText: newMsg.text,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });
    updateConversationsList(updated);
  };

  // Send message from staff
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'staff',
      text: inputMessage.trim(),
      timestamp: timeString
    };

    const updated = conversations.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessageText: newMsg.text,
          timestamp: 'just now',
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });
    updateConversationsList(updated);
    setInputMessage('');

    // Simulate guest reply after 2.5 seconds (for demo interactivity)
    setTimeout(() => {
      simulateGuestReply(activeChat.id);
    }, 2500);
  };

  const simulateGuestReply = (chatId: string) => {
    setConversations(prev => {
      const chat = prev.find(c => c.id === chatId);
      if (!chat) return prev;

      const guestReplies = [
        "that makes sense. thank you for clarifying!",
        "i appreciate the quick response. will update you shortly.",
        "okay, i am waiting for housekeeping to deliver this.",
        "could you also verify if this will be billed directly to my booking room card?",
        "perfect, thank you!"
      ];
      const randomReply = guestReplies[Math.floor(Math.random() * guestReplies.length)];
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const replyMsg: Message = {
        id: `reply-${Date.now()}`,
        sender: 'guest',
        text: randomReply,
        timestamp: timeString
      };

      const updated = prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            unread: selectedChatId !== chatId,
            lastMessageText: replyMsg.text,
            timestamp: timeString,
            messages: [...c.messages, replyMsg]
          };
        }
        return c;
      });
      
      saveConversations(updated);
      return updated;
    });
  };

  const filteredConversations = conversations.filter(c => 
    c.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.guestPhone.includes(searchQuery)
  );

  return (
    <div className="flex h-full w-full bg-bg-card rounded-xl border border-border-subtle overflow-hidden shadow-sm">
      {/* Inbox List (Left) */}
      <div className="w-80 border-r border-border-subtle flex flex-col bg-bg-sidebar/10">
        <div className="p-4 border-b border-border-subtle bg-bg-card">
          <h2 className="text-base font-bold text-text-primary tracking-tight mb-3">guest chats</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="search by name or phone..."
              className="w-full pl-9 pr-3.5 py-2 bg-bg-page border border-border-subtle focus:border-brand-primary rounded-lg focus:outline-none transition-all text-text-primary text-sm placeholder:text-text-secondary/50"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
          {filteredConversations.map(chat => {
            const isSelected = chat.id === selectedChatId;
            return (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer border-l-2 ${
                  isSelected ? 'bg-bg-page border-brand-primary' : 'border-transparent hover:bg-bg-page/40'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded bg-brand-light border border-brand-primary/20 flex items-center justify-center font-bold text-brand-primary text-sm">
                    {chat.guestName.charAt(0)}
                  </div>
                  {chat.unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-magenta rounded-full animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`text-sm font-bold truncate ${chat.unread ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {chat.guestName}
                    </span>
                    <span className="text-[10px] text-text-secondary font-semibold whitespace-nowrap ml-1">
                      {chat.timestamp}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {chat.escalated && (
                      <span className="inline-block px-1 bg-accent-magenta/10 border border-accent-magenta/25 text-accent-magenta text-[9px] font-bold rounded">
                        staff
                      </span>
                    )}
                    <p className={`text-xs truncate ${chat.unread ? 'text-text-primary font-bold' : 'text-text-secondary font-medium'}`}>
                      {chat.lastMessageText}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="text-center py-10 text-sm text-text-secondary font-semibold">
              no conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Chat Thread Panel (Right) */}
      <div className="flex-1 flex flex-col bg-bg-card">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-card shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded bg-brand-light border border-brand-primary/20 flex items-center justify-center font-bold text-brand-primary text-base">
                  {activeChat.guestName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">{activeChat.guestName}</h3>
                  <div className="flex items-center gap-1 text-xs text-text-secondary mt-0.5 font-semibold">
                    <Smartphone className="w-3.5 h-3.5 text-text-secondary/60" />
                    <span>{activeChat.guestPhone}</span>
                  </div>
                </div>
              </div>

              {/* Hand off to Human Escalation Button */}
              <div className="flex items-center gap-2">
                {activeChat.escalated && (
                  <div className="flex items-center gap-1 bg-accent-magenta/15 border border-accent-magenta/30 px-2.5 py-1 rounded-lg text-accent-magenta text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>needs staff intervention</span>
                  </div>
                )}
                
                <button
                  onClick={toggleEscalation}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeChat.escalated
                      ? 'bg-brand-light border-brand-primary/20 text-brand-primary hover:bg-brand-light/60'
                      : 'bg-accent-magenta/10 border-accent-magenta/20 text-accent-magenta hover:bg-accent-magenta/20'
                  }`}
                >
                  {activeChat.escalated ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-brand-primary" />
                      <span>mark resolved (enable ai)</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5 text-accent-magenta" />
                      <span>hand off to staff (pause ai)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Message Thread Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-bg-page/30 space-y-4">
              {activeChat.messages.map(msg => {
                const isGuest = msg.sender === 'guest';
                const isSystem = msg.text.startsWith('⚠️') || msg.text.startsWith('✅');
                
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <span className="text-xs font-bold text-text-secondary bg-bg-card border border-border-subtle px-3 py-1.5 rounded shadow-sm">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isGuest ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className="max-w-[70%] space-y-1">
                      <span className="block text-[10px] text-text-secondary font-bold px-1">
                        {msg.sender === 'guest' ? 'guest' : msg.sender === 'ai' ? '🤖 ai concierge' : '👤 staff agent'}
                      </span>
                      
                      <div className={`p-3.5 rounded-xl text-sm leading-relaxed shadow-sm border ${
                        isGuest 
                          ? 'bg-white text-text-primary border-border-subtle' 
                          : msg.sender === 'ai'
                            ? 'bg-[#f0f4f1] text-[#1b4332] border-[#1b4332]/15'
                            : 'bg-brand-primary text-white border-brand-primary font-semibold'
                      }`}>
                        <p>{msg.text}</p>
                      </div>

                      <span className="block text-[10px] text-text-secondary text-right px-1 font-semibold">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border-subtle bg-bg-card flex gap-3">
              <input
                type="text"
                placeholder={
                  activeChat.escalated
                    ? "type message to reply as human staff..."
                    : "type message (sending now will automatically override AI)..."
                }
                className="flex-1 px-4 py-2 bg-bg-page border border-border-subtle focus:border-brand-primary rounded-xl focus:outline-none transition-all text-text-primary text-sm placeholder:text-text-secondary/50"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-secondary font-bold">
            <MessageSquare className="w-10 h-10 mb-2 text-border-subtle" />
            <p className="text-sm">select a guest conversation to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};
