'use client';

import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  queryEqual,
} from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';

export const useCollection = <T extends DocumentData>(
  q: Query<T> | null
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  // Use a ref to store the previous query to compare against
  const previousQueryRef = useRef<Query<T> | null>(null);

  useEffect(() => {
    // If the query is null, reset state and do nothing.
    if (!q) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // If the query is the same as the previous one, do nothing.
    if (previousQueryRef.current && queryEqual(previousQueryRef.current, q)) {
      return;
    }
    
    // Update the ref to the new query for the next render.
    previousQueryRef.current = q;
    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as T)
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Error fetching collection:", err);
        setError(err);
        setLoading(false);
        setData(null);
      }
    );

    return () => unsubscribe();
  }, [q]); // The effect now depends directly on the query object `q`.

  return { data, loading, error };
};
