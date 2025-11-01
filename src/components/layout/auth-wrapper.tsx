'use client';

import { useFirestore, useUser } from '@/firebase/index';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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


export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
      setMounted(true);
  }, []);

  const userDocRef = useMemo(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(userDocRef);

  if (!mounted || authLoading) {
    return <FullPageLoader />;
  }

  if (isAuthPage) {
    if (authUser) {
      router.push('/');
      return <FullPageLoader />;
    }
    return <>{children}</>;
  }

  if (!authUser) {
    router.push('/login');
    return <FullPageLoader />;
  }

  if (userProfileLoading) {
    return <FullPageLoader />;
  }
  
  return <AppLayout user={userProfile}>{children}</AppLayout>;
}
