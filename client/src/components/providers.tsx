'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/api/auth';
import { Snackbar } from '@/components/snackbar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, hydrate } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();

    authApi.me()
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch(() => {
        /* not authenticated — leave user as null or from localStorage */
      })
      .finally(() => setReady(true));
  }, [hydrate, setUser]);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Snackbar />
    </QueryClientProvider>
  );
}
