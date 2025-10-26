'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useUser } from '@/firebase/index';
import { useEffect, useState } from 'react';

function AuthDependentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.href = '/login';
    }
  }, [isClient, loading, user]);

  if (!isClient || loading || (!user && window.location.pathname !== '/login' && window.location.pathname !== '/signup')) {
    return null; // Or a loading spinner
  }

  return <AppLayout>{children}</AppLayout>;
}


export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isAuthPage, setIsAuthPage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      setIsAuthPage(currentPath === '/login' || currentPath === '/signup');
    }
  }, []);

  return isAuthPage ? <>{children}</> : <AuthDependentLayout>{children}</AuthDependentLayout>;
}
