'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gamepad2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const notify = useNotificationStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email, password });
      const data = res.data!;
      login(data.user);
      notify.success('Добро пожаловать!');
      router.push(data.user.role === 'MANAGER' ? '/admin' : '/');
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.error?.message || 'Неверный email или пароль'
          : 'Ошибка сети';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
            <Gamepad2 size={28} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Играйте вместе.
            <br />
            <span className="text-brand-200">Бронируйте легко.</span>
          </h2>
          <p className="mt-4 text-brand-200/80 text-lg max-w-md leading-relaxed">
            Забронируйте столик для настольных игр за пару кликов. Удобно, быстро, без звонков.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 mb-4">
              <Gamepad2 size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">GameSphere</h1>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Вход в аккаунт</h1>
            <p className="text-slate-500 text-sm mt-1">Рады видеть вас снова</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 text-sm placeholder:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Пароль</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-slate-300 focus:border-brand-500 focus:ring-brand-500/20 text-sm pr-10 placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Вход...' : (<>Войти <ArrowRight size={16} /></>)}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
