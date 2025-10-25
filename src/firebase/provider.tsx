'use client';

import type {FirebaseApp} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';
import React, {createContext, useContext} from 'react';

export type FirebaseContextType = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function FirebaseProvider({children, ...value}: {children: React.ReactNode} & Partial<FirebaseContextType>) {
  if (!value.app || !value.auth || !value.db) {
    return <>{children}</>;
  }
  return <FirebaseContext.Provider value={value as FirebaseContextType}>{children}</FirebaseContext.Provider>;
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().app;
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase();
