'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Gamepad2,
  CalendarDays,
  DoorOpen,
  Clock,
  Bell,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/api/auth';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Дашборд' },
  { href: '/admin/games', icon: Gamepad2, label: 'Игры' },
  { href: '/admin/bookings', icon: CalendarDays, label: 'Бронирования' },
  { href: '/admin/halls', icon: DoorOpen, label: 'Залы' },
  { href: '/admin/schedule', icon: Clock, label: 'Расписание' },
  { href: '/admin/notifications', icon: Bell, label: 'Уведомления' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 flex flex-col z-40">
      <div className="px-5 py-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">GameSphere</span>
        </Link>
        <p className="text-xs text-slate-500 mt-1.5 pl-[42px]">Панель управления</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 space-y-0.5 border-t border-white/10 pt-3 mt-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
        >
          <ArrowLeft size={18} />
          На сайт
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 w-full transition-all"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
