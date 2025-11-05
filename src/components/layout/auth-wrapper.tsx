'use client';

import { useUser, useFirestore } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
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
    if (authLoading) return; // Wait until authentication state is determined

    if (authUser && isPublicPage) {
        // Authenticated user on a public page, redirect to home
        router.push('/');
    } else if (!authUser && !isPublicPage) {
        // Unauthenticated user on a protected page, redirect to login
        router.push('/login');
    }
  }, [authLoading, authUser, isPublicPage, pathname, router]);


  if (authLoading || (authUser && userProfileLoading)) {
      return <FullPageLoader />;
  }

  if (authUser && userProfile) {
    // User is authenticated and profile is loaded, show the app
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  if (!authUser && isPublicPage) {
    // Unauthenticated user on a public page, show login/signup
    return <>{children}</>;
  }

  // Fallback for transitional states, like redirecting.
  return <FullPageLoader />;
}
