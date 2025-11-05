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

  const queryRef = useRef<Query<T> | null>(null);

  useEffect(() => {
    
    if (q === null && queryRef.current === null) {
      setLoading(false);
      return;
    }

    if(q && queryRef.current && queryEqual(q, queryRef.current)) {
      return;
    }
    
    setLoading(true);
    setData(null);
    setError(null);
    queryRef.current = q;

    if (!q) {
      setLoading(false);
      return;
    }

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
  }, [q]);

  return { data, loading, error };
};
