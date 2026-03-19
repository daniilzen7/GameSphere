'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';
import { BookingCard } from '@/components/booking-card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PlayerNavbar } from '@/components/player-navbar';
import { AuthGuard } from '@/components/auth-guard';
import { useNotificationStore } from '@/stores/notification';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const tabs = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Завершённые' },
  { key: 'cancelled', label: 'Отменённые' },
];

export default function MyBookingsPage() {
  const notify = useNotificationStore();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', status, page],
    queryFn: () => bookingsApi.getMy({ status, page, perPage: 10 }),
  });

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      notify.success('Бронирование отменено');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setCancelId(null);
    },
    onError: (err: any) => {
      notify.error(err.response?.data?.error?.message || 'Ошибка при отмене');
      setCancelId(null);
    },
  });

  const bookings = data?.data?.items ?? [];
  const pagination = data?.data;

  return (
    <AuthGuard>
      <PlayerNavbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Мои бронирования</h1>

        <div className="flex gap-1 mb-6 p-1 rounded-xl border border-slate-200 w-fit bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatus(tab.key); setPage(1); }}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-sm transition-colors',
                status === tab.key
                  ? 'bg-brand-50 text-brand-600 font-medium'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-400">Загрузка...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Бронирований нет</div>
        ) : (
          <>
            <div className="space-y-3">
              {bookings.map((b) => (
                <BookingCard key={b.bookingId} booking={b} onCancel={(id) => setCancelId(id)} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-30 text-slate-400 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-slate-500 font-medium">{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-30 text-slate-400 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        <ConfirmDialog
          open={!!cancelId}
          title="Отменить бронирование?"
          message="Вы уверены, что хотите отменить бронирование? Это действие необратимо."
          confirmText="Отменить бронь"
          confirmColor="red"
          loading={cancelMutation.isPending}
          onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
          onCancel={() => setCancelId(null)}
        />
      </main>
    </AuthGuard>
  );
}
