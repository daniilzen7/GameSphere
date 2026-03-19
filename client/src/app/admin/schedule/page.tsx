'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { Pencil } from 'lucide-react';
import { adminScheduleApi } from '@/lib/api/admin/schedule';
import { useNotificationStore } from '@/stores/notification';

export default function SchedulePage() {
  const notify = useNotificationStore();
  const queryClient = useQueryClient();

  const today = format(new Date(), 'yyyy-MM-dd');
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

  const [editDialog, setEditDialog] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [form, setForm] = useState({ openTime: '10:00', closeTime: '22:00', note: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-schedule', dateFrom, dateTo],
    queryFn: () => adminScheduleApi.list({ dateFrom, dateTo }),
    enabled: !!dateFrom,
  });

  const upsertMutation = useMutation({
    mutationFn: () => adminScheduleApi.upsert(editDate, form),
    onSuccess: () => {
      notify.success('Расписание обновлено');
      queryClient.invalidateQueries({ queryKey: ['admin-schedule'] });
      setEditDialog(false);
    },
    onError: (err: any) => notify.error(err.response?.data?.error?.message || 'Ошибка'),
  });

  const schedules = data?.data ?? [];

  const openEdit = (date: string, openTime = '10:00', closeTime = '22:00', note = '') => {
    setEditDate(date);
    setForm({ openTime, closeTime, note });
    setEditDialog(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Расписание работы</h1>

      <div className="flex gap-3 mb-6">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">С</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">По</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
        </div>
        <div className="self-end">
          <button onClick={() => openEdit(today)} className="bg-brand-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-700 transition-colors">
            + Добавить дату
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Загрузка...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-10 text-slate-400">Расписание не задано</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 bg-slate-50">
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Открытие</th>
                <th className="px-4 py-3 font-medium">Закрытие</th>
                <th className="px-4 py-3 font-medium">Примечание</th>
                <th className="px-4 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.scheduleId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-600">{s.date}</td>
                  <td className="px-4 py-3 text-slate-500">{s.openTime}</td>
                  <td className="px-4 py-3 text-slate-500">{s.closeTime}</td>
                  <td className="px-4 py-3 text-slate-400">{s.note || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(s.date, s.openTime, s.closeTime, s.note || '')} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                      <Pencil size={14} className="text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border shadow-card w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Расписание на {editDate}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Дата</label>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">Открытие</label>
                  <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">Закрытие</label>
                  <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Примечание</label>
                <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" placeholder="Например: сокращённый день" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditDialog(false)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors">Отмена</button>
              <button onClick={() => upsertMutation.mutate()} disabled={upsertMutation.isPending} className="px-4 py-2 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
                {upsertMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
