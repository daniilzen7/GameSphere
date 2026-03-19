'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Gamepad2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { Booking } from '@/lib/types';

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
  ACTIVE: { label: 'Активно', dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Отменено', dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700' },
  COMPLETED: { label: 'Завершено', dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600' },
};

interface Props {
  booking: Booking;
  onCancel?: (id: string) => void;
}

export function BookingCard({ booking, onCancel }: Props) {
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const status = statusConfig[booking.status] ?? statusConfig.COMPLETED;

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Calendar size={15} className="text-brand-400" />
            <span className="font-medium">{format(start, 'd MMMM yyyy', { locale: ru })}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <Clock size={15} className="text-brand-400" />
            <span>{format(start, 'HH:mm')} — {format(end, 'HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <MapPin size={15} className="text-brand-400" />
            <span>{booking.hallName}, столик {booking.tableLabel}</span>
          </div>
          {booking.gameTitle && (
            <div className="flex items-center gap-2.5 text-sm text-slate-500">
              <Gamepad2 size={15} className="text-brand-400" />
              <span>{booking.gameTitle}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2.5">
          <span className={clsx('inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium', status.bg)}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', status.dot)} />
            {status.label}
          </span>
          {booking.status === 'ACTIVE' && onCancel && (
            <button
              onClick={() => onCancel(booking.bookingId)}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              Отменить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
