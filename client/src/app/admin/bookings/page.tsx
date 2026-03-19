'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { adminBookingsApi } from '@/lib/api/admin/bookings';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useNotificationStore } from '@/stores/notification';
import { clsx } from 'clsx';

const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'cancelled', label: 'Отменённые' },
  { value: 'completed', label: 'Завершённые' },
];

export default function BookingsGridPage() {
  const notify = useNotificationStore();
  const queryClient = useQueryClient();

  const today = format(new Date(), 'yyyy-MM-dd');
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('active');
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', dateFrom, dateTo, status],
    queryFn: () =>
      adminBookingsApi.list({
        dateFrom,
        dateTo: dateTo || undefined,
        status: status === 'all' ? undefined : status,
      }),
    enabled: !!dateFrom,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminBookingsApi.update(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      notify.success('Бронирование отменено');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setCancelId(null);
    },
    onError: (err: any) => notify.error(err.response?.data?.error?.message || 'Ошибка'),
  });

  const bookings = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Сетка бронирований</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Дата с</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Дата по</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Загрузка...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 text-slate-400">Нет бронирований</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 bg-slate-50">
                <th className="px-4 py-3 font-medium">Столик</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Игра</th>
                <th className="px-4 py-3 font-medium">Время</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.bookingId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600">{b.table.hallName}, {b.table.label}</td>
                  <td className="px-4 py-3 text-slate-600">{b.user?.fullName || b.user?.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{b.game?.title || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {format(new Date(b.startAt), 'dd.MM HH:mm')} —{' '}
                    {format(new Date(b.endAt), 'HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'text-xs px-2.5 py-0.5 rounded-full font-medium',
                        b.status === 'ACTIVE' && 'bg-emerald-50 text-emerald-600',
                        b.status === 'CANCELLED' && 'bg-rose-50 text-rose-600',
                        b.status === 'COMPLETED' && 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {b.status === 'ACTIVE' ? 'Активно' : b.status === 'CANCELLED' ? 'Отменено' : 'Завершено'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'ACTIVE' && (
                      <button
                        onClick={() => setCancelId(b.bookingId)}
                        className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
                      >
                        Отменить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelId}
        title="Отменить бронирование?"
        message="Бронирование будет отменено."
        confirmText="Отменить бронь"
        confirmColor="red"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
