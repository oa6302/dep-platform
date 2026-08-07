
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, DocumentData, Query, QueryConstraint, query } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(
  pathOrQuery: string | Query<T> | null,
  ...constraints: QueryConstraint[]
) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !pathOrQuery) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const collectionRef = typeof pathOrQuery === 'string' 
      ? query(collection(db, pathOrQuery), ...constraints)
      : pathOrQuery;

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as T[];
        setData(items);
        setLoading(false);
      },
      async (err) => {
        const path = typeof pathOrQuery === 'string' ? pathOrQuery : 'query';
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, pathOrQuery, JSON.stringify(constraints)]);

  return { data, loading, error };
}
