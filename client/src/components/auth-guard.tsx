'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export function AuthGuard({
  children,
  requireManager,
}: {
  children: React.ReactNode;
  requireManager?: boolean;
}) {
  const router = useRouter();
  const { isAuthenticated, isManager } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (requireManager && !isManager) {
      router.replace('/');
    }
  }, [isAuthenticated, isManager, requireManager, router]);

  if (!isAuthenticated) return null;
  if (requireManager && !isManager) return null;

  return <>{children}</>;
}
