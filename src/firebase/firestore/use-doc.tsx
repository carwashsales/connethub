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
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export const useDoc = <T extends DocumentData>(
  ref: DocumentReference<T> | null
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const stableRef = useMemoDeep(ref);

  useEffect(() => {
    if (!stableRef) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    
    const unsubscribe = onSnapshot(
      stableRef,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
         if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: stableRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
        setError(err);
        setLoading(false);
        setData(null);
      }
    );

    return () => {
        unsubscribe();
    };
  }, [stableRef]); 

  return { data, loading, error };
};
