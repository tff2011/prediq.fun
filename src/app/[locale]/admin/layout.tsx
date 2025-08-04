'use client';

import { usePathname } from 'next/navigation';
import AdminGuard from '~/components/AdminGuard';
import AdminNav from '~/components/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname?.includes('/admin/login');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}