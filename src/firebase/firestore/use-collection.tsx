'use client';

import {useEffect, useState, useRef} from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
  type DocumentData,
  type Query,
  type FirestoreError,
} from 'firebase/firestore';
import {useFirestore} from '..';

type Options = {
  listen: boolean;
};

const defaultOptions: Options = {
  listen: true,
};

export function useCollection<T>(
  collectionName: string,
  options: Options = defaultOptions
): {data: T[] | null; loading: boolean; error: FirestoreError | null} {
  const {db} = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const unsubscribeRef = useRef<() => void>();

  useEffect(() => {
    const collectionRef = collection(db, collectionName);

    const fetchData = async () => {
      setLoading(true);
      try {
        if (options.listen) {
          unsubscribeRef.current = onSnapshot(
            collectionRef,
            (snapshot) => {
              const newData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as T[];
              setData(newData);
              setLoading(false);
            },
            (err) => {
              setError(err);
              setLoading(false);
            }
          );
        } else {
          const snapshot = await getDocs(collectionRef);
          const newData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(newData);
          setLoading(false);
        }
      } catch (err) {
        setError(err as FirestoreError);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [collectionName, db, options.listen]);

  return {data, loading, error};
}
