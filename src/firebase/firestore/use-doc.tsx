'use client';

import {
  onSnapshot,
  DocumentReference,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';

// Helper to check for deep equality
const deepEqual = (a: any, b: any) => {
    if (a === b) return true;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        if (a.constructor !== b.constructor) return false;
        
        // This is a simplified check for Firestore references
        if (a.path && b.path) {
            return a.path === b.path;
        }
    }
    return false;
};


export const useDoc = <T extends DocumentData>(
  ref: DocumentReference<T> | null
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const previousRef = useRef<DocumentReference<T> | null>(null);

  useEffect(() => {
    if(deepEqual(previousRef.current, ref)) {
        return;
    }
    previousRef.current = ref;
    setLoading(true);

    if (!ref) {
      setLoading(false);
      setData(null);
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
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
        setError(err);
        setLoading(false);
        setData(null);
        console.error("Error fetching document:", err);
      }
    );

    return () => unsubscribe();
  }, [ref]); 

  return { data, loading, error };
};
