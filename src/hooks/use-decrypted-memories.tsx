
import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import { decryptData } from '@/lib/encryption';

interface Memory {
  id: string;
  content: string;
  isEncrypted: boolean;
  [key: string]: any;
}

interface UseDecryptedMemoriesReturn {
  decryptedMemories: Memory[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and decrypt all memories for the current user.
 */
export const useDecryptedMemories = (): UseDecryptedMemoriesReturn => {
  const { user } = useUser();
  const db = useFirestore();
  const [decryptedMemories, setDecryptedMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoriesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'memories'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const { data: rawMemories, loading: memoriesLoading, error: firestoreError } = useCollection(memoriesQuery as Query<Memory> | null);

  useEffect(() => {
    async function processMemories() {
      if (memoriesLoading) {
        setLoading(true);
        return;
      }

      if (firestoreError) {
        setError(firestoreError);
        setLoading(false);
        return;
      }

      if (!rawMemories || !user?.uid) {
        setDecryptedMemories([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const processed = await Promise.all(
          rawMemories.map(async (m: Memory) => ({
            ...m,
            content: m.isEncrypted ? await decryptData(m.content, user!.uid) : m.content,
          }))
        );
        setDecryptedMemories(processed);
      } catch (err: any) {
        console.error("Decryption error in useDecryptedMemories:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    processMemories();
  }, [rawMemories, memoriesLoading, firestoreError, user?.uid]);

  return { decryptedMemories, loading, error };
};
