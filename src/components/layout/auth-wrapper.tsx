'use client';

import { useUser, useFirestore } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { AppLayout } from './app-layout';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AlertTriangle } from 'lucide-react';

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

function MissingProfileError() {
  const router = useRouter();

  const handleTryAgain = () => {
    // This could be enhanced to try re-fetching or logging out/in.
    // For now, a simple refresh or redirect is a common strategy.
    router.push('/login');
  };

  return (
     <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md p-6 sm:p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-headline font-bold">User Profile Not Found</h1>
            <p className="mt-2 text-muted-foreground">
                We could not find a user profile associated with your account. This may be a temporary issue. Please try logging in again.
            </p>
            <Button onClick={handleTryAgain} variant="destructive" className="mt-6">
                Return to Login
            </Button>
        </Card>
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

  const { data: userProfile, isLoading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    // This effect handles redirects safely after rendering.
    if (authLoading || userProfileLoading) {
      return; // Do nothing while we are still loading information.
    }
    
    if (!authUser && !isPublicPage) {
      // If not logged in and on a protected page, redirect to login.
      router.push('/login');
    }

    if (authUser && userProfile && isPublicPage) {
      // If logged in and on a public page, redirect to the home page.
      router.push('/');
    }

  }, [authUser, userProfile, authLoading, userProfileLoading, isPublicPage, pathname, router]);


  // 1. While auth is loading, show a loader.
  if (authLoading) {
    return <FullPageLoader />;
  }

  // 2. If auth is done and there's no user on a protected page, show loader during redirect.
  if (!authUser && !isPublicPage) {
    return <FullPageLoader />;
  }
  
  // 3. If on a public page, just show the page (for login/signup).
  if (isPublicPage) {
    return <>{children}</>;
  }

  // 4. If we have an auth user but are still waiting for their profile, show loader.
  if (authUser && userProfileLoading) {
     return <FullPageLoader />;
  }

  // 5. If profile loading is finished, but there's no profile, show an error component.
  if (authUser && !userProfile) {
     return <MissingProfileError />;
  }
  
  // 6. If we have both an auth user and their profile, show the app.
  if (authUser && userProfile) {
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  // Fallback state, should ideally not be reached.
  return <FullPageLoader />;
}
