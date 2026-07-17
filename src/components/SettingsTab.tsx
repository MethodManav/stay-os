import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, RefreshCw, Save, Wifi, Coffee, HelpCircle, Layers } from 'lucide-react';
import type { 
  HotelConfig, 
  FloorSetup 
} from '../mockData';
import { 
  getHotelConfig, 
  saveHotelConfig, 
  getFloors, 
  saveFloors 
} from '../mockData';

export const SettingsTab: React.FC = () => {
  // Config states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [starRating, setStarRating] = useState(4);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [breakfastPolicy, setBreakfastPolicy] = useState<'included' | 'paid' | 'none'>('included');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [connectedWhatsapp, setConnectedWhatsapp] = useState('');

  // Floors inventory states
  const [floors, setFloors] = useState<FloorSetup[]>([]);
  const [activeConfigFloor, setActiveConfigFloor] = useState(1);

  // WhatsApp connection wizard states
  const [waNumberInput, setWaNumberInput] = useState('');
  const [qrState, setQrState] = useState<'disconnected' | 'generating' | 'ready' | 'connecting' | 'connected'>('disconnected');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  useEffect(() => {
    const config = getHotelConfig();
    setName(config.name);
    setAddress(config.address);
    setCity(config.city);
    setStarRating(config.starRating);
    setCheckInTime(config.checkInTime);
    setCheckOutTime(config.checkOutTime);
    setWifiPassword(config.wifiPassword);
    setBreakfastPolicy(config.breakfastPolicy);
    setCancellationPolicy(config.cancellationPolicy);
    setConnectedWhatsapp(config.connectedWhatsapp || '');

    if (config.connectedWhatsapp) {
      setQrState('connected');
    }

    setFloors(getFloors());
  }, []);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: HotelConfig = {
      name,
      address,
      city,
      starRating,
      checkInTime,
      checkOutTime,
      wifiPassword,
      breakfastPolicy,
      cancellationPolicy,
      connectedWhatsapp: qrState === 'connected' ? (connectedWhatsapp || waNumberInput) : ''
    };

    saveHotelConfig(updatedConfig);
    saveFloors(floors);
    
    setSavedSuccessMsg('settings saved successfully.');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleRoomCountChange = (floorIdx: number, typeIdx: number, val: number) => {
    const updatedFloors = [...floors];
    updatedFloors[floorIdx].roomTypes[typeIdx].count = Math.max(0, val);
    setFloors(updatedFloors);
  };

  const handleRoomPriceChange = (floorIdx: number, typeIdx: number, val: number) => {
    const updatedFloors = [...floors];
    updatedFloors[floorIdx].roomTypes[typeIdx].basePrice = Math.max(0, val);
    setFloors(updatedFloors);
  };

  const startQrGeneration = () => {
    if (!waNumberInput.trim()) {
      alert('please enter a valid phone number.');
      return;
    }
    setQrState('generating');
    setTimeout(() => {
      setQrState('ready');
    }, 1500);
  };

  const simulateQrScan = () => {
    setQrState('connecting');
    setTimeout(() => {
      setQrState('connected');
      setConnectedWhatsapp(waNumberInput);
      
      const config = getHotelConfig();
      saveHotelConfig({
        ...config,
        connectedWhatsapp: waNumberInput
      });
    }, 2000);
  };

  const handleDisconnectWhatsapp = () => {
    if (confirm('are you sure you want to disconnect this whatsapp business number? guest inquiries will not be processed.')) {
      setQrState('disconnected');
      setConnectedWhatsapp('');
      setWaNumberInput('');
      
      const config = getHotelConfig();
      saveHotelConfig({
        ...config,
        connectedWhatsapp: ''
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      
      {/* Top Save Confirmation */}
      {savedSuccessMsg && (
        <div className="bg-brand-light border border-brand-primary/20 text-brand-primary text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveChanges} className="space-y-8">
        
        {/* Section 1: Property details */}
        <div className="bg-bg-card rounded-xl border border-border-subtle p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Layers className="w-4.5 h-4.5 text-brand-primary" />
            <h3 className="text-base font-bold text-text-primary">property details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">hotel name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">star rating</label>
              <select 
                value={starRating} 
                onChange={e => setStarRating(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              >
                <option value={1}>1 star rating</option>
                <option value={2}>2 star rating</option>
                <option value={3}>3 star rating</option>
                <option value={4}>4 star rating</option>
                <option value={5}>5 star rating</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">street address</label>
              <input 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">city / location</label>
              <input 
                type="text" 
                value={city} 
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Wifi className="w-4 h-4 text-text-secondary/60" />
                <span>guest wifi password</span>
              </label>
              <input 
                type="text" 
                value={wifiPassword} 
                onChange={e => setWifiPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">check-in time limit</label>
              <input 
                type="time" 
                value={checkInTime} 
                onChange={e => setCheckInTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">checkout deadline</label>
              <input 
                type="time" 
                value={checkOutTime} 
                onChange={e => setCheckOutTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Policies */}
        <div className="bg-bg-card rounded-xl border border-border-subtle p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Coffee className="w-4.5 h-4.5 text-brand-primary" />
            <h3 className="text-base font-bold text-text-primary">hotel guidelines & policies</h3>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">breakfast policy</label>
              <select 
                value={breakfastPolicy} 
                onChange={e => setBreakfastPolicy(e.target.value as any)}
                className="w-full max-w-md px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              >
                <option value="included">included in standard reservation rate</option>
                <option value="paid">separate bill / surcharge breakfast</option>
                <option value="none">no breakfast offered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-text-secondary/60" />
                <span>cancellation & no-show policies</span>
              </label>
              <textarea 
                rows={3}
                value={cancellationPolicy} 
                onChange={e => setCancellationPolicy(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border-subtle bg-bg-page focus:border-brand-primary rounded-lg focus:outline-none text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Room Inventory summaries */}
        <div className="bg-bg-card rounded-xl border border-border-subtle p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
            <Layers className="w-4.5 h-4.5 text-brand-primary" />
            <h3 className="text-base font-bold text-text-primary">room inventory management</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Floors indexer */}
            <div className="max-h-60 overflow-y-auto border border-border-subtle rounded-lg p-1.5 bg-bg-page/40">
              <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 px-1">floors index</span>
              {floors.map((fl) => (
                <button
                  key={fl.floorNumber}
                  type="button"
                  onClick={() => setActiveConfigFloor(fl.floorNumber)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex justify-between items-center transition-colors cursor-pointer mb-0.5 ${
                    activeConfigFloor === fl.floorNumber 
                      ? 'bg-brand-primary text-white font-bold' 
                      : 'hover:bg-bg-card text-text-secondary'
                  }`}
                >
                  <span>floor {fl.floorNumber}</span>
                  <span className="text-[10px] opacity-85 font-bold">
                    {fl.roomTypes.reduce((sum, r) => sum + r.count, 0)} rooms
                  </span>
                </button>
              ))}
            </div>

            {/* Room type lists on selected floor */}
            <div className="md:col-span-2 space-y-3.5">
              <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border-subtle pb-1">
                configure room rates — floor {activeConfigFloor}
              </span>

              {floors.map((fl, fIdx) => {
                if (fl.floorNumber !== activeConfigFloor) return null;
                return (
                  <div key={fl.floorNumber} className="space-y-2.5">
                    {fl.roomTypes.map((rt, rtIdx) => (
                      <div key={rt.id} className="flex items-center justify-between gap-3 p-3 bg-bg-page/30 border border-border-subtle rounded-lg">
                        <div className="w-2/5">
                          <span className="block font-bold text-sm text-text-primary">{rt.name}</span>
                          <span className="block text-xs text-text-secondary font-semibold mt-0.5">max guests: {rt.maxGuests}</span>
                        </div>

                        <div className="w-1/4">
                          <label className="block text-[10px] text-text-secondary uppercase tracking-wide font-bold">base price ($)</label>
                          <input
                            type="number"
                            value={rt.basePrice}
                            onChange={e => handleRoomPriceChange(fIdx, rtIdx, Number(e.target.value))}
                            className="w-full px-2.5 py-1 text-sm bg-bg-card border border-border-subtle rounded text-text-primary focus:outline-none focus:border-brand-primary"
                          />
                        </div>

                        <div className="w-1/4">
                          <label className="block text-[10px] text-text-secondary uppercase tracking-wide font-bold">room count</label>
                          <input
                            type="number"
                            value={rt.count}
                            onChange={e => handleRoomCountChange(fIdx, rtIdx, Number(e.target.value))}
                            className="w-full px-2.5 py-1 text-sm bg-bg-card border border-border-subtle rounded text-text-primary focus:outline-none focus:border-brand-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>save all changes</span>
          </button>
        </div>
      </form>

      {/* Section 4: Connect WhatsApp Simulator */}
      <div className="bg-bg-card rounded-xl border border-border-subtle p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <Smartphone className="w-4.5 h-4.5 text-brand-primary" />
          <h3 className="text-base font-bold text-text-primary">connect whatsapp number</h3>
        </div>

        {qrState === 'connected' ? (
          <div className="p-4 bg-brand-light border border-brand-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded bg-brand-primary text-white font-bold flex items-center justify-center shrink-0 shadow-sm shadow-brand-primary/15">
                wa
              </div>
              <div>
                <span className="block text-sm font-bold text-text-primary">connected as business phone</span>
                <span className="block text-sm font-bold text-brand-primary mt-1">{connectedWhatsapp}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDisconnectWhatsapp}
              className="px-3.5 py-2 text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              disconnect whatsapp
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Steps description */}
            <div className="space-y-4">
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                pair your hotel's whatsapp business account with the stayos ai concierge to automate guest check-ins, guidelines, billing links, and hospitality requests.
              </p>
              
              <div className="space-y-3.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-brand-light text-brand-primary border border-brand-primary/10 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                  <p className="text-text-secondary pt-0.5 font-medium">input your whatsapp phone number below and click generate QR.</p>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-brand-light text-brand-primary border border-brand-primary/10 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                  <p className="text-text-secondary pt-0.5 font-medium">scan the generated QR code using linked devices in your whatsapp app.</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-brand-light text-brand-primary border border-brand-primary/10 font-bold flex items-center justify-center text-xs shrink-0">3</span>
                  <p className="text-text-secondary pt-0.5 font-medium">the device will pair automatically and toggle to online concierge mode.</p>
                </div>
              </div>

              {/* Number entry */}
              <div className="pt-2 flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  className="flex-1 px-3.5 py-2 text-sm bg-bg-page border border-border-subtle rounded-lg focus:outline-none text-text-primary placeholder:text-text-secondary/40 focus:border-brand-primary"
                  value={waNumberInput}
                  onChange={e => setWaNumberInput(e.target.value)}
                  disabled={qrState !== 'disconnected'}
                />
                
                {qrState === 'disconnected' && (
                  <button
                    type="button"
                    onClick={startQrGeneration}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    generate QR code
                  </button>
                )}
              </div>
            </div>

            {/* Simulated QR block */}
            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border-subtle rounded-xl bg-bg-page/20 min-h-[220px]">
              {qrState === 'disconnected' && (
                <div className="text-center space-y-1.5">
                  <Smartphone className="w-8 h-8 text-border-subtle mx-auto" />
                  <span className="block text-sm font-bold text-text-secondary">no phone number paired yet</span>
                </div>
              )}

              {qrState === 'generating' && (
                <div className="text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-brand-primary animate-spin mx-auto" />
                  <span className="block text-sm font-bold text-text-secondary">generating encrypted pairing token...</span>
                </div>
              )}

              {qrState === 'ready' && (
                <div className="text-center space-y-4">
                  {/* Mock QR graphic */}
                  <div className="w-36 h-36 bg-white border border-border-subtle rounded-lg p-2 mx-auto relative flex items-center justify-center shadow-inner">
                    <div className="grid grid-cols-5 gap-1 w-full h-full opacity-80">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-sm ${
                            (i % 3 === 0 || i % 4 === 1 || i < 5 || i > 20) 
                              ? 'bg-gray-850' 
                              : 'bg-transparent'
                          }`} 
                        />
                      ))}
                    </div>
                    <div className="absolute w-7 h-7 bg-brand-primary text-white rounded flex items-center justify-center text-[10px] font-bold shadow-sm">
                      ⚡
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={simulateQrScan}
                    className="px-3.5 py-2 bg-brand-light hover:bg-brand-light/80 text-brand-primary text-sm font-bold rounded-lg border border-brand-primary/20 transition-colors cursor-pointer"
                  >
                    simulate QR code scan
                  </button>
                </div>
              )}

              {qrState === 'connecting' && (
                <div className="text-center space-y-2.5">
                  <RefreshCw className="w-6 h-6 text-brand-primary animate-spin mx-auto" />
                  <span className="block text-sm font-bold text-text-secondary">establishing handshake with whatsapp server...</span>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
