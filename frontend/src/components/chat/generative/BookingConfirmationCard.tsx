import React, { useState } from 'react';
import { Calendar, CheckCircle2, Copy, Check, ShieldCheck } from 'lucide-react';

export interface BookingConfirmationCardProps {
  bookingId: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  currency?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

export const BookingConfirmationCard: React.FC<BookingConfirmationCardProps> = ({
  bookingId,
  guestName,
  roomName,
  checkIn,
  checkOut,
  totalAmount,
  currency = 'INR',
  status = 'confirmed',
}) => {
  const [copied, setCopied] = useState(false);
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCancelled = status === 'cancelled';
  const isPending = status === 'pending';

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-md text-slate-800">
      {/* Header ribbon */}
      <div className={`px-3.5 py-2.5 flex items-center justify-between text-white ${
        isCancelled ? 'bg-red-700' : isPending ? 'bg-amber-600' : 'bg-emerald-800'
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-bold tracking-wide uppercase">
            {isCancelled ? 'Booking Cancelled' : isPending ? 'Reservation Requested' : 'Booking Confirmed'}
          </span>
        </div>
        <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
          {status.toUpperCase()}
        </span>
      </div>

      {/* Body details */}
      <div className="p-3.5 space-y-3">
        {/* Booking Reference */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 block leading-none">Booking ID</span>
            <span className="text-xs font-mono font-bold text-slate-900">{bookingId}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Guest & Room */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block font-medium">Guest</span>
            <span className="font-bold text-slate-800 line-clamp-1">{guestName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-medium">Room Type</span>
            <span className="font-bold text-slate-800 line-clamp-1">{roomName}</span>
          </div>
        </div>

        {/* Dates Bar */}
        <div className="flex items-center justify-between text-xs bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-700" />
            <div>
              <span className="text-[10px] text-slate-500 block leading-none">Check-in</span>
              <span className="font-bold text-slate-800">{checkIn}</span>
            </div>
          </div>
          <span className="text-slate-400 font-bold">→</span>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block leading-none">Check-out</span>
            <span className="font-bold text-slate-800">{checkOut}</span>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">Total Amount</span>
          <span className="text-sm font-extrabold text-slate-900">
            {currencySymbol}{totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Bottom guarantee */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Guaranteed by StayOS Hospitality Cloud</span>
        </div>
      </div>
    </div>
  );
};
