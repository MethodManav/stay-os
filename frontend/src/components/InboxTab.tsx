import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Flag, CheckCircle, Smartphone, AlertTriangle, MessageSquare } from 'lucide-react';
import { useApp } from '../AppContext';

export const InboxTab: React.FC = () => {
  const { activeTenant, addMessage, updateConversationStatus } = useApp();
  const conversations = activeTenant?.conversations || [];
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load first conversation on start if none selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedChatId) {
      setSelectedChatId(conversations[0].id);
    }
  }, [conversations, selectedChatId]);

  // Select a conversation and mark as read
  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    const chat = conversations.find(c => c.id === id);
    if (chat && chat.unread) {
      updateConversationStatus(id, chat.status);
    }
  };

  // Retrieve current active conversation
  const activeChat = conversations.find(c => c.id === selectedChatId);

  // Auto-scroll chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Toggle Human Staff Escalation
  const toggleEscalation = async () => {
    if (!activeChat) return;
    const isNowEscalated = activeChat.status !== 'escalated';
    const nextStatus = isNowEscalated ? 'escalated' : 'active';
    
    await updateConversationStatus(activeChat.id, nextStatus);

    const systemText = isNowEscalated 
      ? '⚠️ conversation escalated to human staff. ai concierge paused.' 
      : '✅ conversation returned to ai concierge control.';
      
    await addMessage(activeChat.id, 'staff', systemText);
  };

  // Send message from staff
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // If AI is in control (status is active) and staff replies, auto-escalate the thread to staff!
    if (activeChat.status === 'active') {
      await updateConversationStatus(activeChat.id, 'escalated');
      await addMessage(activeChat.id, 'staff', '⚠️ staff agent joined. conversation escalated.');
    }

    await addMessage(activeChat.id, 'staff', messageText);
  };

  const filteredConversations = conversations.filter(c => 
    c.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.guestPhone.includes(searchQuery)
  );

  return (
    <div className="flex h-full w-full bg-[#ffffff] rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Inbox List (Left) */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/30">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-base font-bold text-slate-800 tracking-tight mb-3 font-outfit uppercase">guest chats</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="search by name or phone..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-[#3872fa] rounded-lg focus:outline-none transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400/80"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {filteredConversations.map(chat => {
            const isSelected = chat.id === selectedChatId;
            const isEscalated = chat.status === 'escalated';
            return (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer border-l-2 ${
                  isSelected ? 'bg-blue-50/40 border-[#3872fa]' : 'border-transparent hover:bg-slate-50/55'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-[#3872fa] text-sm">
                    {chat.guestName.charAt(0)}
                  </div>
                  {chat.unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`text-xs font-bold truncate ${chat.unread ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>
                      {chat.guestName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap ml-1 font-mono">
                      {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].timestamp : 'just now'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    {isEscalated && (
                      <span className="inline-block px-1 bg-rose-50 border border-rose-105 text-rose-600 text-[8px] font-black rounded uppercase">
                        staff
                      </span>
                    )}
                    <p className={`text-[10px] truncate ${chat.unread ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                      {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'No messages'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-450 font-bold">
              no conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Chat Thread Panel (Right) */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-[#3872fa] text-base">
                  {activeChat.guestName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-outfit">{activeChat.guestName}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 font-semibold">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-500 font-medium tracking-tight">{activeChat.guestPhone}</span>
                  </div>
                </div>
              </div>

              {/* Hand off to Human Escalation Button */}
              <div className="flex items-center gap-2">
                {activeChat.status === 'escalated' && (
                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg text-rose-600 text-[10px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>needs staff intervention</span>
                  </div>
                )}
                
                <button
                  onClick={toggleEscalation}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeChat.status === 'escalated'
                      ? 'bg-blue-50 border-blue-200 text-[#3872fa] hover:bg-blue-100/50'
                      : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100/50'
                  }`}
                >
                  {activeChat.status === 'escalated' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" />
                      <span>mark resolved (enable ai)</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5 text-rose-600" />
                      <span>hand off to staff (pause ai)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Message Thread Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
              {activeChat.messages.map(msg => {
                const isGuest = msg.sender === 'guest';
                const isSystem = msg.text.startsWith('⚠️') || msg.text.startsWith('✅');
                
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
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
                      <span className="block text-[9px] text-slate-400 font-extrabold px-1 uppercase tracking-wider">
                        {msg.sender === 'guest' ? 'guest' : msg.sender === 'ai' ? '🤖 ai concierge' : '👤 staff agent'}
                      </span>
                      
                      <div className={`p-3 rounded-xl text-xs leading-relaxed shadow-xs border ${
                        isGuest 
                          ? 'bg-white text-slate-800 border-slate-200' 
                          : msg.sender === 'ai'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            : 'bg-[#3872fa] text-white border-[#3872fa] font-semibold'
                      }`}>
                        <p>{msg.text}</p>
                      </div>

                      <span className="block text-[9px] text-slate-400 text-right px-1 font-semibold font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-3">
              <input
                type="text"
                placeholder={
                  activeChat.status === 'escalated'
                    ? "type message to reply as human staff..."
                    : "type message (sending now will automatically override AI)..."
                }
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#3872fa] rounded-xl focus:outline-none transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-450"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#3872fa] hover:bg-[#1e5ade] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-bold">
            <MessageSquare className="w-10 h-10 mb-2 text-slate-200" />
            <p className="text-xs">select a guest conversation to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default InboxTab;
