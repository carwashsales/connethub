'use client';

import {
  onSnapshot,
  DocumentReference,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useMemoDeep } from '@/hooks/use-memo-deep';

export const useDoc = <T extends DocumentData>(
  ref: DocumentReference<T> | null
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const stableRef = useMemoDeep(ref);

  useEffect(() => {
    if (!stableRef) {
      console.log('useDoc: Ref is null, resetting state.');
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    console.log(`useDoc: Subscribing to snapshot for path: ${stableRef.path}`);
    setLoading(true);

    const unsubscribe = onSnapshot(
      stableRef,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          console.log(`useDoc: Snapshot received, document exists at path ${stableRef.path}`);
          setData({ ...snapshot.data(), id: snapshot.id } as T);
        } else {
          console.log(`useDoc: Snapshot received, document does not exist at path ${stableRef.path}`);
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error(`useDoc: Error fetching document at ${stableRef.path}:`, err);
        setError(err);
        setLoading(false);
        setData(null);
      }
    );

    return () => {
        console.log(`useDoc: Unsubscribing from snapshot for path: ${stableRef.path}`);
        unsubscribe();
    };
  }, [stableRef]); 

  return { data, loading, error };
};
