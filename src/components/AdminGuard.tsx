'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '~/utils/adminAuth';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}