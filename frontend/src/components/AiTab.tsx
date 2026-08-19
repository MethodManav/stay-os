import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Plus, 
  BrainCircuit,
  TrendingUp
} from 'lucide-react';

export const AiTab: React.FC = () => {
  const { activeTenant, addMessage, updateConversationStatus } = useApp();
  
  const [activeTab, setActiveTab] = useState<'conversations' | 'knowledge'>('conversations');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    activeTenant.conversations?.[0]?.id || null
  );
  
  const [chatInput, setChatInput] = useState('');
  
  // Custom rules states
  const [newRule, setNewRule] = useState('');
  const [rules, setRules] = useState<string[]>([
    "Breakfast policy: Free local and continental veg buffet at the beachside bistro from 7:00 AM to 10:30 AM.",
    "Check-in time: 2:00 PM (14:00). Check-out time: 11:00 AM.",
    "Wi-Fi credentials: SSid: AzureHaven_Guest. Pass: azurehaven_guests.",
    "Cancellation policy: Free cancellations up to 48 hours prior to arrival date.",
    "Pet policy: Small pets allowed on request, with a security deposit of ₹5,000."
  ]);

  const conversations = activeTenant.conversations || [];
  const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0] || null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedConv) return;
    
    // Add staff reply message
    addMessage(selectedConv.id, 'staff', chatInput.trim());
    
    // Auto simulate AI response after 1 second if conversation is not marked resolved
    const currentInput = chatInput.trim();
    setChatInput('');

    if (selectedConv.status !== 'resolved') {
      setTimeout(() => {
        let aiReply = "I am currently monitoring this conversation. A member of our staff will reach out to you shortly.";
        if (currentInput.toLowerCase().includes('wifi') || currentInput.toLowerCase().includes('internet')) {
          aiReply = `Sure! The Guest Wi-Fi password is '${activeTenant.settings.wifiPassword || 'azurehaven_guests'}'. Let me know if you face any issues.`;
        } else if (currentInput.toLowerCase().includes('checkout') || currentInput.toLowerCase().includes('check out')) {
          aiReply = `Our check-out time is at ${activeTenant.settings.checkOutTime}. Late checkouts can be requested on the dashboard.`;
        } else if (currentInput.toLowerCase().includes('breakfast')) {
          aiReply = "Breakfast is served daily from 7:00 AM to 10:30 AM. We offer local vegetarian options and continental selections.";
        }
        addMessage(selectedConv.id, 'ai', aiReply);
      }, 1000);
    }
  };

  const handleAddRule = () => {
    if (newRule.trim() && !rules.includes(newRule.trim())) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  // Metrics
  const totalConversations = 1248;
  const leadsGenerated = 342;
  const bookingsGenerated = 87;
  const conversionRate = 25.4;

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e2e1d7] pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1e] font-outfit">AI Receptionist Concierge</h1>
          <p className="text-xs text-[#7a7974] mt-1 font-semibold">Monitor AI chatbot customer responses and direct conversation history</p>
        </div>
        
        {/* Toggle subtabs */}
        <div className="flex border border-[#e2e1d7] rounded-xl p-0.5 bg-[#f4f3ed]">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'conversations' ? 'bg-white text-[#1b4332] shadow-sm' : 'text-[#7a7974] hover:text-[#1a1a1e]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Log</span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'knowledge' ? 'bg-white text-[#1b4332] shadow-sm' : 'text-[#7a7974] hover:text-[#1a1a1e]'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </button>
        </div>
      </div>

      {activeTab === 'conversations' ? (
        <>
          {/* Key AI metrics dashboard summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            {[
              { label: 'AI Conversations', val: totalConversations, suffix: '', trend: '+12.4% vs last week' },
              { label: 'Leads Generated', val: leadsGenerated, suffix: '', trend: '+8.1% vs last week' },
              { label: 'Bookings Generated', val: bookingsGenerated, suffix: '', trend: '+15.2% vs last week' },
              { label: 'AI Conversion Rate', val: conversionRate, suffix: '%', trend: '+2.4% improvement' },
            ].map((metric, i) => (
              <div key={i} className="bg-white border border-[#e2e1d7] rounded-xl p-4 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-[#e8efe9] rounded-bl-full opacity-30" />
                <span className="block text-[9px] uppercase font-bold text-[#7a7974] tracking-wider relative z-10">{metric.label}</span>
                <h4 className="text-xl font-extrabold text-[#1a1a1e] mt-1 relative z-10 font-outfit">
                  {metric.val}{metric.suffix}
                </h4>
                <span className="text-[9px] text-emerald-600 font-bold block mt-1 relative z-10 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> {metric.trend}
                </span>
              </div>
            ))}
          </div>

          {/* Chat Split Window */}
          <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            
            {/* Conversation list sidebar */}
            <div className="w-72 bg-white border border-[#e2e1d7] rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0">
              <span className="block text-[10px] uppercase font-bold text-[#7a7974] tracking-widest border-b border-[#e2e1d7] px-4 py-3 bg-[#fcfbf9]">
                Ongoing Chats
              </span>
              <div className="flex-1 overflow-y-auto divide-y divide-[#e2e1d7]/60">
                {conversations.map((c) => {
                  const isActive = selectedConvId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConvId(c.id)}
                      className={`w-full text-left p-3.5 flex flex-col gap-1 transition-all ${
                        isActive ? 'bg-[#f4f3ed]/60' : 'hover:bg-[#f4f3ed]/20'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-extrabold text-xs text-[#1a1a1e] truncate">{c.guestName}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          c.status === 'escalated' ? 'bg-red-100 text-red-800' :
                          c.status === 'resolved' ? 'bg-slate-100 text-slate-700' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#7a7974] truncate font-medium">{c.messages?.[c.messages.length - 1]?.text || 'No messages yet.'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversational thread panel */}
            <div className="flex-1 bg-white border border-[#e2e1d7] rounded-2xl flex flex-col overflow-hidden shadow-sm">
              {selectedConv ? (
                <>
                  {/* Chat header */}
                  <div className="px-5 py-3 border-b border-[#e2e1d7] bg-[#fcfbf9] flex justify-between items-center shrink-0">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {selectedConv.guestName}
                        <span className="text-[10px] text-slate-500 font-mono font-medium tracking-tight">({selectedConv.guestPhone})</span>
                      </h3>
                      <span className="text-[9px] text-[#7a7974] font-semibold mt-0.5 block">AI Concierge active</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateConversationStatus(selectedConv.id, 'resolved')}
                        className="px-2.5 py-1 rounded bg-[#e8efe9] text-[#1b4332] text-[10px] font-bold border border-emerald-200 hover:bg-[#1b4332] hover:text-white transition-colors cursor-pointer"
                      >
                        Resolve Chat
                      </button>
                      <button
                        onClick={() => updateConversationStatus(selectedConv.id, 'escalated')}
                        className="px-2.5 py-1 rounded bg-red-50 text-red-600 text-[10px] font-bold border border-red-200 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      >
                        Escalate
                      </button>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {selectedConv.messages.map((m) => {
                      const isGuest = m.sender === 'guest';
                      const isAi = m.sender === 'ai';
                      return (
                        <div 
                          key={m.id} 
                          className={`flex gap-3 max-w-[75%] ${isGuest ? '' : 'ml-auto flex-row-reverse text-right'}`}
                        >
                          <div className={`w-8 h-8 rounded-full border border-[#e2e1d7] flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
                            isGuest ? 'bg-slate-100 text-slate-800' : isAi ? 'bg-emerald-950 text-emerald-400' : 'bg-[#1b4332] text-white'
                          }`}>
                            {isGuest ? 'G' : isAi ? 'AI' : 'S'}
                          </div>
                          
                          <div className="space-y-1">
                            <div 
                              className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed text-left ${
                                isGuest ? 'bg-[#f4f3ed] text-[#1a1a1e]' : 'bg-[#1b4332] text-white'
                              }`}
                            >
                              {m.text}
                            </div>
                            <span className="block text-[8px] text-[#7a7974] font-bold uppercase">{m.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input Bar */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-[#e2e1d7] bg-[#fcfbf9] flex gap-3 shrink-0">
                    <input
                      type="text"
                      placeholder="Type a message to manually intervene..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#e2e1d7] rounded-xl focus:outline-none focus:border-[#1b4332] text-xs text-[#1a1a1e] bg-white"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-[#1b4332] hover:bg-[#143324] text-white rounded-xl cursor-pointer transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#7a7974] p-6 space-y-2">
                  <Bot className="w-12 h-12 text-[#a3c2b2]" />
                  <p className="font-semibold italic text-xs">No active conversations found.</p>
                </div>
              )}
            </div>

          </div>
        </>
      ) : (
        /* Knowledge Base Rules setup */
        <div className="flex-1 bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm overflow-y-auto space-y-6">
          <div className="border-b border-[#e2e1d7] pb-3 space-y-1">
            <h3 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide">Knowledge Base Rules</h3>
            <p className="text-xs text-[#7a7974] font-semibold">Feed custom instructions to train the AI Receptionist Concierge about your hotel policies</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Airport shuttle is available for a charge of ₹1,500 one way."
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-[#e2e1d7] rounded-xl focus:outline-none focus:border-[#1b4332] text-xs text-[#1a1a1e] bg-[#f4f3ed]/30"
              />
              <button
                onClick={handleAddRule}
                className="px-4 py-2.5 bg-[#1b4332] hover:bg-[#143324] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Instruction</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {rules.map((rule, idx) => (
                <div key={idx} className="p-3.5 bg-[#fcfbf9] border border-[#e2e1d7] rounded-xl flex gap-3 text-xs items-start">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="font-semibold text-slate-700 leading-relaxed flex-1">{rule}</p>
                  <button 
                    onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-400 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AiTab;
