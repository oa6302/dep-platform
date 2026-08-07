'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  DocumentData,
  onSnapshot,
  query,
  Query,
  QueryConstraint,
} from 'firebase/firestore';

import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T extends DocumentData = DocumentData>(
  pathOrQuery: string | Query<T> | null,
  ...constraints: QueryConstraint[]
) {
  const db = useFirestore();

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Firebase bağlantısı veya sorgu yoksa
    if (!db || !pathOrQuery) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    setLoading(true);
    setError(null);

    try {
      /**
       * String verilmişse:
       * collection(db, path) oluşturup constraints uygular.
       *
       * Query verilmişse:
       * Hazır query doğrudan kullanılır.
       */
      const firestoreQuery: Query<T> =
        typeof pathOrQuery === 'string'
          ? (query(
              collection(db, pathOrQuery),
              ...constraints
            ) as Query<T>)
          : pathOrQuery;

      unsubscribe = onSnapshot(
        firestoreQuery,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore collection error:', err);

          const path =
            typeof pathOrQuery === 'string'
              ? pathOrQuery
              : 'Firestore query';

          const permissionError = new FirestorePermissionError({
            path,
            operation: 'list',
          });

          errorEmitter.emit(
            'permission-error',
            permissionError
          );

          setError(err);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Firestore query oluşturulamadı:', err);

      const firestoreError =
        err instanceof Error
          ? err
          : new Error('Firestore sorgusu oluşturulamadı.');

      setError(firestoreError);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [db, pathOrQuery, JSON.stringify(constraints)]);

  return {
    data,
    loading,
    error,
  };
}