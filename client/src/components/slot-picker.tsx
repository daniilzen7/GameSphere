'use client';

import { clsx } from 'clsx';
import { Clock, MapPin, Users, CalendarX } from 'lucide-react';
import type { AvailableSlot } from '@/lib/types';

interface Props {
  slots: AvailableSlot[];
  selected: AvailableSlot | null;
  onSelect: (slot: AvailableSlot) => void;
}

export function SlotPicker({ slots, selected, onSelect }: Props) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarX size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Нет доступных слотов</p>
        <p className="text-sm text-slate-400 mt-1">Попробуйте другой день или параметры</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {slots.map((slot) => {
        const isSelected = selected?.slotId === slot.slotId;
        return (
          <button
            key={slot.slotId}
            onClick={() => onSelect(slot)}
            className={clsx(
              'text-left rounded-xl border-2 p-4 transition-all duration-150',
              isSelected
                ? 'border-brand-500 bg-brand-50 shadow-glow'
                : 'border-transparent bg-white shadow-card hover:shadow-card-hover hover:border-slate-200',
            )}
          >
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <Clock size={14} className={isSelected ? 'text-brand-500' : 'text-slate-400'} />
              {slot.startTime} — {slot.endTime}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <MapPin size={12} />
              {slot.hallName}, столик {slot.tableLabel}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <Users size={12} />
              {slot.seats} мест
            </div>
          </button>
        );
      })}
    </div>
  );
}
