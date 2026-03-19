'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { adminHallsApi } from '@/lib/api/admin/halls';
import { useNotificationStore } from '@/stores/notification';
import type { Hall, GameTable } from '@/lib/types';

export default function HallsPage() {
  const notify = useNotificationStore();
  const queryClient = useQueryClient();

  const [expandedHall, setExpandedHall] = useState<string | null>(null);
  const [hallDialog, setHallDialog] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [hallForm, setHallForm] = useState({ name: '', description: '' });

  const [tableDialog, setTableDialog] = useState(false);
  const [tableHallId, setTableHallId] = useState<string | null>(null);
  const [tableForm, setTableForm] = useState({ label: '', seats: 4 });

  const { data: hallsData, isLoading } = useQuery({
    queryKey: ['admin-halls'],
    queryFn: () => adminHallsApi.list(),
  });

  const { data: tablesData } = useQuery({
    queryKey: ['admin-tables', expandedHall],
    queryFn: () => adminHallsApi.listTables(expandedHall!),
    enabled: !!expandedHall,
  });

  const hallMutation = useMutation({
    mutationFn: (data: { name: string; description: string; hallId?: string }) => {
      if (data.hallId) return adminHallsApi.update(data.hallId, { name: data.name, description: data.description });
      return adminHallsApi.create({ name: data.name, description: data.description });
    },
    onSuccess: () => {
      notify.success(editingHall ? 'Зал обновлён' : 'Зал создан');
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] });
      setHallDialog(false);
    },
    onError: (err: any) => notify.error(err.response?.data?.error?.message || 'Ошибка'),
  });

  const deleteHallMutation = useMutation({
    mutationFn: adminHallsApi.delete,
    onSuccess: () => {
      notify.success('Зал деактивирован');
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] });
    },
  });

  const tableMutation = useMutation({
    mutationFn: (data: { hallId: string; label: string; seats: number }) =>
      adminHallsApi.createTable(data.hallId, { label: data.label, seats: data.seats }),
    onSuccess: () => {
      notify.success('Столик добавлен');
      queryClient.invalidateQueries({ queryKey: ['admin-tables'] });
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] });
      setTableDialog(false);
    },
    onError: (err: any) => notify.error(err.response?.data?.error?.message || 'Ошибка'),
  });

  const deleteTableMutation = useMutation({
    mutationFn: adminHallsApi.deleteTable,
    onSuccess: () => {
      notify.success('Столик деактивирован');
      queryClient.invalidateQueries({ queryKey: ['admin-tables'] });
      queryClient.invalidateQueries({ queryKey: ['admin-halls'] });
    },
  });

  const halls = hallsData?.data ?? [];
  const tables: GameTable[] = tablesData?.data ?? [];

  const openCreateHall = () => {
    setEditingHall(null);
    setHallForm({ name: '', description: '' });
    setHallDialog(true);
  };

  const openEditHall = (hall: Hall) => {
    setEditingHall(hall);
    setHallForm({ name: hall.name, description: hall.description || '' });
    setHallDialog(true);
  };

  const openAddTable = (hallId: string) => {
    setTableHallId(hallId);
    setTableForm({ label: '', seats: 4 });
    setTableDialog(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Залы и столики</h1>
        <button onClick={openCreateHall} className="flex items-center gap-2 bg-brand-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-600-dark transition-colors">
          <Plus size={16} /> Добавить зал
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Загрузка...</div>
      ) : (
        <div className="space-y-3">
          {halls.map((hall) => (
            <div key={hall.hallId} className="bg-white rounded-2xl border shadow-card overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedHall(expandedHall === hall.hallId ? null : hall.hallId)}
              >
                <div className="flex items-center gap-3">
                  {expandedHall === hall.hallId ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  <div>
                    <span className="font-medium text-slate-700">{hall.name}</span>
                    <span className="ml-2 text-sm text-slate-400">({hall.tablesCount} столиков)</span>
                  </div>
                  {!hall.isActive && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium">Неактивен</span>
                  )}
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEditHall(hall)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                    <Pencil size={14} className="text-slate-400" />
                  </button>
                  <button onClick={() => deleteHallMutation.mutate(hall.hallId)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-rose-400" />
                  </button>
                </div>
              </div>

              {expandedHall === hall.hallId && (
                <div className="border-t shadow-card px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">Столики</span>
                    <button onClick={() => openAddTable(hall.hallId)} className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                      + Добавить столик
                    </button>
                  </div>
                  {tables.length === 0 ? (
                    <p className="text-sm text-slate-400">Нет столиков</p>
                  ) : (
                    <div className="space-y-2">
                      {tables.map((table) => (
                        <div key={table.tableId} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                          <div className="text-sm">
                            <span className="font-medium text-slate-600">{table.label}</span>
                            <span className="text-slate-400 ml-2">{table.seats} мест</span>
                            {!table.isActive && (
                              <span className="ml-2 text-xs text-rose-500">(неактивен)</span>
                            )}
                          </div>
                          <button onClick={() => deleteTableMutation.mutate(table.tableId)} className="p-1 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={12} className="text-rose-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hall Dialog */}
      {hallDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border shadow-card w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{editingHall ? 'Редактировать зал' : 'Новый зал'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Название</label>
                <input type="text" value={hallForm.name} onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })} className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Описание</label>
                <textarea rows={2} value={hallForm.description} onChange={(e) => setHallForm({ ...hallForm, description: e.target.value })} className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setHallDialog(false)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors">Отмена</button>
              <button onClick={() => hallMutation.mutate({ ...hallForm, hallId: editingHall?.hallId })} disabled={hallMutation.isPending || !hallForm.name.trim()} className="px-4 py-2 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-600-dark transition-colors disabled:opacity-50">
                {hallMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Dialog */}
      {tableDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border shadow-card w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Добавить столик</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Метка (напр. A1)</label>
                <input type="text" value={tableForm.label} onChange={(e) => setTableForm({ ...tableForm, label: e.target.value })} className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Мест</label>
                <input type="number" min={1} value={tableForm.seats} onChange={(e) => setTableForm({ ...tableForm, seats: Number(e.target.value) })} className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setTableDialog(false)} className="px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors">Отмена</button>
              <button onClick={() => tableHallId && tableMutation.mutate({ hallId: tableHallId, ...tableForm })} disabled={tableMutation.isPending || !tableForm.label.trim()} className="px-4 py-2 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-600-dark transition-colors disabled:opacity-50">
                {tableMutation.isPending ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
