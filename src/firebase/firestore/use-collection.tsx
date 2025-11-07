'use client';

import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useMemoDeep } from '@/hooks/use-memo-deep';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export const useCollection = <T extends DocumentData>(
  q: Query<T> | null
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const stableQuery = useMemoDeep(q);

  useEffect(() => {
    if (!stableQuery) {
      console.log('[useCollection] Query is null. Clearing state.');
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    console.log(`[useCollection] New query for path: ${stableQuery.path}. Setting up snapshot listener.`);
    setLoading(true);

    const unsubscribe = onSnapshot(
      stableQuery,
      (snapshot: QuerySnapshot<T>) => {
        console.log(`[useCollection] onSnapshot fired for path: ${stableQuery.path}. Doc count: ${snapshot.size}`);
        const docs = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as T)
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error(`[useCollection] onSnapshot error for path: ${stableQuery.path}`, err);
        if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: stableQuery.path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
        setError(err);
        setLoading(false);
        setData(null);
      }
    );

    return () => {
      console.log(`[useCollection] Unsubscribing from snapshot listener for path: ${stableQuery.path}`);
      unsubscribe();
    };
  }, [stableQuery]);

  return { data, loading, error };
};
