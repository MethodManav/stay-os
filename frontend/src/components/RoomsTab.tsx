import React, { useState } from 'react';
import { useApp } from '../AppContext';
import type { Room } from '../db';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Bed, 
  Users
} from 'lucide-react';

export const RoomsTab: React.FC = () => {
  const { activeTenant, addRoom, updateRoom, deleteRoom } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('Deluxe Room');
  const [maxGuests, setMaxGuests] = useState(2);
  const [basePrice, setBasePrice] = useState(2999);
  const [count, setCount] = useState(10);
  const [status, setStatus] = useState<Room['status']>('available');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [image, setImage] = useState('');

  const currencySymbol = activeTenant.settings.currency === 'INR' ? '₹' : '$';
  const rooms = activeTenant.rooms || [];

  const openCreateModal = () => {
    setSelectedRoom(null);
    setName('');
    setType('Deluxe Room');
    setMaxGuests(2);
    setBasePrice(3499);
    setCount(10);
    setStatus('available');
    setAmenitiesText('King Bed, Ocean View, Free Wi-Fi, Air Conditioning');
    setImage('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85');
    setEditorOpen(true);
  };

  const openEditModal = (room: Room) => {
    setSelectedRoom(room);
    setName(room.name);
    setType(room.type);
    setMaxGuests(room.maxGuests);
    setBasePrice(room.basePrice);
    setCount(room.count);
    setStatus(room.status);
    setAmenitiesText(room.amenities.join(', '));
    setImage(room.image);
    setEditorOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmenities = amenitiesText.split(',').map(a => a.trim()).filter(Boolean);
    
    if (selectedRoom) {
      updateRoom({
        ...selectedRoom,
        name,
        type,
        maxGuests,
        basePrice,
        count,
        status,
        amenities: parsedAmenities,
        image: image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85'
      });
    } else {
      addRoom({
        name,
        type,
        maxGuests,
        basePrice,
        count,
        status,
        amenities: parsedAmenities,
        image: image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=85'
      });
    }
    setEditorOpen(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary font-outfit">Inventory Setup</h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Configure room types, pricing, and availability states</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-hover font-bold text-xs shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Room Category</span>
        </button>
      </div>

      {/* Room Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          return (
            <div 
              key={room.id} 
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                room.status === 'maintenance' ? 'border-amber-200' : 'border-border-subtle'
              }`}
            >
              
              {/* Image Header with status badges */}
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                />
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider shadow-sm ${
                    room.status === 'available' ? 'bg-emerald-500 text-black' :
                    room.status === 'occupied' ? 'bg-blue-600 text-white' :
                    'bg-amber-500 text-black'
                  }`}>
                    {room.status}
                  </span>
                </div>

                {/* Price tag */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold font-mono">
                  {currencySymbol}{room.basePrice.toLocaleString()} <span className="text-[11px] font-normal text-slate-300">/ night</span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">{room.type}</span>
                  <h3 className="text-base font-extrabold text-text-primary leading-snug">{room.name}</h3>
                  
                  {/* Meta stats */}
                  <div className="flex gap-4 text-xs font-semibold text-text-secondary pt-1">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Max Guests: {room.maxGuests}</span>
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> Total: {room.count} rooms</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {room.amenities.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#f1f5f9] border border-border-subtle text-[10px] font-bold text-text-primary">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border-subtle pt-3.5 flex justify-between items-center">
                  <button
                    onClick={() => openEditModal(room)}
                    className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Specifications</span>
                  </button>
                  <button
                    onClick={() => deleteRoom(room.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
        
        {rooms.length === 0 && (
          <div className="col-span-3 text-center py-20 bg-white border border-border-subtle border-dashed rounded-2xl text-text-secondary">
            No rooms configured. Click "Create Room Category" to establish inventory.
          </div>
        )}
      </div>

      {/* Editor Modal Popup */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white border border-border-subtle rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <h3 className="text-base font-extrabold text-brand-primary font-outfit">
                {selectedRoom ? `Edit Category: ${selectedRoom.name}` : 'Add Room Category'}
              </h3>
              <button onClick={() => setEditorOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-text-primary">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Room Category Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    placeholder="e.g. Oceanfront Suite"
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Room Type Class</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  >
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Premium Suite">Premium Suite</option>
                    <option value="Family Room">Family Room</option>
                    <option value="Standard Room">Standard Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Max Guests Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={maxGuests}
                    onChange={e => setMaxGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Base Price / Night ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={basePrice}
                    onChange={e => setBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Total Rooms Count</label>
                  <input
                    type="number"
                    min={1}
                    value={count}
                    onChange={e => setCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Current State Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Room Cover Image URL</label>
                <input
                  type="text"
                  value={image}
                  placeholder="https://images.unsplash.com/photo-..."
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Amenities List (comma separated)</label>
                <input
                  type="text"
                  value={amenitiesText}
                  placeholder="King Bed, Ocean View, Wi-Fi"
                  onChange={e => setAmenitiesText(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 border border-border-subtle hover:bg-[#f1f5f9] text-text-secondary font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-white font-bold rounded-lg cursor-pointer shadow-sm shadow-brand-primary/10"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default RoomsTab;
