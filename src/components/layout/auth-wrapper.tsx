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
  console.log('[FullPageLoader] Rendering');
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

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  console.log('[AuthWrapper] Render:', {
    pathname,
    isPublicPage,
    authLoading,
    authUser: authUser ? { uid: authUser.uid, email: authUser.email } : null,
  });

  const userDocRef = useMemo(() => {
    if (!db || !authUser) {
      console.log('[AuthWrapper useMemo] No db or authUser, returning null');
      return null;
    }
    // ALWAYS fetch the profile of the currently authenticated user.
    console.log(`[AuthWrapper useMemo] Creating doc ref for users/${authUser.uid}`);
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: userProfile, isLoading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  console.log('[AuthWrapper] Post-hooks state:', {
      userProfileLoading,
      userProfile: userProfile ? { name: userProfile.name, uid: userProfile.uid } : null,
  });


  useEffect(() => {
    console.log('[AuthWrapper useEffect] Running effect with state:', {
      authLoading,
      userProfileLoading,
      authUser: authUser ? { uid: authUser.uid } : null,
      userProfile: userProfile ? { uid: userProfile.uid } : null,
      isPublicPage,
      pathname,
    });

    // Don't do anything until all loading is finished.
    if (authLoading || userProfileLoading) {
      console.log('[AuthWrapper useEffect] Waiting: auth or profile is loading.');
      return;
    }

    const isUserAuthenticated = !!authUser;
    const isProfileLoaded = !!userProfile;

    // Case 1: User is not logged in and trying to access a protected page.
    if (!isUserAuthenticated && !isPublicPage) {
      console.log('[AuthWrapper useEffect] User not authenticated, redirecting to /login');
      router.push('/login');
      return;
    }

    // Case 2: User is logged in and trying to access a public page (login/signup).
    if (isUserAuthenticated && isPublicPage) {
      console.log('[AuthWrapper useEffect] User authenticated on public page, redirecting to /');
      router.push('/');
      return;
    }

    // Case 3: User is authenticated, but their profile document is missing.
    // This is an inconsistent state. Sign them out and ask them to log in again.
    if (isUserAuthenticated && !isProfileLoaded) {
      console.log('[AuthWrapper useEffect] CRITICAL: User is authenticated but profile document does not exist. Signing out.');
      toast({
        title: 'User Profile Missing',
        description: 'Your user profile was not found. Please log in again to create it.',
        variant: 'destructive',
      });
      auth?.signOut();
      router.push('/login');
      return;
    }

    console.log('[AuthWrapper useEffect] Effect finished, no action taken.');

  }, [authLoading, userProfileLoading, authUser, userProfile, isPublicPage, pathname, router, auth, toast]);

  // Show a loader while we determine the user's status.
  if (authLoading || (authUser && userProfileLoading)) {
    console.log('[AuthWrapper] Rendering FullPageLoader because auth or profile is loading.');
    return <FullPageLoader />;
  }

  // If the user is logged in and their profile is loaded, show the app.
  if (authUser && userProfile) {
    console.log('[AuthWrapper] Rendering AppLayout for authenticated user.');
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  // If the user is not logged in and on a public page, show that page.
  if (!authUser && isPublicPage) {
    console.log('[AuthWrapper] Rendering public page for unauthenticated user.');
    return <>{children}</>;
  }
  
  console.log('[AuthWrapper] Rendering fallback FullPageLoader.');
  // As a fallback, show the loader. This covers edge cases during redirection.
  return <FullPageLoader />;
}
