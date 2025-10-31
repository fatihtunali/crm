'use client';

import { AuthGuard } from '@/lib/auth/auth-guard';
import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 pl-64">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
