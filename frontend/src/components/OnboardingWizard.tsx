import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { 
  HotelConfig, 
  FloorSetup, 
  RoomTypeSetup 
} from '../mockData';
import { 
  saveHotelConfig, 
  saveFloors, 
  setOnboardingCompleted 
} from '../mockData';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 State: Property Details
  const [hotelName, setHotelName] = useState('StayOS Grand Hotel');
  const [address, setAddress] = useState('77 Orchid Boulevard, Sector 4');
  const [city, setCity] = useState('Mumbai');
  const [starRating, setStarRating] = useState(4);
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [wifiPassword, setWifiPassword] = useState('orchid_grand_guest');
  const [breakfastPolicy, setBreakfastPolicy] = useState<'included' | 'paid' | 'none'>('included');
  const [cancellationPolicy, setCancellationPolicy] = useState('free cancellation up to 24 hours before check-in. late cancellations or no-shows will be charged the first night\'s rate.');

  // Step 2 State: Rooms & Floors
  const [numFloors, setNumFloors] = useState(13);
  const roomsPerFloor = 20;
  
  // Floor setups state
  const [floors, setFloors] = useState<FloorSetup[]>(() => {
    const initialFloors: FloorSetup[] = [];
    for (let f = 1; f <= 13; f++) {
      initialFloors.push({
        floorNumber: f,
        roomTypes: [
          { id: `f${f}-t1`, name: 'Standard Single', maxGuests: 1, basePrice: 85, count: 8 },
          { id: `f${f}-t2`, name: 'Deluxe Double', maxGuests: 2, basePrice: 130, count: 8 },
          { id: `f${f}-t3`, name: 'Executive Suite', maxGuests: 4, basePrice: 260, count: 4 }
        ]
      });
    }
    return initialFloors;
  });

  const [activeFloor, setActiveFloor] = useState(1);

  const handleFloorsChange = (newVal: number) => {
    const val = Math.max(1, Math.min(50, newVal));
    setNumFloors(val);
    
    setFloors(prev => {
      const updated = [...prev];
      if (val > prev.length) {
        for (let f = prev.length + 1; f <= val; f++) {
          updated.push({
            floorNumber: f,
            roomTypes: [
              { id: `f${f}-t1`, name: 'Standard Single', maxGuests: 1, basePrice: 85, count: 8 },
              { id: `f${f}-t2`, name: 'Deluxe Double', maxGuests: 2, basePrice: 130, count: 8 },
              { id: `f${f}-t3`, name: 'Executive Suite', maxGuests: 4, basePrice: 260, count: 4 }
            ]
          });
        }
      } else if (val < prev.length) {
        updated.splice(val);
      }
      return updated;
    });

    if (activeFloor > val) {
      setActiveFloor(val);
    }
  };

  const handleRoomTypeChange = (index: number, key: keyof RoomTypeSetup, value: any) => {
    setFloors(prev => {
      return prev.map(f => {
        if (f.floorNumber === activeFloor) {
          const updatedTypes = [...f.roomTypes];
          updatedTypes[index] = { ...updatedTypes[index], [key]: value };
          return { ...f, roomTypes: updatedTypes };
        }
        return f;
      });
    });
  };

  const addRoomType = () => {
    setFloors(prev => {
      return prev.map(f => {
        if (f.floorNumber === activeFloor) {
          const newId = `f${f.floorNumber}-t${f.roomTypes.length + 1}-${Date.now()}`;
          return {
            ...f,
            roomTypes: [...f.roomTypes, { id: newId, name: 'Premium Room', maxGuests: 2, basePrice: 150, count: 1 }]
          };
        }
        return f;
      });
    });
  };

  const deleteRoomType = (index: number) => {
    setFloors(prev => {
      return prev.map(f => {
        if (f.floorNumber === activeFloor) {
          const updatedTypes = [...f.roomTypes];
          updatedTypes.splice(index, 1);
          return { ...f, roomTypes: updatedTypes };
        }
        return f;
      });
    });
  };

  const copySetupToAll = () => {
    const currentFloorSetup = floors.find(f => f.floorNumber === activeFloor);
    if (!currentFloorSetup) return;

    setFloors(prev => {
      return prev.map(f => {
        const clonedRoomTypes = currentFloorSetup.roomTypes.map((rt, i) => ({
          ...rt,
          id: `f${f.floorNumber}-t${i + 1}-${Date.now()}`
        }));
        return {
          ...f,
          roomTypes: clonedRoomTypes
        };
      });
    });
    alert(`copied floor ${activeFloor}'s room layout to all floors.`);
  };

  const handleFinish = () => {
    const config: HotelConfig = {
      name: hotelName,
      address,
      city,
      starRating,
      checkInTime,
      checkOutTime,
      wifiPassword,
      breakfastPolicy,
      cancellationPolicy,
      connectedWhatsapp: "+1 (555) 019-9230"
    };

    saveHotelConfig(config);
    saveFloors(floors);
    setOnboardingCompleted(true);
    navigate('/dashboard/inbox');
  };

  return (
    <div className="min-h-screen bg-bg-page py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto">
        {/* Onboarding Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">set up stayos</h2>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">let's configure your hotel platform in just two steps</p>
        </div>

        {/* Progress Tracker */}
        <div className="max-w-md mx-auto mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border-subtle -z-10" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-primary transition-all duration-305 -z-10" style={{ width: step === 1 ? '0%' : '100%' }} />

            {/* Step 1 indicator */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${
                  step >= 1 ? 'bg-brand-primary text-white border-brand-primary shadow-sm shadow-brand-primary/10' : 'bg-bg-card text-text-secondary border-border-subtle'
                }`}
              >
                1
              </div>
              <span className="text-xs font-bold text-text-secondary mt-2.5 bg-bg-page px-1.5 uppercase tracking-wide">property details</span>
            </div>

            {/* Step 2 indicator */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${
                  step === 2 ? 'bg-brand-primary text-white border-brand-primary shadow-sm shadow-brand-primary/10' : 'bg-bg-card text-text-secondary border-border-subtle'
                }`}
              >
                2
              </div>
              <span className="text-xs font-bold text-text-secondary mt-2.5 bg-bg-page px-1.5 uppercase tracking-wide">rooms & floors</span>
            </div>
          </div>
        </div>

        {/* Step 1: Property details */}
        {step === 1 && (
          <div className="glassy-card rounded-xl p-8 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wide border-b border-border-subtle pb-3">
              property details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">hotel name</label>
                <input 
                  type="text" 
                  value={hotelName} 
                  onChange={e => setHotelName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">star rating</label>
                <select 
                  value={starRating} 
                  onChange={e => setStarRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page"
                >
                  <option value={1}>1 star rating</option>
                  <option value={2}>2 star rating</option>
                  <option value={3}>3 star rating</option>
                  <option value={4}>4 star rating</option>
                  <option value={5}>5 star rating</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">address</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">city</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">wifi password</label>
                <input 
                  type="text" 
                  value={wifiPassword} 
                  onChange={e => setWifiPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">check-in time</label>
                <input 
                  type="time" 
                  value={checkInTime} 
                  onChange={e => setCheckInTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">checkout time</label>
                <input 
                  type="time" 
                  value={checkOutTime} 
                  onChange={e => setCheckOutTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">breakfast policy</label>
                <select 
                  value={breakfastPolicy} 
                  onChange={e => setBreakfastPolicy(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page"
                >
                  <option value="included">included in reservation price</option>
                  <option value="paid">paid breakfast separate fee</option>
                  <option value="none">no breakfast offered</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">cancellation policy</label>
                <textarea 
                  rows={3}
                  value={cancellationPolicy} 
                  onChange={e => setCancellationPolicy(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(2)}
                className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Rooms & floors */}
        {step === 2 && (
          <div className="glassy-card rounded-xl p-8 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wide border-b border-border-subtle pb-3">
              rooms & floors inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">number of floors</label>
                <input 
                  type="number" 
                  min={1}
                  max={50}
                  value={numFloors} 
                  onChange={e => handleFloorsChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary text-text-primary bg-bg-page" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">approximate rooms per floor</label>
                <input 
                  type="number" 
                  value={roomsPerFloor} 
                  className="w-full px-3.5 py-2.5 text-sm border border-border-subtle rounded-lg text-text-secondary bg-bg-page/50 cursor-not-allowed" 
                  disabled
                />
                <span className="text-xs text-text-secondary mt-1 block">calculated dynamically by summing floor layout settings.</span>
              </div>
            </div>

            {/* Interactive Floor Configuration Editor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border-subtle">
              {/* Floor list on the left */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">floors</span>
                <div className="max-h-60 overflow-y-auto border border-border-subtle rounded-lg p-1.5 bg-bg-page/60">
                  {Array.from({ length: numFloors }, (_, i) => i + 1).map(fNum => {
                    const roomCount = floors.find(f => f.floorNumber === fNum)?.roomTypes.reduce((acc, rt) => acc + rt.count, 0) || 0;
                    return (
                      <button
                        key={fNum}
                        onClick={() => setActiveFloor(fNum)}
                        className={`w-full text-left px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex justify-between items-center cursor-pointer mb-0.5 ${
                          activeFloor === fNum 
                            ? 'bg-brand-primary text-white font-bold shadow-sm shadow-brand-primary/10' 
                            : 'hover:bg-bg-card text-text-primary'
                        }`}
                      >
                        <span>floor {fNum}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${activeFloor === fNum ? 'bg-bg-page/20 text-white font-bold' : 'bg-bg-card border border-border-subtle text-text-secondary'}`}>
                          {roomCount} rooms
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                <button
                  type="button"
                  onClick={copySetupToAll}
                  className="w-full mt-3 px-3 py-2 border border-brand-primary text-brand-primary hover:bg-brand-primary/10 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  copy floor {activeFloor} setup to all floors
                </button>
              </div>

              {/* Selected Floor Editor on the right */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                    floor {activeFloor} layout setup
                  </span>
                  <button
                    onClick={addRoomType}
                    className="text-xs text-brand-primary hover:underline font-bold cursor-pointer"
                  >
                    + add room type
                  </button>
                </div>

                <div className="space-y-3">
                  {floors.find(f => f.floorNumber === activeFloor)?.roomTypes.map((rt, idx) => (
                    <div key={rt.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3.5 bg-bg-card/40 border border-border-subtle rounded-lg text-xs">
                      <div className="w-full sm:w-2/5">
                        <label className="block text-[10px] text-text-secondary mb-0.5 uppercase tracking-wide font-bold">name</label>
                        <input 
                          type="text" 
                          value={rt.name} 
                          onChange={e => handleRoomTypeChange(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1 text-sm border border-border-subtle rounded bg-bg-page text-text-primary focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      
                      <div className="w-1/3 sm:w-1/5">
                        <label className="block text-[10px] text-text-secondary mb-0.5 uppercase tracking-wide font-bold">guests</label>
                        <input 
                          type="number" 
                          min={1}
                          value={rt.maxGuests} 
                          onChange={e => handleRoomTypeChange(idx, 'maxGuests', Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-sm border border-border-subtle rounded bg-bg-page text-text-primary focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div className="w-1/3 sm:w-1/5">
                        <label className="block text-[10px] text-text-secondary mb-0.5 uppercase tracking-wide font-bold">price ($)</label>
                        <input 
                          type="number" 
                          min={0}
                          value={rt.basePrice} 
                          onChange={e => handleRoomTypeChange(idx, 'basePrice', Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-sm border border-border-subtle rounded bg-bg-page text-text-primary focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div className="w-1/3 sm:w-1/5">
                        <label className="block text-[10px] text-text-secondary mb-0.5 uppercase tracking-wide font-bold">count</label>
                        <input 
                          type="number" 
                          min={1}
                          value={rt.count} 
                          onChange={e => handleRoomTypeChange(idx, 'count', Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-sm border border-border-subtle rounded bg-bg-page text-text-primary focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <button
                        onClick={() => deleteRoomType(idx)}
                        className="text-xs text-red-400 hover:text-red-300 self-end mb-1 sm:self-center font-bold cursor-pointer transition-colors"
                      >
                        remove
                      </button>
                    </div>
                  ))}

                  {floors.find(f => f.floorNumber === activeFloor)?.roomTypes.length === 0 && (
                    <p className="text-xs text-text-secondary text-center py-6 bg-bg-page/40 rounded-lg border border-dashed border-border-subtle">
                      no room types configured for floor {activeFloor}. click '+ add room type' to begin.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-border-subtle">
              <button 
                onClick={() => setStep(1)}
                className="px-5 py-2 border border-border-subtle text-text-secondary text-xs font-bold rounded-lg hover:bg-bg-page transition-colors cursor-pointer"
              >
                back
              </button>

              <button 
                onClick={handleFinish}
                className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                complete setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
