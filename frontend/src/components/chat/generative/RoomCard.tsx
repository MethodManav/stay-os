import React from 'react';
import { BedDouble, Users, ArrowRight, Check } from 'lucide-react';

export interface RoomCardProps {
  roomId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  capacity?: number;
  amenities?: string[];
  imageUrl?: string;
  onBookNow?: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  roomId,
  name,
  description,
  price,
  currency = 'INR',
  capacity = 2,
  amenities = [],
  imageUrl,
  onBookNow,
}) => {
  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-emerald-150 bg-white shadow-md transition-all hover:shadow-lg text-slate-800">
      {/* Room Image or Gradient Header */}
      {imageUrl ? (
        <div className="relative h-32 w-full overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
            {capacity} Guests Max
          </div>
        </div>
      ) : (
        <div className="relative flex h-20 w-full items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 px-3.5 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <BedDouble className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-medium tracking-wide uppercase text-emerald-200">Room Selection</span>
              <h4 className="text-xs font-bold leading-tight line-clamp-1">{name}</h4>
            </div>
          </div>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
            {capacity} Guests
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {imageUrl && (
          <div className="flex items-start justify-between gap-1 mb-1">
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{name}</h4>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
              <Users className="h-3 w-3" />
              <span>{capacity}</span>
            </div>
          </div>
        )}

        {description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
            {description}
          </p>
        )}

        {/* Amenities badges */}
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-100"
              >
                <Check className="h-2.5 w-2.5 text-emerald-600" />
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price & Book CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
          <div>
            <span className="text-[10px] text-slate-600 uppercase font-semibold block leading-none">Starting from</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-extrabold text-slate-900">{currencySymbol}{price.toLocaleString()}</span>
              <span className="text-[10px] text-slate-600">/ night</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onBookNow) {
                onBookNow(roomId);
              } else {
                window.dispatchEvent(new CustomEvent('stayos:book_room', { detail: { roomId } }));
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer"
          >
            <span>Book Now</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
