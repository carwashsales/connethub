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
    if (authLoading) {
      return; 
    }

    if (!authUser && !isPublicPage) {
      router.push('/login');
    } else if (authUser && isPublicPage) {
      router.push('/');
    }
  }, [authLoading, authUser, isPublicPage, pathname, router]);


  if (authLoading || (authUser && userProfileLoading && !isPublicPage)) {
      return <FullPageLoader />;
  }

  if (isPublicPage) {
      if(authUser) {
          return <FullPageLoader />;
      }
      return <>{children}</>;
  }
  
  if (authUser && userProfile) {
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }
  
  // This handles the case where the user is authenticated but the profile is still loading
  // or if the profile doesn't exist (e.g. creation failed).
  if (authUser && !isPublicPage) {
    return <FullPageLoader />;
  }

  return <FullPageLoader />;
}
