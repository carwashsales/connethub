'use client';

import { useUser, useFirestore, useAuth } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
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
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  return (
     <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md p-6 sm:p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-headline font-bold">User Profile Not Found</h1>
            <p className="mt-2 text-muted-foreground">
                Your authentication is valid, but we could not find your user profile in the database.
                This can sometimes happen if the profile creation process was interrupted.
            </p>
            <Button onClick={handleLogout} variant="destructive" className="mt-6">
                Log Out and Try Again
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

  // 1. While auth is loading, show a loader.
  if (authLoading) {
    return <FullPageLoader />;
  }

  // 2. If auth is done and there's no user...
  if (!authUser) {
    // ...and we are on a protected page, redirect to login.
    if (!isPublicPage) {
      router.push('/login');
      return <FullPageLoader />; // Show loader during redirect
    }
    // ...and we are on a public page, show the page.
    return <>{children}</>;
  }

  // 3. If we have an auth user but are still waiting for their profile...
  if (authUser && userProfileLoading) {
     return <FullPageLoader />;
  }

  // 4. If we have an auth user, profile loading is done, but the profile is missing...
  if (authUser && !userProfile) {
     return <MissingProfileError />;
  }

  // 5. If we have both an auth user and their profile...
  if (authUser && userProfile) {
    // ...and they are on a public page, redirect them to the home page.
    if (isPublicPage) {
      router.push('/');
      return <FullPageLoader />; // Show loader during redirect
    }
    // ...and they are on a protected page, show the app layout.
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  // Fallback state, should ideally not be reached.
  return <FullPageLoader />;
}
