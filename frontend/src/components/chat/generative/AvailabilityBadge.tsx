import React from 'react';
import { CalendarCheck, CalendarX, ArrowRight } from 'lucide-react';

export interface AvailabilityBadgeProps {
  roomName: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  isAvailable: boolean;
  pricePerNight?: number;
  currency?: string;
  onBookNow?: (roomId: string) => void;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  roomName,
  roomId,
  checkIn,
  checkOut,
  isAvailable,
  pricePerNight,
  currency = 'INR',
  onBookNow,
}) => {
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;

  return (
    <div className={`my-2 p-3 rounded-xl border text-xs shadow-sm transition-all ${
      isAvailable
        ? 'bg-emerald-50/80 border-emerald-250 text-emerald-950'
        : 'bg-amber-50/80 border-amber-200 text-amber-950'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          {isAvailable ? (
            <>
              <CalendarCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Available for Your Dates</span>
            </>
          ) : (
            <>
              <CalendarX className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Sold Out / Unavailable</span>
            </>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isAvailable ? 'bg-emerald-200/70 text-emerald-800' : 'bg-amber-200/70 text-amber-800'
        }`}>
          {isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
        </span>
      </div>

      <div className="space-y-1 mb-2">
        <div className="font-semibold text-slate-800">{roomName}</div>
        <div className="text-[11px] text-slate-600">
          Stay: <span className="font-medium text-slate-900">{checkIn}</span> to{' '}
          <span className="font-medium text-slate-900">{checkOut}</span>
        </div>
      </div>

      {isAvailable && (
        <div className="flex items-center justify-between pt-1.5 border-t border-emerald-200/60 mt-1">
          {pricePerNight ? (
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-extrabold text-emerald-900">
                {currencySymbol}{pricePerNight.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">/ night</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500">Instant confirmation</span>
          )}

          {roomId && (
            <button
              type="button"
              onClick={() => {
                if (onBookNow) onBookNow(roomId);
                else window.dispatchEvent(new CustomEvent('stayos:book_room', { detail: { roomId } }));
              }}
              className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <span>Book</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
