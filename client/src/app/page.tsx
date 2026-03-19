'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { gamesApi } from '@/lib/api/games';
import { GameCard } from '@/components/game-card';
import { PlayerNavbar } from '@/components/player-navbar';
import { AuthGuard } from '@/components/auth-guard';

export default function GamesPage() {
  const [search, setSearch] = useState('');
  const [complexity, setComplexity] = useState('');
  const [minPlayers, setMinPlayers] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ['games', { search: deferredSearch, complexity, minPlayers, sortBy, sortOrder, page }],
    queryFn: () =>
      gamesApi.list({
        search: deferredSearch || undefined,
        complexity: complexity || undefined,
        minPlayers: minPlayers || undefined,
        sortBy,
        sortOrder,
        page,
        perPage: 12,
      }),
  });

  const games = data?.data?.items ?? [];
  const pagination = data?.data;

  return (
    <AuthGuard>
      <PlayerNavbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Каталог игр</h1>
          <p className="text-slate-500 text-sm mt-1">Выберите игру и забронируйте столик</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 rounded-lg border-slate-200 focus:border-brand-500 focus:ring-brand-500/20 text-sm placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <select
                value={complexity}
                onChange={(e) => { setComplexity(e.target.value); setPage(1); }}
                className="rounded-lg border-slate-200 text-sm text-slate-600 focus:border-brand-500 focus:ring-brand-500/20"
              >
                <option value="">Сложность</option>
                <option value="EASY">Лёгкая</option>
                <option value="MEDIUM">Средняя</option>
                <option value="HARD">Сложная</option>
              </select>

              <input
                type="number"
                placeholder="Мин. игроков"
                min={1}
                value={minPlayers}
                onChange={(e) => { setMinPlayers(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
                className="w-28 rounded-lg border-slate-200 text-sm focus:border-brand-500 focus:ring-brand-500/20 placeholder:text-slate-400"
              />

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split('-');
                  setSortBy(s);
                  setSortOrder(o);
                }}
                className="rounded-lg border-slate-200 text-sm text-slate-600 focus:border-brand-500 focus:ring-brand-500/20"
              >
                <option value="title-asc">А → Я</option>
                <option value="title-desc">Я → А</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-400">Загрузка...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium">Игры не найдены</p>
            <p className="text-sm text-slate-400 mt-1">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <GameCard key={game.gameId} game={game} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg hover:bg-white disabled:opacity-30 text-slate-400 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-slate-500 font-medium px-3">{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-white disabled:opacity-30 text-slate-400 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </AuthGuard>
  );
}
