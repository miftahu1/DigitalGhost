
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { useMemo, useEffect, useState } from 'react';
import { decryptData } from './encryption';

export const usePersonalityVectors = () => {
  const { user } = useUser();
  const db = useFirestore();
  const [vectors, setVectors] = useState({ resilience: 50, empathy: 50, clarity: 50, openness: 50 });
  const [loading, setLoading] = useState(true);

  const memoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "memories"), orderBy("createdAt", "asc"));
  }, [db, user]);

  const { data: memories } = useCollection(memoriesQuery);

  useEffect(() => {
    const calculateAndStoreVectors = async () => {
      if (!memories || !user || !db) return;

      const vectorDocRef = doc(db, 'users', user.uid, 'personality', 'vectors');
      const docSnap = await getDoc(vectorDocRef);

      if (docSnap.exists()) {
        setVectors(docSnap.data() as any);
        setLoading(false);
      } else {
        const counts = {
          journal: memories.filter(m => m.type === 'journal').length,
          dream: memories.filter(m => m.type === 'dream').length,
          vocal: memories.filter(m => m.type === 'vocal').length,
          resonance: memories.filter(m => m.content?.includes('Dialogue with Future Self')).length,
        };

        const newVectors = {
          resilience: Math.min(100, 30 + (counts.journal * 3)),
          empathy: Math.min(100, 30 + (counts.resonance * 8)),
          clarity: Math.min(100, 30 + (counts.dream * 7)),
          openness: Math.min(100, 30 + (counts.vocal * 6)),
        };

        await setDoc(vectorDocRef, newVectors);
        setVectors(newVectors);
        setLoading(false);
      }
    };

    calculateAndStoreVectors();
  }, [memories, user, db]);

  return { vectors, loading };
};
