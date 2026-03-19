'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminNotificationsApi } from '@/lib/api/admin/notifications';
import { useNotificationStore } from '@/stores/notification';
import { clsx } from 'clsx';

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'QUEUED', label: 'В очереди' },
  { value: 'SENT', label: 'Отправлено' },
  { value: 'FAILED', label: 'Ошибка' },
];

const templateOptions = [
  { value: '', label: 'Все шаблоны' },
  { value: 'BOOKING_CREATED', label: 'Бронирование создано' },
  { value: 'BOOKING_CANCELLED', label: 'Бронирование отменено' },
  { value: 'WELCOME', label: 'Приветствие' },
  { value: 'REMINDER_24H', label: 'Напоминание' },
];

export default function NotificationsPage() {
  const notify = useNotificationStore();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState('');
  const [template, setTemplate] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', status, template, page],
    queryFn: () =>
      adminNotificationsApi.list({
        status: status || undefined,
        template: template || undefined,
        page,
        perPage: 20,
      }),
  });

  const retryMutation = useMutation({
    mutationFn: adminNotificationsApi.retry,
    onSuccess: () => {
      notify.success('Повторная отправка запущена');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (err: any) => notify.error(err.response?.data?.error?.message || 'Ошибка'),
  });

  const notifications = data?.data?.items ?? [];
  const pagination = data?.data;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Email-уведомления</h1>

      <div className="flex gap-3 mb-6">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20">
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={template} onChange={(e) => { setTemplate(e.target.value); setPage(1); }} className="rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20">
          {templateOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Загрузка...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-slate-400">Нет уведомлений</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b shadow-card text-left text-slate-400">
                <th className="px-4 py-3 font-medium">Шаблон</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Создано</th>
                <th className="px-4 py-3 font-medium">Отправлено</th>
                <th className="px-4 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.notificationId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-gray-600">
                    {templateOptions.find((t) => t.value === n.template)?.label || n.template}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'text-xs px-2.5 py-0.5 rounded-full font-medium',
                        n.status === 'SENT' && 'bg-emerald-50 text-emerald-600',
                        n.status === 'QUEUED' && 'bg-amber-50 text-amber-600',
                        n.status === 'FAILED' && 'bg-rose-50 text-rose-600',
                      )}
                    >
                      {statusOptions.find((s) => s.value === n.status)?.label || n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {format(new Date(n.createdAt), 'dd.MM.yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {n.sentAt ? format(new Date(n.sentAt), 'dd.MM.yyyy HH:mm') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {n.status === 'FAILED' && (
                      <button
                        onClick={() => retryMutation.mutate(n.notificationId)}
                        disabled={retryMutation.isPending}
                        className="p-1.5 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Повторить"
                      >
                        <RefreshCw size={14} className="text-brand-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-30 text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-slate-400">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-30 text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
