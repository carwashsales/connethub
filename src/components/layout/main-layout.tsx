'use client';

import { usePathname } from 'next/navigation';
import { AuthWrapper } from '@/components/layout/auth-wrapper';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AuthWrapper>{children}</AuthWrapper>;
}
