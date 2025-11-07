'use client';

import {onAuthStateChanged, type User} from 'firebase/auth';
import {useEffect, useState} from 'react';
import {useAuth} from '../provider';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.log('[useUser] Auth service not available, setting loading to false.');
      setLoading(false);
      return;
    }
    console.log('[useUser] Auth service is available, subscribing to onAuthStateChanged.');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[useUser] onAuthStateChanged fired. User:', !!user);
      setUser(user);
      setLoading(false);
      console.log('[useUser] State updated. New loading state: false');
    });

    return () => {
      console.log('[useUser] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    };
  }, [auth]);

  return {user, loading};
}
