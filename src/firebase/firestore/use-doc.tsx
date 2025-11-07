'use client';

import {
  onSnapshot,
  DocumentReference,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
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
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!stableRef) {
      console.log('[useDoc] Ref is null, setting state to initial and returning.');
      setData(null);
      setLoading(false);
      setError(null);
      initialLoadDone.current = false;
      return;
    }
    
    // Only set loading to true on the first run for a given ref
    if (!initialLoadDone.current) {
        console.log(`[useDoc] Initial load for path: ${stableRef.path}. Setting loading to true.`);
        setLoading(true);
    } else {
        console.log(`[useDoc] Ref changed for path: ${stableRef.path}, but this is a subsequent run. Not setting loading to true.`);
    }

    const unsubscribe = onSnapshot(
      stableRef,
      (snapshot: DocumentSnapshot<T>) => {
        console.log(`[useDoc] onSnapshot fired for path: ${stableRef.path}. Exists: ${snapshot.exists()}`);
        if (snapshot.exists()) {
          const docData = { ...snapshot.data(), id: snapshot.id } as T;
          setData(docData);
          console.log('[useDoc] Data set:', docData);
        } else {
          setData(null);
          console.log('[useDoc] Document does not exist, data set to null.');
        }
        setLoading(false);
        setError(null);
        initialLoadDone.current = true;
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
        initialLoadDone.current = true;
      }
    );

    return () => {
        console.log(`[useDoc] Unsubscribing from path: ${stableRef.path}`);
        unsubscribe();
    };
  }, [stableRef]); 

  return { data, loading, error };
};
