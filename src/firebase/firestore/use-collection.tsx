'use client';

import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';

// Helper to check for deep equality in objects, arrays, etc.
const deepEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;

    let length = Object.keys(a).length;
    if (length !== Object.keys(b).length) return false;
    for (let i = 0; i < length; i++) {
      const key = Object.keys(a)[i];
      if (!b.hasOwnProperty(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
};


export const useCollection = <T extends DocumentData>(
  query: Query<T> | null
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // Use a ref to store the previous query to compare against
  const previousQueryRef = useRef<Query<T> | null>(null);

  useEffect(() => {
    // If the query is deeply equal to the previous one, do nothing.
    if (deepEqual(previousQueryRef.current, query)) {
      return;
    }

    previousQueryRef.current = query;
    setLoading(true);
    
    if (!query) {
      setLoading(false);
      setData(null);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as T)
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
        setData(null);
        console.error("Error fetching collection:", err);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
};
