'use client';

import { useFirestore, useUser } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from './app-layout';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

function FullPageLoader() {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 animate-spin text-primary"
            >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
        </div>
    )
}

const PUBLIC_PATHS = ['/login', '/signup'];

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  const userDocRef = useMemo(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!mounted || authLoading) return;

    if (authUser && isPublicPage) {
      router.push('/');
    }
    if (!authUser && !isPublicPage) {
      router.push('/login');
    }
  }, [mounted, authLoading, authUser, isPublicPage, router, pathname]);

  if (!mounted || authLoading || (authUser && userProfileLoading && !isPublicPage)) {
    return <FullPageLoader />;
  }

  if (isPublicPage) {
    return authUser ? <FullPageLoader /> : <>{children}</>;
  }
  
  if (authUser) {
    if (userProfile) {
      return <AppLayout user={userProfile}>{children}</AppLayout>;
    }
  }
  
  return <FullPageLoader />;
}
