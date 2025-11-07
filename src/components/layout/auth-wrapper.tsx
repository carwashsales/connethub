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

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  const userDocRef = useMemo(() => {
    if (!db || !authUser) {
      return null;
    }
    // ALWAYS fetch the profile of the currently authenticated user.
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: userProfile, isLoading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    // While any loading is in progress, we don't make any routing decisions.
    if (authLoading || (authUser && userProfileLoading)) {
      return;
    }

    const isUserAuthenticated = !!authUser;
    const isProfileLoaded = !!userProfile;

    // Case 1: Not logged in and on a protected page -> redirect to login.
    if (!isUserAuthenticated && !isPublicPage) {
      router.push('/login');
      return;
    }

    // Case 2: Logged in and on a public page -> redirect to home.
    if (isUserAuthenticated && isPublicPage) {
      router.push('/');
      return;
    }

    // Case 3: FINAL CHECK - All loading is done. If user is authenticated but profile is still missing,
    // this is an unrecoverable state. Sign them out.
    if (isUserAuthenticated && !isProfileLoaded) {
      toast({
        title: 'User Profile Missing',
        description: 'Your user profile was not found. Please log in again to create it.',
        variant: 'destructive',
      });
      auth?.signOut();
      router.push('/login');
      return;
    }

  }, [authLoading, userProfileLoading, authUser, userProfile, isPublicPage, pathname, router, auth, toast]);

  // Render a loader if we are still waiting for auth or the user's profile.
  if (authLoading || (authUser && userProfileLoading)) {
    return <FullPageLoader />;
  }

  // If user is authenticated and we have their profile, show the app.
  if (authUser && userProfile) {
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  // If not authenticated and on a public page, show that page.
  if (!authUser && isPublicPage) {
    return <>{children}</>;
  }
  
  // This loader acts as a fallback for any intermediate or redirecting states.
  return <FullPageLoader />;
}
