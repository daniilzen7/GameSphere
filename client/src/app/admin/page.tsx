'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Gamepad2, DoorOpen } from 'lucide-react';
import { format } from 'date-fns';
import { adminBookingsApi } from '@/lib/api/admin/bookings';
import { gamesApi } from '@/lib/api/games';
import { adminHallsApi } from '@/lib/api/admin/halls';
import Link from 'next/link';

export default function DashboardPage() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings-today'],
    queryFn: () => adminBookingsApi.list({ dateFrom: today, status: 'active' }),
  });

  const { data: gamesData } = useQuery({
    queryKey: ['games-count'],
    queryFn: () => gamesApi.list({ perPage: 1 }),
  });

  const { data: hallsData } = useQuery({
    queryKey: ['halls-list'],
    queryFn: () => adminHallsApi.list(),
  });

  const todayBookings = bookingsData?.data ?? [];
  const gamesCount = gamesData?.data?.totalItems ?? 0;
  const hallsCount = hallsData?.data?.length ?? 0;

  const stats = [
    {
      icon: CalendarDays,
      label: 'Бронирований сегодня',
      value: todayBookings.length,
      href: '/admin/bookings',
    },
    { icon: Gamepad2, label: 'Игр в каталоге', value: gamesCount, href: '/admin/games' },
    { icon: DoorOpen, label: 'Залов', value: hallsCount, href: '/admin/halls' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Дашборд</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-50 rounded-lg">
                <stat.icon size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {todayBookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Активные брони сегодня</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2.5 font-medium">Столик</th>
                  <th className="pb-2.5 font-medium">Клиент</th>
                  <th className="pb-2.5 font-medium">Время</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map((b) => (
                  <tr key={b.bookingId} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 text-slate-600">
                      {b.table.hallName}, {b.table.label}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {b.user?.fullName || b.user?.email || '—'}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {format(new Date(b.startAt), 'HH:mm')} —{' '}
                      {format(new Date(b.endAt), 'HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
