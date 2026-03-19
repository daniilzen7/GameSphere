'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Gamepad2, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/api/auth';

const navLinks = [
  { href: '/', label: 'Каталог' },
  { href: '/booking', label: 'Бронирование' },
  { href: '/my-bookings', label: 'Мои брони' },
];

export function PlayerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isManager, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Gamepad2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">GameSphere</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
              menuOpen ? 'bg-slate-100' : 'hover:bg-slate-50',
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {(user?.fullName || user?.email || '?')[0].toUpperCase()}
            </div>
            <span className="hidden sm:inline text-slate-700 font-medium">{user?.fullName || user?.email}</span>
            <ChevronDown size={14} className={clsx('text-slate-400 transition-transform', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-float py-1.5 animate-scale-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.fullName || user?.email}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Settings size={15} /> Профиль
              </Link>
              {isManager && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Shield size={15} /> Панель управления
                </Link>
              )}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 w-full text-left transition-colors"
                >
                  <LogOut size={15} /> Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
