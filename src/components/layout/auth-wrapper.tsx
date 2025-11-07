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
  );
}

const PUBLIC_PATHS = ['/login', '/signup'];

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  const userDocRef = useMemo(() => {
    if (!db || !authUser) {
      return null;
    }
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    // If still loading auth state, don't do anything yet.
    if (authLoading) {
      return;
    }

    // If there's no authenticated user and the page is not public, redirect to login.
    if (!authUser && !isPublicPage) {
      router.push('/login');
    }
    // If there is an authenticated user and they are on a public page (like login/signup), redirect to home.
    else if (authUser && isPublicPage) {
      router.push('/');
    }
  }, [authLoading, authUser, isPublicPage, pathname, router]);

  // While checking auth state, show a loader.
  if (authLoading) {
    return <FullPageLoader />;
  }

  // If the user is authenticated and we are on a private page,
  // we need to wait for their profile to load before rendering the layout.
  if (authUser && !isPublicPage) {
    if (userProfileLoading) {
        return <FullPageLoader />;
    }
    // Once profile is loaded (or we know it doesn't exist), render the app.
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  // If the user is not authenticated and we are on a public page, show the page content.
  if (!authUser && isPublicPage) {
    return <>{children}</>;
  }
  
  // This is a fallback loader for edge cases, like when redirecting.
  return <FullPageLoader />;
}
