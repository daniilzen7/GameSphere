'use client';

import Link from 'next/link';
import { Users, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { Game } from '@/lib/types';

const complexityLabel: Record<string, string> = {
  EASY: 'Лёгкая',
  MEDIUM: 'Средняя',
  HARD: 'Сложная',
};

const complexityStyle: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-rose-100 text-rose-700',
};

export function GameCard({ game }: { game: Game }) {
  const players =
    game.minPlayers && game.maxPlayers
      ? `${game.minPlayers}–${game.maxPlayers}`
      : game.minPlayers
        ? `от ${game.minPlayers}`
        : game.maxPlayers
          ? `до ${game.maxPlayers}`
          : null;

  return (
    <Link href={`/games/${game.gameId}`} className="group">
      <div className="bg-white rounded-2xl shadow-card p-5 h-full flex flex-col transition-all duration-200 group-hover:shadow-card-hover group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
            {game.title}
          </h3>
          <ArrowUpRight
            size={16}
            className="text-slate-300 group-hover:text-brand-500 transition-colors shrink-0 mt-0.5"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {game.complexity && (
            <span className={clsx('text-xs px-2 py-0.5 rounded-md font-medium', complexityStyle[game.complexity])}>
              {complexityLabel[game.complexity]}
            </span>
          )}
          {game.genre && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 font-medium">
              {game.genre}
            </span>
          )}
        </div>

        {players && (
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
            <Users size={13} />
            <span>{players} игроков</span>
          </div>
        )}

        {game.description && (
          <p className="text-sm text-slate-400 line-clamp-2 mt-auto leading-relaxed">{game.description}</p>
        )}
      </div>
    </Link>
  );
}
