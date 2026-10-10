import React, { useState } from 'react';
import { Sparkles, Clock, Check, Copy, Home, ShieldCheck } from 'lucide-react';

export interface ServiceRequestCardProps {
  requestId: string;
  bookingId: string;
  roomNumber: string;
  roomName?: string;
  guestName?: string;
  serviceType: string;
  status?: string;
  details?: string;
  estimatedArrival?: string;
}

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  requestId,
  bookingId,
  roomNumber,
  roomName,
  guestName,
  serviceType = 'Room Cleaning',
  status = 'Scheduled',
  details,
  estimatedArrival = 'Within 20–35 minutes',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-teal-200 bg-white shadow-md text-slate-800 animate-in fade-in zoom-in-95 duration-200">
      {/* Header ribbon */}
      <div className="px-3.5 py-2.5 flex items-center justify-between text-white bg-gradient-to-r from-teal-800 to-emerald-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          <span className="text-xs font-bold tracking-wide uppercase">
            Housekeeping Dispatched
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Body details */}
      <div className="p-3.5 space-y-3">
        {/* Service Title & Room */}
        <div className="flex items-center justify-between bg-teal-50/70 p-2.5 rounded-lg border border-teal-100">
          <div>
            <span className="text-[10px] uppercase font-semibold text-teal-700 block leading-none">Service Type</span>
            <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">{serviceType}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-teal-700 block leading-none">{roomName || 'Delivering to'}</span>
            <span className="text-xs font-black text-teal-900 mt-0.5 flex items-center gap-1 justify-end">
              <Home className="w-3.5 h-3.5 text-teal-700" />
              {roomNumber}
            </span>
          </div>
        </div>

        {/* Reference & Arrival details */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 block font-medium">Request</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[10px] text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
                title="Copy Request ID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className="font-mono font-bold text-slate-800 text-[10px] block mt-0.5">{requestId}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-medium">Booking</span>
            <span className="font-mono font-bold text-slate-800 text-[10px] block mt-0.5">{bookingId}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 block font-medium">Guest</span>
            <span className="font-bold text-slate-800 text-[10px] block mt-0.5 truncate">{guestName || 'Guest'}</span>
          </div>
        </div>

        {/* Arrival ETA banner */}
        <div className="flex items-center justify-between text-xs bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block leading-none">Estimated Arrival</span>
              <span className="font-bold text-emerald-950 text-xs">{estimatedArrival}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>Verified Stay</span>
          </div>
        </div>

        {/* Context / Instructions */}
        {details && (
          <p className="text-[11px] text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded border border-slate-100 italic">
            "{details}"
          </p>
        )}
      </div>
    </div>
  );
};
