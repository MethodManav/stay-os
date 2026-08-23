import React from 'react';
import { Sparkles, Bot, BarChart3, Globe, Users, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../AppContext';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ isOpen, onClose }) => {
  const { activeTenant, updateSettings } = useApp();

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    // Optimistic direct upgrade for demo purposes
    if (activeTenant) {
      await updateSettings({
        ...activeTenant.settings,
        subscriptionTier: 'premium'
      });
      onClose();
    }
  };

  const features = [
    { icon: Bot, title: "Automated AI Receptionist", desc: "WhatsApp chatbot that answers guest queries 24/7." },
    { icon: BarChart3, title: "Advanced Analytics", desc: "Detailed insights into revenue, occupancy, and booking trends." },
    { icon: Globe, title: "Website Builder", desc: "Customize and publish your own hotel booking engine." },
    { icon: Users, title: "Team Management", desc: "Add managers and staff with role-based access control." }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Banner */}
        <div className="bg-gradient-to-br from-indigo-900 to-brand-primary p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/20">
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Upgrade to StayOS Premium</h2>
            <p className="text-indigo-100 text-base max-w-md mx-auto">
              Unlock the full potential of your hospitality business with our suite of advanced automation tools.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="p-8 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="mt-1 bg-indigo-50 p-2 rounded-lg text-brand-primary shrink-0 h-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{f.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing & CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border-2 border-brand-primary bg-blue-50/50">
            <div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-slate-900">$29</span>
                <span className="text-sm font-bold text-slate-500 mb-1">/ month</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Cancel anytime
              </span>
            </div>
            <button 
              onClick={handleUpgrade}
              className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-hover text-white font-bold text-base rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
