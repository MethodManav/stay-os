import React, { useState } from 'react';
import { useApp } from '../AppContext';
import type { Guest } from '../db';
import { 
  Search, 
  Plus, 
  Edit, 
  X, 
  Mail, 
  Phone, 
  Tag, 
  Award
} from 'lucide-react';

export const CustomersTab: React.FC = () => {
  const { activeTenant, addGuest, updateGuest } = useApp();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tags, setTags] = useState<Guest['tags']>([]);
  const [notes, setNotes] = useState('');
  const [preferences, setPreferences] = useState('');
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalSpending, setTotalSpending] = useState(0);
  const [lastVisit, setLastVisit] = useState('');

  const currencySymbol = activeTenant.settings.currency === 'INR' ? '₹' : '$';
  const guests = activeTenant.guests || [];

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
                          g.email.toLowerCase().includes(search.toLowerCase()) ||
                          g.phone.includes(search);
    const matchesTag = tagFilter === 'all' || g.tags.includes(tagFilter as any);
    return matchesSearch && matchesTag;
  });

  const openCreateModal = () => {
    setSelectedGuest(null);
    setName('');
    setEmail('');
    setPhone('');
    setTags(['Returning Guest']);
    setNotes('');
    setPreferences('Prefers standard configurations.');
    setTotalBookings(1);
    setTotalSpending(3499);
    setLastVisit('2026-08-18');
    setEditorOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setName(guest.name);
    setEmail(guest.email);
    setPhone(guest.phone);
    setTags(guest.tags);
    setNotes(guest.notes);
    setPreferences(guest.preferences);
    setTotalBookings(guest.totalBookings);
    setTotalSpending(guest.totalSpending);
    setLastVisit(guest.lastVisit);
    setEditorOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGuest) {
      updateGuest({
        ...selectedGuest,
        name,
        email,
        phone,
        tags,
        notes,
        preferences,
        totalBookings,
        totalSpending,
        lastVisit
      });
    } else {
      addGuest({
        name,
        email,
        phone,
        tags,
        notes,
        preferences,
        totalBookings,
        totalSpending,
        lastVisit
      });
    }
    setEditorOpen(false);
  };

  const toggleTag = (tagVal: Guest['tags'][number]) => {
    if (tags.includes(tagVal)) {
      setTags(tags.filter(t => t !== tagVal));
    } else {
      setTags([...tags, tagVal]);
    }
  };

  const allAvailableTags: Guest['tags'][number][] = [
    'VIP', 'Returning Guest', 'Corporate', 'Family', 'International', 'High Value'
  ];

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary font-outfit">SaaS Guest CRM</h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Understand and optimize relationships with your visitors</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-hover font-bold text-xs shadow-md shadow-brand-primary/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guest Profile</span>
        </button>
      </div>

      {/* Filter and search operations */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-border-subtle p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search guests by name, email, or telephone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-xl focus:outline-none focus:border-brand-primary text-xs text-text-primary bg-[#f1f5f9]/30"
          />
        </div>
        
        <div className="flex items-center gap-1 bg-[#f1f5f9]/50 border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-primary">
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="bg-transparent font-bold focus:outline-none"
          >
            <option value="all">All Category Tags</option>
            {allAvailableTags.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CRM list profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGuests.map((guest) => {
          return (
            <div 
              key={guest.id} 
              className="bg-white border border-border-subtle rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              
              {/* Top Section Profile Info */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-brand-primary/10 text-brand-primary border border-border-subtle flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0">
                    {guest.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug flex items-center gap-2">
                      {guest.name}
                      {guest.tags.includes('VIP') && <Award className="w-3.5 h-3.5 text-orange-500 fill-orange-200" />}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-x-3 gap-y-0.5 text-[10px] text-slate-500 font-semibold mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-450" /> {guest.email || 'No email'}</span>
                      <span className="flex items-center gap-1 font-mono tracking-tight text-slate-500"><Phone className="w-3 h-3 text-slate-450" /> {guest.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(guest)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-brand-primary cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1">
                {guest.tags.map((tag, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase border flex items-center gap-1 ${
                    tag === 'VIP' ? 'bg-orange-100 border-orange-200 text-orange-700' :
                    tag === 'High Value' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
                    tag === 'Returning Guest' ? 'bg-blue-100 border-blue-200 text-blue-700' :
                    'bg-[#f1f5f9] border-border-subtle text-slate-700'
                  }`}>
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Lifetime stats grid */}
              <div className="grid grid-cols-3 gap-2 bg-bg-page border border-border-subtle rounded-xl p-3.5 text-center text-xs">
                <div>
                  <span className="block font-extrabold text-text-primary">{guest.totalBookings}</span>
                  <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Total Bookings</span>
                </div>
                <div>
                  <span className="block font-extrabold text-text-primary">{currencySymbol}{guest.totalSpending.toLocaleString()}</span>
                  <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Total Spent</span>
                </div>
                <div>
                  <span className="block font-extrabold text-text-primary">{guest.lastVisit || 'N/A'}</span>
                  <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">Last Visit</span>
                </div>
              </div>

              {/* Profile Details Notes */}
              <div className="space-y-1.5 text-xs">
                {guest.preferences && (
                  <p className="text-text-primary leading-snug">
                    <span className="font-bold text-brand-primary block uppercase tracking-wider text-[11px]">Preferences</span>
                    {guest.preferences}
                  </p>
                )}
                {guest.notes && (
                  <p className="text-text-secondary leading-snug italic">
                    <span className="font-bold text-brand-primary not-italic block uppercase tracking-wider text-[11px]">Staff Notes</span>
                    "{guest.notes}"
                  </p>
                )}
              </div>

            </div>
          );
        })}
        {filteredGuests.length === 0 && (
          <div className="col-span-2 text-center py-20 bg-white border border-border-subtle border-dashed rounded-2xl text-text-secondary">
            No matching guest profiles found.
          </div>
        )}
      </div>

      {/* Editor Modal Popup */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white border border-border-subtle rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <h3 className="text-base font-extrabold text-brand-primary font-outfit">
                {selectedGuest ? `Edit Profile: ${selectedGuest.name}` : 'Add CRM Guest Profile'}
              </h3>
              <button onClick={() => setEditorOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold text-text-primary">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    placeholder="e.g. Vikram Malhotra"
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    placeholder="e.g. vikram@malhotra.com"
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    placeholder="e.g. +91 99000 88000"
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1">Last Visit Date</label>
                  <input
                    type="date"
                    value={lastVisit}
                    onChange={e => setLastVisit(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1">Total Bookings Count</label>
                  <input
                    type="number"
                    min={0}
                    value={totalBookings}
                    onChange={e => setTotalBookings(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1">Total Spending ({currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={totalSpending}
                    onChange={e => setTotalSpending(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Tag selector */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-text-secondary mb-2">Category Badges</label>
                <div className="flex flex-wrap gap-2">
                  {allAvailableTags.map(tagVal => (
                    <button
                      key={tagVal}
                      type="button"
                      onClick={() => toggleTag(tagVal)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        tags.includes(tagVal) 
                          ? 'bg-brand-primary text-white border-transparent' 
                          : 'bg-[#f1f5f9] text-slate-600 border-border-subtle hover:bg-border-subtle/40'
                      }`}
                    >
                      {tagVal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1">Special Preferences</label>
                <input
                  type="text"
                  value={preferences}
                  placeholder="e.g. King size bed, room near elevator"
                  onChange={e => setPreferences(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-text-secondary mb-1">Staff Observation Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  placeholder="e.g. VIP guest, likes fresh flowers in the room."
                  onChange={e => setNotes(e.target.value)}
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default CustomersTab;
