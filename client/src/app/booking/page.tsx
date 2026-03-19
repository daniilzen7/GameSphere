'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';
import { gamesApi } from '@/lib/api/games';
import { SlotPicker } from '@/components/slot-picker';
import { PlayerNavbar } from '@/components/player-navbar';
import { AuthGuard } from '@/components/auth-guard';
import { useNotificationStore } from '@/stores/notification';
import type { AvailableSlot } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Check, CircleDot, Gamepad2 } from 'lucide-react';
import { clsx } from 'clsx';

const steps = [
  { num: 1, label: 'Параметры' },
  { num: 2, label: 'Слот' },
  { num: 3, label: 'Подтверждение' },
];

export default function BookingPage() {
  const router = useRouter();
  const notify = useNotificationStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [duration, setDuration] = useState(120);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: gamesData } = useQuery({
    queryKey: ['games-for-booking'],
    queryFn: () => gamesApi.list({ perPage: 100 }),
  });

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['available-slots', date, guests, duration],
    queryFn: () => bookingsApi.getAvailableSlots({ date, guests, durationMinutes: duration }),
    enabled: searchTriggered && !!date,
  });

  const createMutation = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      notify.success('Столик успешно забронирован!');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      router.push('/my-bookings');
    },
    onError: (err: any) => notify.error(err.response?.data?.error?.message || 'Ошибка при бронировании'),
  });

  const handleSearch = () => {
    if (!date) return;
    setSearchTriggered(true);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;
    createMutation.mutate({
      tableId: selectedSlot.tableId,
      date,
      startTime: selectedSlot.startTime,
      durationMinutes: duration,
      ...(selectedGameId ? { gameId: selectedGameId } : {}),
    });
  };

  const slots = slotsData?.data?.slots ?? [];
  const clubHours = slotsData?.data?.clubHours;
  const allGames = gamesData?.data?.items ?? [];
  const selectedGame = allGames.find((g) => g.gameId === selectedGameId);

  return (
    <AuthGuard>
      <PlayerNavbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Бронирование</h1>
        <p className="text-slate-500 text-sm mb-8">Выберите параметры и забронируйте столик</p>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className={clsx(
                'flex items-center gap-2 text-sm font-medium transition-colors',
                step >= s.num ? 'text-brand-600' : 'text-slate-400',
              )}>
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step > s.num ? 'bg-brand-600 text-white' : step === s.num ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-600/20' : 'bg-slate-100 text-slate-400',
                )}>
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={clsx('w-8 h-px', step > s.num ? 'bg-brand-300' : 'bg-slate-200')} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Параметры</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setSearchTriggered(false); setStep(1); }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Гостей</label>
              <input
                type="number"
                min={1} max={8}
                value={guests}
                onChange={(e) => { setGuests(Number(e.target.value)); setSearchTriggered(false); setStep(1); }}
                className="w-full rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Длительность</label>
              <select
                value={duration}
                onChange={(e) => { setDuration(Number(e.target.value)); setSearchTriggered(false); setStep(1); }}
                className="w-full rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20"
              >
                {[1, 2, 3, 4, 5, 6].map((h) => (
                  <option key={h} value={h * 60}>
                    {h} {h === 1 ? 'час' : h < 5 ? 'часа' : 'часов'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Игра (необязательно)</label>
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="w-full sm:w-auto min-w-[200px] rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20"
            >
              <option value="">Без игры</option>
              {allGames.map((g) => (
                <option key={g.gameId} value={g.gameId}>{g.title}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={!date}
            className="mt-5 bg-brand-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40"
          >
            Найти столики
          </button>
        </div>

        {/* Step 2 */}
        {step >= 2 && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-4 animate-fade-in">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-2">Выберите слот</h2>
            {clubHours && (
              <p className="text-sm text-slate-400 mb-4 flex items-center gap-1.5">
                <CircleDot size={12} />
                Клуб работает с {clubHours.openTime} до {clubHours.closeTime}
              </p>
            )}
            {slotsLoading ? (
              <div className="text-center py-10 text-slate-400">Загрузка слотов...</div>
            ) : (
              <SlotPicker slots={slots} selected={selectedSlot} onSelect={(slot) => { setSelectedSlot(slot); setStep(3); }} />
            )}
          </div>
        )}

        {/* Step 3 */}
        {step >= 3 && selectedSlot && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-fade-in">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Подтверждение</h2>
            <div className="bg-brand-50 rounded-xl p-4 space-y-2.5 mb-6">
              <div className="flex items-center gap-2.5 text-sm text-brand-700">
                <Calendar size={15} /> {date}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-brand-700">
                <Clock size={15} /> {selectedSlot.startTime} — {selectedSlot.endTime}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-brand-700">
                <MapPin size={15} /> {selectedSlot.hallName}, столик {selectedSlot.tableLabel}
              </div>
              {selectedGame && (
                <div className="flex items-center gap-2.5 text-sm text-brand-700">
                  <Gamepad2 size={15} /> {selectedGame.title}
                </div>
              )}
            </div>
            <button
              onClick={handleConfirm}
              disabled={createMutation.isPending}
              className="bg-brand-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Бронирование...' : 'Подтвердить бронирование'}
            </button>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
