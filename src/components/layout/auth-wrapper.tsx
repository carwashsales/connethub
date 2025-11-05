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
    // If we are still loading authentication state, don't do any redirects yet.
    if (authLoading) {
      return; 
    }

    // If the user is authenticated...
    if (authUser) {
      // ...and they are on a public page (like login), redirect them to the home page.
      if (isPublicPage) {
        router.push('/');
      }
    } 
    // If the user is not authenticated...
    else {
      // ...and they are on a protected page, redirect them to the login page.
      if (!isPublicPage) {
        router.push('/login');
      }
    }
  }, [authLoading, authUser, isPublicPage, router]);

  // While checking auth state or fetching the user profile, show a loader.
  if (authLoading || (authUser && userProfileLoading)) {
      return <FullPageLoader />;
  }

  // If on a public page and not logged in, show the page (e.g., login form).
  if (isPublicPage && !authUser) {
    return <>{children}</>;
  }

  // If the user is fully authenticated and has a profile, show the app layout.
  if (authUser && userProfile) {
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }
  
  // If we are on a protected page and the user is not logged in, the useEffect will
  // trigger a redirect, so we show a loader while that happens.
  if (!authUser && !isPublicPage) {
    return <FullPageLoader />;
  }
  
  // Fallback to render children if no other condition is met.
  return <>{children}</>;
}
