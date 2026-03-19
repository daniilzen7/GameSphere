'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { PlayerNavbar } from '@/components/player-navbar';
import { AuthGuard } from '@/components/auth-guard';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const notify = useNotificationStore();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.fullName || '');

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe(),
  });

  useEffect(() => {
    if (data?.data) {
      setFullName(data.data.fullName || '');
      setUser(data.data);
    }
  }, [data, setUser]);

  const updateMutation = useMutation({
    mutationFn: (name: string) => usersApi.updateMe({ fullName: name }),
    onSuccess: (res) => {
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      notify.success('Профиль обновлён');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => notify.error('Ошибка обновления профиля'),
  });

  return (
    <AuthGuard>
      <PlayerNavbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Профиль</h1>

        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Имя</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
            <input type="email" value={user?.email || ''} disabled className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Роль</label>
            <input type="text" value={user?.role === 'MANAGER' ? 'Менеджер' : 'Игрок'} disabled className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-500" />
          </div>

          <button
            onClick={() => updateMutation.mutate(fullName)}
            disabled={updateMutation.isPending || !fullName.trim()}
            className="bg-brand-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </main>
    </AuthGuard>
  );
}
