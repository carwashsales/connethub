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
      console.log('[useUser] No auth service available, setting loading to false.');
      setLoading(false);
      return;
    }
    console.log('[useUser] Subscribing to onAuthStateChanged.');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[useUser] onAuthStateChanged fired. User:', user ? user.uid : null);
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('[useUser] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    };
  }, [auth]);

  return {user, loading};
}
