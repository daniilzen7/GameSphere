'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Users, Sparkles, Tag, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { gamesApi } from '@/lib/api/games';
import { PlayerNavbar } from '@/components/player-navbar';
import { AuthGuard } from '@/components/auth-guard';

const complexityLabel: Record<string, string> = { EASY: 'Лёгкая', MEDIUM: 'Средняя', HARD: 'Сложная' };
const complexityStyle: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-rose-100 text-rose-700',
};

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['game', id],
    queryFn: () => gamesApi.get(id),
  });

  const game = data?.data;

  return (
    <AuthGuard>
      <PlayerNavbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Назад
        </button>

        {isLoading ? (
          <div className="text-center py-20 text-slate-400">Загрузка...</div>
        ) : !game ? (
          <div className="text-center py-20 text-slate-400">Игра не найдена</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{game.title}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {game.complexity && (
                <span className={clsx('inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-medium', complexityStyle[game.complexity])}>
                  <Sparkles size={12} />
                  {complexityLabel[game.complexity]}
                </span>
              )}
              {game.genre && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-brand-50 text-brand-700 font-medium">
                  <Tag size={12} />
                  {game.genre}
                </span>
              )}
              {(game.minPlayers || game.maxPlayers) && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                  <Users size={12} />
                  {game.minPlayers && game.maxPlayers
                    ? `${game.minPlayers}–${game.maxPlayers} игроков`
                    : game.minPlayers ? `от ${game.minPlayers} игроков` : `до ${game.maxPlayers} игроков`}
                </span>
              )}
              {game.totalCopies > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                  <Copy size={12} />
                  {game.totalCopies} {game.totalCopies === 1 ? 'экземпляр' : game.totalCopies < 5 ? 'экземпляра' : 'экземпляров'}
                </span>
              )}
            </div>

            {game.description && (
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{game.description}</p>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => router.push('/booking')}
                className="bg-brand-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Забронировать столик
              </button>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
