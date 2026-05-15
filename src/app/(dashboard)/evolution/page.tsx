"use client";

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, Timestamp, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, Zap, Brain, History, Mic, FileText, ChevronRight, X } from 'lucide-react';
import { emotionalInsightSummary, EmotionalInsightSummaryOutput } from '@/ai/flows/emotional-insight-summary';
import { neuralRadio, NeuralRadioOutput } from '@/ai/flows/neural-radio-flow';
import { decryptData } from '@/lib/encryption';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type FilterRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function EvolutionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isRadioLoading, setIsRadioLoading] = useState(false);
  const [emotionalInsight, setEmotionalInsight] = useState<EmotionalInsightSummaryOutput | null>(null);
  const [filter, setFilter] = useState<FilterRange>('monthly');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [decryptedMemories, setDecryptedMemories] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null);

  const memoriesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'memories'), orderBy('createdAt', 'asc'));
  }, [db, user?.uid]);

  const synthesesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'syntheses'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const { data: rawMemories, loading: memoriesLoading } = useCollection(memoriesQuery);
  const { data: syntheses, loading: synthesesLoading } = useCollection(synthesesQuery);

  useEffect(() => {
    async function decrypt() {
      if (!rawMemories || !user?.uid) return;
      const decrypted = await Promise.all(
        rawMemories.map(async (m: any) => ({
          ...m,
          content: m.isEncrypted ? await decryptData(m.content, user.uid) : m.content,
        }))
      );
      setDecryptedMemories(decrypted);
    }
    decrypt();
  }, [rawMemories, user?.uid]);

  const timeUntilNextSnapshot = useMemo(() => {
    if (!syntheses || syntheses.length === 0) return 0;
    const lastSnapshotTime = syntheses[0].createdAt.toDate();
    return 24 - differenceInHours(new Date(), lastSnapshotTime);
  }, [syntheses]);

  const canGenerateSnapshot = timeUntilNextSnapshot <= 0;

  const handleGenerateEmotionalInsight = async () => {
    if (!canGenerateSnapshot) {
      toast({ title: 'Cooldown Active', description: `You can generate a new snapshot in ${timeUntilNextSnapshot} hours.` });
      return;
    }
    if (!decryptedMemories || decryptedMemories.length < 5) {
      toast({ title: 'Not Enough Data', description: 'You need at least 5 memories to generate an emotional insight summary.' });
      return;
    }

    setIsGenerating(true);
    setEmotionalInsight(null);
    try {
      const insight = await emotionalInsightSummary({ memories: decryptedMemories });
      setEmotionalInsight(insight);
      if (db && user?.uid) {
        await addDoc(collection(db, 'users', user.uid, 'syntheses'), {
          ...insight,
          createdAt: Timestamp.now(),
        });
      }
      toast({ title: 'Synthesis Complete', description: 'Your new emotional snapshot is ready.' });
    } catch (error) {
      console.error('Error generating emotional insight:', error);
      toast({ title: 'Error', description: 'Failed to generate emotional insight.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Evolution Matrix</h1>
        <p className="text-muted-foreground">Analyze your emotional and cognitive development over time through AI-powered synthesis.</p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-morphism">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> Emotional Snapshot</CardTitle>
                  <CardDescription className="mt-1">Generate a summary of your emotional landscape based on recent memories.</CardDescription>
                </div>
                <Button onClick={handleGenerateEmotionalInsight} disabled={isGenerating || !canGenerateSnapshot} className="w-44">
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                  {canGenerateSnapshot ? 'Synthesize Now' : `${timeUntilNextSnapshot}h Cooldown`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="text-center py-12 text-muted-foreground animate-pulse">Synthesizing emotional data...</div>
              ) : emotionalInsight ? (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">{emotionalInsight.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{emotionalInsight.summary}</p>
                  <Badge>{emotionalInsight.dominantEmotion}</Badge>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">Your generated emotional snapshot will appear here.</div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Archive) */}
        <div className="space-y-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary"/> Synthesis Archive</CardTitle>
              <CardDescription className="mt-1">Review your previously generated emotional snapshots.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {synthesesLoading ? (
                <div className="text-center text-sm text-muted-foreground">Loading archive...</div>
              ) : syntheses && syntheses.length > 0 ? (
                syntheses.map((s: any) => (
                  <div key={s.id} onClick={() => setSelectedInsight(s)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(s.createdAt.toDate(), { addSuffix: true })}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">No snapshots generated yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Snapshot Viewer Dialog */}
      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="glass-morphism">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Archived Snapshot</DialogTitle>
            {selectedInsight && <DialogDescription>{formatDistanceToNow(selectedInsight.createdAt.toDate(), { addSuffix: true })}</DialogDescription>}
          </DialogHeader>
          {selectedInsight && (
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-lg text-primary">{selectedInsight.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedInsight.summary}</p>
              <Badge>{selectedInsight.dominantEmotion}</Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
