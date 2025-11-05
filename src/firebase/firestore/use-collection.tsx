'use client';

import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Custom hook to deeply compare query objects
const useCompareMemo = <T,>(value: T) => {
    const ref = React.useRef<T>();
    if (!value || !ref.current || JSON.stringify(value) !== JSON.stringify(ref.current)) {
        ref.current = value;
    }
    return ref.current;
}


export const useCollection = <T extends DocumentData>(
  query: Query<T> | null
) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedQuery = useCompareMemo(query);

  useEffect(() => {
    setLoading(true);
    
    if (!memoizedQuery) {
      setLoading(false);
      setData(null);
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedQuery,
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
  }, [memoizedQuery]);

  return { data, loading, error };
};
