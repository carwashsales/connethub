'use client';

import React, {useMemo} from 'react';
import {FirebaseProvider, type FirebaseContextType} from './provider';
import {initializeFirebase} from '.';

export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const firebaseContextValue = useMemo<FirebaseContextType | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return initializeFirebase();
  }, []);

  return <FirebaseProvider {...firebaseContextValue}>{children}</FirebaseProvider>;
}
