'use client';

import { useUser, useFirestore, useAuth } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { AppLayout } from './app-layout';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

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
    console.log('[AuthWrapper useEffect] Running checks...', { authLoading, authUser, userProfile: !!userProfile, userProfileLoading, isPublicPage, pathname });
    if (authLoading) {
      console.log('[AuthWrapper useEffect] Auth is loading. No action.');
      return;
    }

    if (!authUser && !isPublicPage) {
      console.log('[AuthWrapper useEffect] No auth user on private page. Redirecting to /login.');
      router.push('/login');
    } else if (authUser && isPublicPage) {
      console.log('[AuthWrapper useEffect] Auth user on public page. Redirecting to /.');
      router.push('/');
    } else if (authUser && !userProfile && !userProfileLoading) {
      // This is the new crucial check.
      // If the user is authenticated but their profile doesn't exist and we are done loading,
      // it means their user record is incomplete. We should sign them out and ask them to log in again.
      console.error('[AuthWrapper useEffect] CRITICAL: User is authenticated but profile document does not exist. Signing out.');
      toast({
        title: 'User Profile Missing',
        description: 'Your user profile was not found. Please log in again to create it.',
        variant: 'destructive'
      });
      auth?.signOut();
      router.push('/login');
    } else {
      console.log('[AuthWrapper useEffect] No redirection needed.');
    }
  }, [authLoading, authUser, userProfile, userProfileLoading, isPublicPage, pathname, router, auth, toast]);

  if (authLoading || (authUser && userProfileLoading)) {
    console.log('[AuthWrapper] Render: Main loading check passed. Showing FullPageLoader.');
    return <FullPageLoader />;
  }

  if (authUser && userProfile) {
    console.log('[AuthWrapper] Render: authUser and userProfile exist. Rendering AppLayout.');
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  if (!authUser && isPublicPage) {
    console.log('[AuthWrapper] Render: No auth user on public page. Rendering children.');
    return <>{children}</>;
  }
  
  console.log('[AuthWrapper] Render: Fallback, showing FullPageLoader.');
  return <FullPageLoader />;
}
