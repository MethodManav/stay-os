import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { 
  Rocket, 
  Trash2,
  CheckCircle,
  Eye,
  Upload
} from 'lucide-react';
import type { Room } from '../db';

export const Onboarding: React.FC = () => {
  const { registerNewTenant, triggerOnboardingState } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Create Account
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');

  // Step 2: Business Info
  const [hotelName, setHotelName] = useState('');
  const [businessType, setBusinessType] = useState('Boutique Hotel');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const country = 'India';
  const [currency, setCurrency] = useState('INR');
  const timezone = 'IST (UTC+5:30)';

  // Step 3: Hotel Information
  const [description, setDescription] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [wifiPassword, setWifiPassword] = useState('stayos_guest');
  const [breakfastPolicy, setBreakfastPolicy] = useState<'included' | 'paid' | 'none'>('included');
  const [amenities, setAmenities] = useState<string[]>(['Free Wi-Fi', 'Swimming Pool', 'Air Conditioning']);
  const [newAmenity, setNewAmenity] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Step 4: Room Configuration
  const [rooms, setRooms] = useState<Omit<Room, 'id'>[]>([
    {
      name: 'Deluxe Room',
      type: 'Deluxe Room',
      maxGuests: 2,
      basePrice: 3499,
      count: 10,
      status: 'available',
      amenities: ['King Bed', 'AC', 'Wi-Fi', 'Tv'],
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85'
    }
  ]);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('Deluxe Room');
  const [roomGuests, setRoomGuests] = useState(2);
  const [roomPrice, setRoomPrice] = useState(3499);
  const [roomCount, setRoomCount] = useState(10);
  const [roomAmenitiesText, setRoomAmenitiesText] = useState('King Bed, AC, Wi-Fi, Television');

  // Step 5: Branding
  const [primaryColor, setPrimaryColor] = useState('#0f766e');
  const [secondaryColor, setSecondaryColor] = useState('#0d9488');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'outfit'>('outfit');
  const [buttonStyle, setButtonStyle] = useState<'rounded-full' | 'rounded-md' | 'square'>('rounded-full');

  // Step 6: Website Template
  const [template, setTemplate] = useState<'luxury' | 'modern' | 'boutique' | 'minimal'>('modern');

  // Step 7: Launch
  const [registeredSubdomain, setRegisteredSubdomain] = useState('');

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const addRoomType = () => {
    if (!roomName.trim()) return;
    const rAmenities = roomAmenitiesText.split(',').map(a => a.trim()).filter(Boolean);
    const newRoom: Omit<Room, 'id'> = {
      name: roomName,
      type: roomType,
      maxGuests: roomGuests,
      basePrice: roomPrice,
      count: roomCount,
      status: 'available',
      amenities: rAmenities,
      image: roomType === 'Premium Suite' 
        ? 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=85' 
        : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85'
    };
    setRooms([...rooms, newRoom]);
    setRoomName('');
    setRoomAmenitiesText('');
  };

  const removeRoomType = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleLaunch = () => {
    // Save to context DB
    const newT = registerNewTenant(
      hotelName || 'My Boutique Resort',
      businessType,
      {
        address,
        city,
        country,
        currency,
        timezone,
        checkInTime,
        checkOutTime,
        wifiPassword,
        breakfastPolicy,
        description: description || `Welcome to ${hotelName || 'My Boutique Resort'}. Experience pure relaxation.`,
        phone: phone || '+91 99999 88888',
        email: email || 'reservations@hotel.com'
      },
      {
        logo: logoUrl || '🏨',
        primaryColor,
        secondaryColor,
        font: fontFamily,
        buttonStyle
      },
      rooms as Room[],
      template
    );
    setRegisteredSubdomain(newT.subdomain);
    setStep(7);
  };

  const handleFinalize = () => {
    triggerOnboardingState(true);
    navigate('/app/dashboard');
  };

  const colors = [
    { name: 'Teal', primary: '#0f766e', secondary: '#0d9488' },
    { name: 'Navy', primary: '#1e3a8a', secondary: '#2563eb' },
    { name: 'Emerald', primary: '#064e3b', secondary: '#059669' },
    { name: 'Rose Gold', primary: '#881337', secondary: '#e11d48' },
    { name: 'Burgundy', primary: '#5c061b', secondary: '#be123c' },
    { name: 'Charcoal', primary: '#1f2937', secondary: '#4b5563' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-6 flex items-center justify-center font-sans antialiased relative">
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl relative">
        
        {/* Onboarding Steps Indicators */}
        {step < 7 && (
          <div className="mb-10">
            <div className="flex justify-between items-center relative max-w-xl mx-auto">
              <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-blue-50 -z-10" />
              <div 
                className="absolute left-2 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 transition-all duration-300 -z-10" 
                style={{ width: `${((step - 1) / 5) * 100}%` }}
              />
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                      step === num 
                        ? 'bg-[#3872fa] text-black border-[#3872fa] shadow-md shadow-emerald-500/20 scale-105' 
                        : step > num
                          ? 'bg-blue-50 text-[#3872fa] border-emerald-800'
                          : 'bg-white text-slate-400 border-slate-100'
                    }`}
                  >
                    {num}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6 space-y-1">
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#3872fa]">
                {step === 1 && 'Step 1: Account details'}
                {step === 2 && 'Step 2: Business details'}
                {step === 3 && 'Step 3: Hotel settings'}
                {step === 4 && 'Step 4: Rooms setup'}
                {step === 5 && 'Step 5: Brand customizing'}
                {step === 6 && 'Step 6: Website theme'}
              </h3>
              <p className="text-lg font-bold text-slate-800 font-outfit">
                {step === 1 && 'Let\'s create your Owner Profile'}
                {step === 2 && 'Tell us about your Hospitality business'}
                {step === 3 && 'Configure checks, policies, & features'}
                {step === 4 && 'Input room categories & price rates'}
                {step === 5 && 'Tailor logo coordinates & colors'}
                {step === 6 && 'Select your layout website template'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: Account Creation */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Sharma" 
                  value={userName} 
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. rahul@sharma.com" 
                  value={userEmail} 
                  onChange={e => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Secure Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={userPass} 
                  onChange={e => setUserPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(2)}
                disabled={!userName || !userEmail}
                className="px-6 py-3 rounded-full bg-[#3872fa] hover:bg-emerald-400 text-[#0b130e] font-bold text-sm disabled:opacity-40 disabled:hover:bg-[#3872fa] transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Business Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Hotel Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Goa Palms Beach Resort" 
                  value={hotelName} 
                  onChange={e => setHotelName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Business Type</label>
                <select 
                  value={businessType} 
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white"
                >
                  <option value="Boutique Hotel">Boutique Hotel</option>
                  <option value="Luxury Resort">Luxury Resort</option>
                  <option value="Homestay">Homestay</option>
                  <option value="Eco Resort">Eco Resort</option>
                  <option value="Guest House">Guest House</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Business Phone</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 98765 00000" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Business Email</label>
                <input 
                  type="email" 
                  placeholder="e.g. reservations@hotel.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Street Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. Calangute Main Road, near beach" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">City</label>
                <input 
                  type="text" 
                  placeholder="e.g. Goa" 
                  value={city} 
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Currency</label>
                <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full border border-emerald-900 text-[#3872fa] font-bold text-sm cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={!hotelName || !city}
                className="px-6 py-3 rounded-full bg-[#3872fa] hover:bg-emerald-400 text-[#0b130e] font-bold text-sm disabled:opacity-40 transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Hotel settings */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Hotel Description</label>
                <textarea 
                  rows={2}
                  placeholder="Summarize your property experience for guests..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Check-In Time</label>
                <input 
                  type="time" 
                  value={checkInTime} 
                  onChange={e => setCheckInTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Check-Out Time</label>
                <input 
                  type="time" 
                  value={checkOutTime} 
                  onChange={e => setCheckOutTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Guest Wi-Fi Password</label>
                <input 
                  type="text" 
                  value={wifiPassword} 
                  onChange={e => setWifiPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Breakfast Policy</label>
                <select 
                  value={breakfastPolicy} 
                  onChange={e => setBreakfastPolicy(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#3872fa] text-sm bg-white"
                >
                  <option value="included">Free Breakfast Included</option>
                  <option value="paid">Paid Breakfast Available</option>
                  <option value="none">No Breakfast Provided</option>
                </select>
              </div>

              {/* Amenities Manager */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa]">General Amenities</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. Free Parking" 
                    value={newAmenity} 
                    onChange={e => setNewAmenity(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none text-xs" 
                  />
                  <button 
                    onClick={addAmenity} 
                    className="px-4 py-2 bg-blue-50 text-[#3872fa] rounded-lg hover:bg-emerald-900 text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {amenities.map((a, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-blue-50 text-[#3872fa] border border-slate-200 text-xs flex items-center gap-1.5">
                      {a}
                      <button onClick={() => removeAmenity(i)} className="text-[#3872fa] hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-1.5">Hotel Image (Optional)</label>
                
                {logoUrl && (
                  <div className="relative group w-full h-40 border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-slate-50 mb-3">
                    <img src={logoUrl} alt="Hotel Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
                      >
                        Replace Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="px-3 py-1 bg-red-650 hover:bg-red-750 text-slate-800 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}

                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setLogoUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-6 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragOver 
                      ? 'border-[#3872fa] bg-blue-50' 
                      : 'border-slate-200 hover:border-[#3872fa] bg-slate-50 hover:bg-blue-50/5'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setLogoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-[#3872fa] mb-2" />
                  <span className="text-xs font-bold text-slate-500 leading-none">
                    {dragOver ? 'Drop hotel image here' : 'Drop hotel image, or click to browse'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full border border-emerald-900 text-[#3872fa] font-bold text-sm cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-full bg-[#3872fa] hover:bg-emerald-400 text-[#0b130e] font-bold text-sm transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Room setup */}
        {step === 4 && (
          <div className="space-y-6">
            
            {/* Room type list */}
            <div className="space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#3872fa]">Current Room inventory</span>
              {rooms.map((rm, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div>
                    <span className="block font-bold text-slate-800 text-sm">{rm.name}</span>
                    <span className="block text-[#3872fa]/80 font-semibold mt-1">
                      {rm.type} • {rm.maxGuests} Guests max • {currency === 'INR' ? '₹' : '$'}{rm.basePrice}/night • {rm.count} Rooms available
                    </span>
                    <span className="block text-slate-500 mt-1 italic">
                      Amenities: {rm.amenities.join(', ')}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeRoomType(idx)} 
                    disabled={rooms.length === 1}
                    className="text-red-500 hover:text-red-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Room Creator Form */}
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                + Add Room Type Category
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#3872fa] mb-1">Room Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sea View Deluxe Suite" 
                    value={roomName} 
                    onChange={e => setRoomName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded text-slate-800 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#3872fa] mb-1">Room Type</label>
                  <select 
                    value={roomType} 
                    onChange={e => setRoomType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded text-slate-800 focus:outline-none"
                  >
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Premium Suite">Premium Suite</option>
                    <option value="Family Room">Family Room</option>
                    <option value="Standard Room">Standard Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#3872fa] mb-1">Max Guests</label>
                  <input 
                    type="number" 
                    value={roomGuests} 
                    onChange={e => setRoomGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded text-slate-800 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#3872fa] mb-1">Price per Night</label>
                  <input 
                    type="number" 
                    value={roomPrice} 
                    onChange={e => setRoomPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded text-slate-800 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#3872fa] mb-1">Number of Rooms</label>
                  <input 
                    type="number" 
                    value={roomCount} 
                    onChange={e => setRoomCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded text-slate-800 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#3872fa] mb-1">Amenities (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="King Bed, Balcony, Wi-Fi" 
                    value={roomAmenitiesText} 
                    onChange={e => setRoomAmenitiesText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded text-slate-800 focus:outline-none" 
                  />
                </div>
              </div>
              <button 
                onClick={addRoomType}
                className="w-full py-2 bg-blue-50 hover:bg-emerald-900 text-[#3872fa] font-bold text-xs rounded border border-emerald-800 transition-colors"
              >
                Add Room Category to Setup
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-full border border-emerald-900 text-[#3872fa] font-bold text-sm cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(5)}
                disabled={rooms.length === 0}
                className="px-6 py-3 rounded-full bg-[#3872fa] hover:bg-emerald-400 text-[#0b130e] font-bold text-sm disabled:opacity-40 transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Branding */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-5">
              
              {/* Primary Color Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-2">Primary Accent Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => { setPrimaryColor(c.primary); setSecondaryColor(c.secondary); }}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center border text-xs font-bold transition-all ${
                        primaryColor === c.primary ? 'border-white scale-105' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.primary }}
                    >
                      <span className="bg-black/50 text-[10px] text-slate-800 px-1.5 py-0.5 rounded font-medium">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-2">Typography Font style</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setFontFamily('outfit')}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      fontFamily === 'outfit' ? 'bg-blue-50 border-[#3872fa]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="block font-bold text-sm font-outfit">Outfit</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Modern Resort</span>
                  </button>
                  <button
                    onClick={() => setFontFamily('sans')}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      fontFamily === 'sans' ? 'bg-blue-50 border-[#3872fa]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="block font-bold text-sm font-sans">Jakarta Sans</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Boutique & Clean</span>
                  </button>
                  <button
                    onClick={() => setFontFamily('serif')}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      fontFamily === 'serif' ? 'bg-blue-50 border-[#3872fa]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="block font-bold text-sm font-serif">Playfair styled</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Luxury Premium</span>
                  </button>
                </div>
              </div>

              {/* Button Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3872fa] mb-2">Button Shape Style</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setButtonStyle('rounded-full')}
                    className={`py-3 rounded-full border text-xs font-bold text-center transition-all ${
                      buttonStyle === 'rounded-full' ? 'bg-blue-50 border-[#3872fa]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    Pill Shape
                  </button>
                  <button
                    onClick={() => setButtonStyle('rounded-md')}
                    className={`py-3 rounded-md border text-xs font-bold text-center transition-all ${
                      buttonStyle === 'rounded-md' ? 'bg-blue-50 border-[#3872fa]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    Rounded Box
                  </button>
                  <button
                    onClick={() => setButtonStyle('square')}
                    className={`py-3 rounded-none border text-xs font-bold text-center transition-all ${
                      buttonStyle === 'square' ? 'bg-blue-50 border-[#3872fa]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    Sharp Square
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-full border border-emerald-900 text-[#3872fa] font-bold text-sm cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(6)}
                className="px-6 py-3 rounded-full bg-[#3872fa] hover:bg-emerald-400 text-[#0b130e] font-bold text-sm transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Website Template */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'luxury', title: 'Luxury Hotel', desc: 'Classic, spacious, serif-heavy style centered around fine imagery.' },
                { id: 'modern', title: 'Modern Resort', desc: 'Clean, geometry-heavy with vibrant color details, great for beach-houses.' },
                { id: 'boutique', title: 'Boutique Hotel', desc: 'Unique text spacings, curated cards, centered layout aesthetics.' },
                { id: 'minimal', title: 'Minimal Stay', desc: 'High white spaces, minimal frames, neat layout for homestays.' }
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setTemplate(tmpl.id as any)}
                  className={`p-6 rounded-xl border text-left flex flex-col justify-between h-40 transition-all ${
                    template === tmpl.id ? 'bg-blue-50 border-[#3872fa] shadow-lg shadow-blue-500/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="block font-bold text-slate-800 text-base font-outfit">{tmpl.title}</span>
                    <span className="block text-xs text-slate-500 mt-2 leading-relaxed">{tmpl.desc}</span>
                  </div>
                  <div className="flex justify-between items-center w-full mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#3872fa]">Choose Template</span>
                    {template === tmpl.id && <CheckCircle className="w-4.5 h-4.5 text-[#3872fa]" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-full border border-emerald-900 text-[#3872fa] font-bold text-sm cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={handleLaunch}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-[#3872fa] to-[#6366f1] text-black font-extrabold text-sm transition-all cursor-pointer shadow-lg shadow-blue-500/10"
              >
                Launch Platform
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: Launch Screen */}
        {step === 7 && (
          <div className="text-center py-10 space-y-8">
            <div className="w-16 h-16 bg-[#3872fa]/10 border border-[#3872fa] text-[#3872fa] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
              <Rocket className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-slate-800 font-outfit">Your hotel website is ready!</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                We've established your isolated organization tenant and generated your storefront layout at:
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[#3872fa] text-xs font-bold font-mono">
                /site/{registeredSubdomain}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <a 
                href={`/site/${registeredSubdomain}`} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-3.5 rounded-full border border-emerald-800 hover:bg-emerald-900/20 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-[#3872fa]" />
                View Website
              </a>
              <button 
                onClick={handleFinalize}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#3872fa] to-[#6366f1] text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
