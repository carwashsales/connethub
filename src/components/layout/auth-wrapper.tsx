'use client';

import { useUser, useFirestore } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { AppLayout } from './app-layout';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

function FullPageLoader() {
  console.log('Rendering FullPageLoader');
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
  console.log('AuthWrapper: Render start');
  const { user: authUser, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  console.log('AuthWrapper state:', {
    pathname,
    isPublicPage,
    authLoading,
    authUser: !!authUser,
  });

  const userDocRef = useMemo(() => {
    if (!db || !authUser) {
      console.log('AuthWrapper: userDocRef memo returning null');
      return null;
    }
    console.log(`AuthWrapper: userDocRef memo creating doc ref for users/${authUser.uid}`);
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  console.log('AuthWrapper userProfile state:', {
      userProfile: !!userProfile,
      userProfileLoading,
  });

  useEffect(() => {
    console.log('AuthWrapper useEffect triggered. Deps:', { authLoading, authUser, isPublicPage, pathname });
    if (authLoading) {
      console.log('AuthWrapper useEffect: Auth is loading, doing nothing.');
      return; 
    }

    if (!authUser && !isPublicPage) {
      console.log('AuthWrapper useEffect: No user, not on public page. Redirecting to /login.');
      router.push('/login');
    } else if (authUser && isPublicPage) {
      console.log('AuthWrapper useEffect: User exists, on public page. Redirecting to /.');
      router.push('/');
    } else {
      console.log('AuthWrapper useEffect: Conditions not met for redirection.');
    }
  }, [authLoading, authUser, isPublicPage, pathname, router]);


  if (authLoading || (authUser && userProfileLoading && !isPublicPage)) {
      console.log('AuthWrapper: Showing FullPageLoader due to loading states.');
      return <FullPageLoader />;
  }

  if (isPublicPage) {
      if(authUser && userProfile) {
          console.log('AuthWrapper: Is public page, but user is logged in. Showing loader while redirect happens.');
          return <FullPageLoader />;
      }
      console.log('AuthWrapper: Is public page and no user, showing children.');
      return <>{children}</>;
  }
  
  if (authUser && userProfile) {
    console.log('AuthWrapper: User is authenticated and profile loaded. Rendering AppLayout.');
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }
  
  console.log('AuthWrapper: Fallback, returning loader.');
  return <FullPageLoader />;
}
