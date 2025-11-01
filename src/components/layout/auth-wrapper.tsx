'use client';

import { useUser } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from './app-layout';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { initializeFirebase } from '@/firebase';

// Initialize outside of component to avoid re-running on every render.
// This is safe because we are using getApps() check inside.
const { firestore } = initializeFirebase();


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
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // This ensures client-side logic only runs after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  // We can safely create the userDocRef here because `useDoc` is now stable
  const userDocRef = authUser ? doc(firestore, 'users', authUser.uid) : null;
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

  if (isPublicPage) {
     // If we are on a public page and logged in, show loader while redirecting.
    if(authUser) {
      return <FullPageLoader />;
    }
    // Otherwise, show the public page content (Login or Signup).
    return <>{children}</>;
  }

  // If we are on a protected page, we need auth and profile data.
  // Show loader until both are resolved.
  if (authLoading || (authUser && userProfileLoading)) {
    return <FullPageLoader />;
  }

  // If we have an auth user and their profile, render the main app layout.
  if (authUser && userProfile) {
    return <AppLayout user={userProfile}>{children}</AppLayout>;
  }

  // If we are on a protected page and there's no auth user after loading,
  // show loader while redirecting to login.
  return <FullPageLoader />;
}
