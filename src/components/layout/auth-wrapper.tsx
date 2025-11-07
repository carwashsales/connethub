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

  console.log(`[AuthWrapper] Render. Path: ${pathname}. Auth loading: ${authLoading}. Auth user:`, !!authUser);

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  const userDocRef = useMemo(() => {
    if (!db || !authUser) {
      console.log('[AuthWrapper] No db or authUser, userDocRef is null.');
      return null;
    }
    console.log(`[AuthWrapper] Creating doc ref for user: users/${authUser.uid}`);
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  console.log(`[AuthWrapper] userProfile state:`, { userProfile: !!userProfile, userProfileLoading });

  useEffect(() => {
    console.log('[AuthWrapper useEffect] Running checks...', { authLoading, authUser, isPublicPage, pathname });
    // If still loading auth state, don't do anything yet.
    if (authLoading) {
      console.log('[AuthWrapper useEffect] Auth is loading. No action.');
      return;
    }

    // If there's no authenticated user and the page is not public, redirect to login.
    if (!authUser && !isPublicPage) {
      console.log('[AuthWrapper useEffect] No auth user on private page. Redirecting to /login.');
      router.push('/login');
    }
    // If there is an authenticated user and they are on a public page (like login/signup), redirect to home.
    else if (authUser && isPublicPage) {
      console.log('[AuthWrapper useEffect] Auth user on public page. Redirecting to /.');
      router.push('/');
    } else {
      console.log('[AuthWrapper useEffect] No redirection needed.');
    }
  }, [authLoading, authUser, isPublicPage, pathname, router]);

  // While checking auth state, show a loader.
  if (authLoading) {
    console.log('[AuthWrapper] Render: auth is loading, showing FullPageLoader.');
    return <FullPageLoader />;
  }

  // If the user is authenticated and we are on a private page,
  // we need to wait for their profile to load before rendering the layout.
  if (authUser && !isPublicPage) {
    if (userProfileLoading) {
        console.log('[AuthWrapper] Render: authUser exists, but user profile is loading. Showing FullPageLoader.');
        return <FullPageLoader />;
    }
    console.log('[AuthWrapper] Render: authUser and userProfile exist. Rendering AppLayout.');
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  // If the user is not authenticated and we are on a public page, show the page content.
  if (!authUser && isPublicPage) {
    console.log('[AuthWrapper] Render: No auth user on public page. Rendering children.');
    return <>{children}</>;
  }
  
  // This is a fallback loader for edge cases, like when redirecting.
  console.log('[AuthWrapper] Render: Fallback, showing FullPageLoader.');
  return <FullPageLoader />;
}
