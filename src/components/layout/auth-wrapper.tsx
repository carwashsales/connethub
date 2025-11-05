'use client';

import { useUser, useFirestore } from '@/firebase/index';
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

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  const userDocRef = useMemo(() => {
    if (!db || !authUser?.uid) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser?.uid]);

  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (authLoading || userProfileLoading) {
      return; 
    }

    if (authUser && isPublicPage) {
      router.push('/');
    }
    
    if (!authUser && !isPublicPage) {
      router.push('/login');
    }
  }, [authLoading, userProfileLoading, authUser, isPublicPage, router, pathname]);

  const isLoading = authLoading || (authUser && userProfileLoading);

  if (isLoading) {
      return <FullPageLoader />;
  }

  if (isPublicPage && !authUser) {
    return <>{children}</>;
  }

  if (authUser && userProfile) {
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }
  
  if (!authUser && !isPublicPage) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
