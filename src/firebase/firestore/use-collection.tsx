'use client';

import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirestore } from '../provider';

export const useCollection = <T extends DocumentData>(
  query: Query<T> | null
) => {
  const db = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    // Set loading to true whenever the query changes
    setLoading(true);
    
    if (!db || !query) {
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
  }, [db, query]); // Rerun effect if db or query object changes.

  return { data, loading, error };
};
