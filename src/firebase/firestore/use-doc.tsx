'use client';

import {useEffect, useState, useRef} from 'react';
import {
  doc,
  onSnapshot,
  getDoc,
  type DocumentData,
  type DocumentReference,
  type FirestoreError,
} from 'firebase/firestore';
import {useFirestore} from '..';

type Options = {
  listen: boolean;
};

const defaultOptions: Options = {
  listen: true,
};

export function useDoc<T>(
  docRef: DocumentReference | null,
  options: Options = defaultOptions
): {data: T | null; loading: boolean; error: FirestoreError | null} {
  const {db} = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const unsubscribeRef = useRef<() => void>();

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (options.listen) {
          unsubscribeRef.current = onSnapshot(
            docRef,
            (docSnap) => {
              if (docSnap.exists()) {
                setData({id: docSnap.id, ...docSnap.data()} as T);
              } else {
                setData(null);
              }
              setLoading(false);
            },
            (err) => {
              setError(err);
              setLoading(false);
            }
          );
        } else {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setData({id: docSnap.id, ...docSnap.data()} as T);
          } else {
            setData(null);
          }
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
  }, [docRef, db, options.listen]);

  return {data, loading, error};
}
