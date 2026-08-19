import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  Smartphone, 
  CheckCircle, 
  RefreshCw, 
  Save, 
  Coffee, 
  Building2
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { activeTenant, updateSettings, resetAll } = useApp();

  // Config states
  const [name, setName] = useState(activeTenant?.name || '');
  const [address, setAddress] = useState(activeTenant?.settings?.address || '');
  const [city, setCity] = useState(activeTenant?.settings?.city || '');
  const [country, setCountry] = useState(activeTenant?.settings?.country || '');
  const [checkInTime, setCheckInTime] = useState(activeTenant?.settings?.checkInTime || '14:00');
  const [checkOutTime, setCheckOutTime] = useState(activeTenant?.settings?.checkOutTime || '11:00');
  const [wifiPassword, setWifiPassword] = useState(activeTenant?.settings?.wifiPassword || '');
  const [breakfastPolicy, setBreakfastPolicy] = useState<'included' | 'paid' | 'none'>(activeTenant?.settings?.breakfastPolicy || 'included');
  const [cancellationPolicy, setCancellationPolicy] = useState(activeTenant?.settings?.cancellationPolicy || '');
  const [phone, setPhone] = useState(activeTenant?.settings?.phone || '');
  const [email, setEmail] = useState(activeTenant?.settings?.email || '');
  
  // WhatsApp simulator state
  const [waNumberInput, setWaNumberInput] = useState('');
  const [qrState, setQrState] = useState<'disconnected' | 'generating' | 'ready' | 'connecting' | 'connected'>('disconnected');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Sync state if active tenant changes
  useEffect(() => {
    if (activeTenant) {
      setName(activeTenant.name);
      setAddress(activeTenant.settings.address);
      setCity(activeTenant.settings.city);
      setCountry(activeTenant.settings.country);
      setCheckInTime(activeTenant.settings.checkInTime);
      setCheckOutTime(activeTenant.settings.checkOutTime);
      setWifiPassword(activeTenant.settings.wifiPassword);
      setBreakfastPolicy(activeTenant.settings.breakfastPolicy);
      setCancellationPolicy(activeTenant.settings.cancellationPolicy);
      setPhone(activeTenant.settings.phone);
      setEmail(activeTenant.settings.email);
    }
  }, [activeTenant]);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to context
    updateSettings({
      address,
      city,
      country,
      currency: activeTenant.settings.currency,
      timezone: activeTenant.settings.timezone,
      checkInTime,
      checkOutTime,
      wifiPassword,
      breakfastPolicy,
      cancellationPolicy,
      phone,
      email,
      description: activeTenant.settings.description
    });

    setSavedSuccessMsg('Settings saved successfully.');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const startQrGeneration = () => {
    if (!waNumberInput.trim()) {
      alert('Please enter a valid phone number.');
      return;
    }
    setQrState('generating');
    setTimeout(() => {
      setQrState('ready');
    }, 1200);
  };

  const simulateQrScan = () => {
    setQrState('connecting');
    setTimeout(() => {
      setQrState('connected');
    }, 1500);
  };

  const handleDisconnectWhatsapp = () => {
    if (confirm('Are you sure you want to disconnect WhatsApp? AI messaging logs will be paused.')) {
      setQrState('disconnected');
      setWaNumberInput('');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12 text-xs font-semibold text-text-primary">
      
      {/* Save Success Indicator */}
      {savedSuccessMsg && (
        <div className="bg-brand-light border border-emerald-200 text-brand-primary text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveChanges} className="space-y-8">
        
        {/* Section 1: Property coordinates */}
        <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Building2 className="w-4.5 h-4.5 text-brand-primary" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Property Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Hotel Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none focus:border-brand-primary"
              />
            </div>
            
            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Guest Wi-Fi Password</label>
              <input 
                type="text" 
                value={wifiPassword} 
                onChange={e => setWifiPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Street Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">City</label>
              <input 
                type="text" 
                value={city} 
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Country</label>
              <input 
                type="text" 
                value={country} 
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Contact Phone</label>
              <input 
                type="text" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Contact Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Check-in time</label>
              <input 
                type="time" 
                value={checkInTime} 
                onChange={e => setCheckInTime(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Checkout deadline</label>
              <input 
                type="time" 
                value={checkOutTime} 
                onChange={e => setCheckOutTime(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Policies */}
        <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Coffee className="w-4.5 h-4.5 text-brand-primary" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Policies & Guidelines</h3>
          </div>

          <div className="grid grid-cols-1 gap-4.5">
            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Breakfast Policy</label>
              <select 
                value={breakfastPolicy} 
                onChange={e => setBreakfastPolicy(e.target.value as any)}
                className="w-full max-w-xs px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none focus:border-brand-primary"
              >
                <option value="included">Free Breakfast Included</option>
                <option value="paid">Paid Breakfast Surcharge</option>
                <option value="none">No Breakfast Provided</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1.5">Cancellation Policy</label>
              <textarea 
                rows={3}
                value={cancellationPolicy} 
                onChange={e => setCancellationPolicy(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-subtle bg-[#f1f5f9]/30 rounded-lg focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset all storage parameters to initial defaults?')) {
                resetAll();
              }
            }}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Reset Database Defaults
          </button>
          
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

      {/* WhatsApp Scanner simulator */}
      <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <Smartphone className="w-4.5 h-4.5 text-brand-primary" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">WhatsApp Business Connection</h3>
        </div>

        {qrState === 'connected' ? (
          <div className="p-4 bg-brand-light border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded bg-brand-primary text-white font-extrabold flex items-center justify-center shrink-0">
                WA
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800">Connected Phone number</span>
                <span className="block text-xs font-bold text-brand-primary mt-0.5">{waNumberInput || '+91 98765 00123'}</span>
              </div>
            </div>

            <button
              onClick={handleDisconnectWhatsapp}
              className="px-3.5 py-1.5 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-50 rounded-lg cursor-pointer"
            >
              Disconnect Phone
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                Pair stayos with your WhatsApp Business numbers to trigger automated guest billing alerts and receptionist chat routing.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. +91 99000 88000"
                  value={waNumberInput}
                  disabled={qrState !== 'disconnected'}
                  onChange={e => setWaNumberInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#f1f5f9]/30 border border-border-subtle rounded-lg text-xs focus:outline-none"
                />
                {qrState === 'disconnected' && (
                  <button
                    onClick={startQrGeneration}
                    className="px-4 py-2 bg-brand-primary text-white text-xs rounded-lg font-bold"
                  >
                    Generate QR
                  </button>
                )}
              </div>
            </div>

            <div className="border border-dashed border-border-subtle rounded-xl p-4 bg-bg-page min-h-[160px] flex flex-col items-center justify-center text-center">
              {qrState === 'disconnected' && (
                <span className="text-[10px] text-text-secondary italic">Input phone and generate pairing credentials</span>
              )}
              {qrState === 'generating' && (
                <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
              )}
              {qrState === 'ready' && (
                <div className="space-y-3">
                  <div className="w-24 h-24 bg-white border border-border-subtle p-2 mx-auto flex items-center justify-center">
                    {/* Visual QR Code simulation */}
                    <div className="w-full h-full bg-brand-primary/5 flex items-center justify-center font-bold text-xs">QR</div>
                  </div>
                  <button
                    onClick={simulateQrScan}
                    className="px-3 py-1 bg-brand-light text-brand-primary rounded text-[10px] border border-emerald-100 font-bold"
                  >
                    Scan QR
                  </button>
                </div>
              )}
              {qrState === 'connecting' && (
                <div className="space-y-1">
                  <RefreshCw className="w-5 h-5 text-brand-primary animate-spin mx-auto" />
                  <span className="block text-[10px] text-slate-500 font-semibold">Pairing device...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default SettingsTab;
