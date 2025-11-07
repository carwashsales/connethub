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
      console.log('[useDoc] Ref is null. Clearing state.');
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    console.log(`[useDoc] New ref for path: ${stableRef.path}. Setting loading and listener.`);
    setLoading(true);

    const unsubscribe = onSnapshot(
      stableRef,
      (snapshot: DocumentSnapshot<T>) => {
        console.log(`[useDoc] onSnapshot fired for path: ${stableRef.path}. Exists: ${snapshot.exists()}`);
        if (snapshot.exists()) {
          const docData = { ...snapshot.data(), id: snapshot.id } as T;
          setData(docData);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error(`[useDoc] onSnapshot error for path: ${stableRef.path}`, err);
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
        console.log(`[useDoc] Unsubscribing from snapshot listener for path: ${stableRef.path}`);
        unsubscribe();
    };
  }, [stableRef]); 

  return { data, loading, error };
};
