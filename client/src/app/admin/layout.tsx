'use client';

import { AdminSidebar } from '@/components/admin-sidebar';
import { AuthGuard } from '@/components/auth-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireManager>
      <AdminSidebar />
      <main className="ml-56 min-h-screen p-6">{children}</main>
    </AuthGuard>
  );
}
