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

export const useCollection = <T extends DocumentData>(
  q: Query<T> | null
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const stableQuery = useMemoDeep(q);

  useEffect(() => {
    if (!stableQuery) {
      console.log('useCollection: Query is null, resetting state.');
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    console.log(`useCollection: Subscribing to snapshot for path: ${(stableQuery as any)._query.path.segments.join('/')}`);
    setLoading(true);

    const unsubscribe = onSnapshot(
      stableQuery,
      (snapshot: QuerySnapshot<T>) => {
        console.log(`useCollection: Snapshot received with ${snapshot.docs.length} documents.`);
        const docs = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as T)
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("useCollection: Error fetching collection:", err);
        setError(err);
        setLoading(false);
        setData(null);
      }
    );

    return () => {
      console.log(`useCollection: Unsubscribing from snapshot for path: ${(stableQuery as any)._query.path.segments.join('/')}`);
      unsubscribe();
    };
  }, [stableQuery]);

  return { data, loading, error };
};
