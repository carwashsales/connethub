'use client';

import { useUser, useFirestore } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  const userDocRef = authUser ? doc(db, 'users', authUser.uid) : null;
  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  useEffect(() => {
    if (!mounted || authLoading) return;

    if (authUser && isPublicPage) {
      router.push('/');
    }
    
    if (!authUser && !isPublicPage) {
      router.push('/login');
    }
  }, [mounted, authLoading, authUser, isPublicPage, router, pathname]);

  if (!mounted) {
    return <FullPageLoader />;
  }

  // If we are on a public page and not logged in, show the page.
  if (isPublicPage && !authUser) {
    return <>{children}</>;
  }

  // For any other case, we need to determine the loading state.
  const isLoading = authLoading || (authUser && userProfileLoading);
  if (isLoading) {
      return <FullPageLoader />;
  }

  // If we have an auth user and their profile, render the main app layout.
  if (authUser && userProfile) {
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  // If we are on a protected page without a user, or a public page with a user,
  // we are in a transition state (redirecting), so show the loader.
  return <FullPageLoader />;
}
