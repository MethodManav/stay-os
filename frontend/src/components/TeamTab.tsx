import React, { useState } from 'react';
import { useApp } from '../AppContext';
import type { TeamMember } from '../db';
import { 
  Plus, 
  Trash2, 
  X, 
  Edit,
  Mail,
  Award
} from 'lucide-react';

export const TeamTab: React.FC = () => {
  const { activeTenant, addTeamMember, updateTeamMember, deleteTeamMember } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamMember['role']>('staff');

  const team = activeTenant.team || [];

  const openCreateModal = () => {
    setSelectedMember(null);
    setName('');
    setEmail('');
    setRole('staff');
    setEditorOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setEditorOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      updateTeamMember({
        ...selectedMember,
        name,
        email,
        role
      });
    } else {
      addTeamMember({
        name,
        email,
        role
      });
    }
    setEditorOpen(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e2e1d7] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1e] font-outfit">Team Management</h1>
          <p className="text-xs text-[#7a7974] mt-1 font-semibold">Coordinate access control credentials for staff and managers</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#1b4332] text-white hover:bg-[#143324] font-bold text-xs shadow-md shadow-[#1b4332]/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Team list on the left */}
        <div className="lg:col-span-2 bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[#e2e1d7] pb-3">
            <h3 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide font-outfit">Active Members</h3>
            <span className="text-[10px] text-[#7a7974]">Manage permissions for hotel portal accounts</span>
          </div>

          <div className="divide-y divide-[#e2e1d7]/60">
            {team.map((member) => (
              <div key={member.id} className="py-4 flex justify-between items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f4f3ed] border border-[#e2e1d7] flex items-center justify-center font-bold text-[#1b4332]">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a1a1e] flex items-center gap-1.5">
                      {member.name}
                      {member.role === 'owner' && <Award className="w-3.5 h-3.5 text-orange-500" />}
                    </h4>
                    <span className="text-[10px] text-[#7a7974] flex items-center gap-1 mt-0.5"><Mail className="w-3.5 h-3.5" /> {member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    member.role === 'owner' ? 'bg-orange-100 text-orange-850' :
                    member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'manager' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {member.role}
                  </span>

                  <button
                    onClick={() => openEditModal(member)}
                    disabled={member.role === 'owner'}
                    className="p-1 text-[#1b4332] hover:bg-[#f4f3ed] rounded disabled:opacity-20 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTeamMember(member.id)}
                    disabled={member.role === 'owner'}
                    className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roles details card on the right */}
        <div className="bg-white border border-[#e2e1d7] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-[#e2e1d7] pb-3">
            <h3 className="text-sm font-bold text-[#1a1a1e] uppercase tracking-wide">Role Permissions</h3>
            <span className="text-[10px] text-[#7a7974]">Breakdown of access permissions</span>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {[
              { role: 'Owner', desc: 'Full root access to billing, pricing, custom domains, settings, and staff credentials.' },
              { role: 'Admin', desc: 'Can manage bookings, adjust room pricing, and edit visual website builder sections.' },
              { role: 'Manager', desc: 'Permitted to override rooms, view guests, check-in arrivals, and manage reservations.' },
              { role: 'Staff', desc: 'Access limited to reading/replying to escalated AI conversations and check-out ledger.' },
            ].map((rule, i) => (
              <div key={i} className="p-3 bg-[#fcfbf9] border border-[#e2e1d7] rounded-xl space-y-1">
                <span className="font-extrabold text-[#1b4332] uppercase tracking-wider text-[9px]">{rule.role} Access</span>
                <p className="text-[#7a7974] leading-relaxed text-[11px]">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Editor Modal Popup */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white border border-[#e2e1d7] rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#e2e1d7] pb-3">
              <h3 className="text-base font-extrabold text-[#1b4332] font-outfit">
                {selectedMember ? `Edit Credentials: ${selectedMember.name}` : 'Invite Team Member'}
              </h3>
              <button onClick={() => setEditorOpen(false)} className="text-[#7a7974] hover:text-[#1a1a1e]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-[#1a1a1e]">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7a7974] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  placeholder="e.g. Kiran Naik"
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e1d7] rounded-lg focus:outline-none focus:border-[#1b4332]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7a7974] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  placeholder="e.g. kiran@hotel.com"
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e1d7] rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7a7974] mb-1">Access Role Permission</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#e2e1d7] rounded-lg focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e1d7]">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 border border-[#e2e1d7] hover:bg-[#f4f3ed] text-[#7a7974] font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1b4332] hover:bg-[#143324] text-white font-bold rounded-lg cursor-pointer shadow-sm shadow-[#1b4332]/10"
                >
                  Confirm Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default TeamTab;
