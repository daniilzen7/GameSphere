'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { gamesApi } from '@/lib/api/games';
import { adminGamesApi } from '@/lib/api/admin/games';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useNotificationStore } from '@/stores/notification';
import type { Game, CreateGameRequest } from '@/lib/types';
import { clsx } from 'clsx';

const complexityOptions = [
  { value: 'EASY', label: 'Лёгкая' },
  { value: 'MEDIUM', label: 'Средняя' },
  { value: 'HARD', label: 'Сложная' },
];

export default function GamesManagePage() {
  const notify = useNotificationStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateGameRequest>({
    title: '',
    description: '',
    minPlayers: undefined,
    maxPlayers: undefined,
    complexity: undefined,
    genre: '',
    totalCopies: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-games', deferredSearch, page],
    queryFn: () => gamesApi.list({ search: deferredSearch || undefined, page, perPage: 15 }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: CreateGameRequest & { gameId?: string }) => {
      if (data.gameId) return adminGamesApi.update(data.gameId, data);
      return adminGamesApi.create(data);
    },
    onSuccess: () => {
      notify.success(editingGame ? 'Игра обновлена' : 'Игра добавлена');
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      closeDialog();
    },
    onError: (err: any) => notify.error(err.response?.data?.error?.message || 'Ошибка'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminGamesApi.delete,
    onSuccess: () => {
      notify.success('Игра архивирована');
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      setDeleteId(null);
    },
    onError: () => notify.error('Ошибка при удалении'),
  });

  const openCreate = () => {
    setEditingGame(null);
    setForm({ title: '', description: '', minPlayers: undefined, maxPlayers: undefined, complexity: undefined, genre: '', totalCopies: 1 });
    setDialogOpen(true);
  };

  const openEdit = (game: Game) => {
    setEditingGame(game);
    setForm({
      title: game.title,
      description: game.description || '',
      minPlayers: game.minPlayers || undefined,
      maxPlayers: game.maxPlayers || undefined,
      complexity: game.complexity || undefined,
      genre: game.genre || '',
      totalCopies: game.totalCopies ?? 1,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingGame(null);
  };

  const handleSave = () => {
    saveMutation.mutate({ ...form, gameId: editingGame?.gameId });
  };

  const games = data?.data?.items ?? [];
  const pagination = data?.data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Управление играми</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand/20"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10 text-gray-300">Загрузка...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Жанр</th>
                <th className="px-4 py-3 font-medium">Игроки</th>
                <th className="px-4 py-3 font-medium">Сложность</th>
                <th className="px-4 py-3 font-medium">Копий</th>
                <th className="px-4 py-3 font-medium w-24">Действия</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.gameId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-700">{game.title}</td>
                  <td className="px-4 py-3 text-gray-400">{game.genre || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {game.minPlayers && game.maxPlayers
                      ? `${game.minPlayers}–${game.maxPlayers}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {game.complexity ? (
                      <span
                        className={clsx(
                          'text-xs px-2.5 py-0.5 rounded-full font-medium',
                          game.complexity === 'EASY' && 'bg-emerald-50 text-emerald-600',
                          game.complexity === 'MEDIUM' && 'bg-amber-50 text-amber-600',
                          game.complexity === 'HARD' && 'bg-rose-50 text-rose-600',
                        )}
                      >
                        {complexityOptions.find((c) => c.value === game.complexity)?.label}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{game.totalCopies ?? 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(game)} className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                        <Pencil size={14} className="text-gray-400" />
                      </button>
                      <button onClick={() => setDeleteId(game.gameId)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-xl hover:bg-gray-50 disabled:opacity-30 text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-400">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="p-2 rounded-xl hover:bg-gray-50 disabled:opacity-30 text-gray-400">
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingGame ? 'Редактировать игру' : 'Новая игра'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">Название</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">Описание</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Мин. игроков</label>
                  <input type="number" min={1} value={form.minPlayers || ''} onChange={(e) => setForm({ ...form, minPlayers: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Макс. игроков</label>
                  <input type="number" min={1} value={form.maxPlayers || ''} onChange={(e) => setForm({ ...form, maxPlayers: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Сложность</label>
                  <select value={form.complexity || ''} onChange={(e) => setForm({ ...form, complexity: e.target.value || undefined })} className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand/20">
                    <option value="">—</option>
                    {complexityOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Жанр</label>
                  <input type="text" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand/20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">Кол-во экземпляров</label>
                <input type="number" min={1} value={form.totalCopies || 1} onChange={(e) => setForm({ ...form, totalCopies: e.target.value ? Number(e.target.value) : 1 })} className="w-full rounded-xl border-gray-200 text-sm focus:border-brand focus:ring-brand/20" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeDialog} className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">Отмена</button>
              <button onClick={handleSave} disabled={saveMutation.isPending || !form.title.trim()} className="px-4 py-2 text-sm rounded-xl bg-brand text-white hover:bg-brand-600 transition-colors disabled:opacity-50">
                {saveMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Архивировать игру?"
        message="Игра будет скрыта из каталога. Это действие можно отменить."
        confirmText="Архивировать"
        confirmColor="red"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
