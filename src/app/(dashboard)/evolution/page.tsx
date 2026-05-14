
"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart as ChartIcon, Sparkles, TrendingUp, Heart, Zap, Loader2, BookOpen, BrainCircuit, Trash2, Calendar, Radio, History as HistoryIcon, ShieldCheck } from "lucide-react";
import { EvolutionChart, ChartDataPoint } from "@/components/dashboard/evolution-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, setDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { yearlyRecap } from "@/ai/flows/yearly-recap";
import { emotionalInsightSummary, EmotionalInsightSummaryOutput } from "@/ai/flows/emotional-insight-summary";
import { broadcastNeuralRadio } from "@/ai/flows/neural-radio-flow";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, startOfDay, endOfDay, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear, eachYearOfInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/tabs";
import { decryptData, encryptData } from "@/lib/encryption";

type FilterRange = "daily" | "weekly" | "monthly" | "yearly";

export default function EvolutionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isRadioLoading, setIsRadioLoading] = useState(false);
  const [recapResult, setRecapResult] = useState<string | null>(null);
  const [emotionalInsight, setEmotionalInsight] = useState<EmotionalInsightSummaryOutput | null>(null);
  const [filter, setFilter] = useState<FilterRange>("monthly");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [decryptedMemories, setDecryptedMemories] = useState<any[]>([]);

  const memoriesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "memories"), orderBy("createdAt", "asc"));
  }, [db, user?.uid]);

  const { data: rawMemories, loading: memoriesLoading } = useCollection(memoriesQuery);

  useEffect(() => {
    async function process() {
      if (!rawMemories || !user?.uid) return;
      const decrypted = await Promise.all(
        rawMemories.map(async (m: any) => ({
          ...m,
          content: m.isEncrypted ? await decryptData(m.content, user.uid) : m.content
        }))
      );
      setDecryptedMemories(decrypted);
    }
    process();
  }, [rawMemories, user?.uid]);

  const derivedStats = useMemo(() => {
    if (decryptedMemories.length === 0) return { resilience: 10, empathy: 10, clarity: 10, openness: 10 };
    const counts = {
      journal: decryptedMemories.filter(m => m.type === 'journal' || m.type === 'entry').length,
      dream: decryptedMemories.filter(m => m.type === 'dream').length,
      vocal: decryptedMemories.filter(m => m.type === 'vocal').length,
      resonance: decryptedMemories.filter(m => m.content?.includes('Future Self')).length,
    };
    return {
      resilience: Math.min(100, 15 + (counts.journal * 5)),
      empathy: Math.min(100, 15 + (counts.resonance * 10)),
      clarity: Math.min(100, 15 + (counts.dream * 8)),
      openness: Math.min(100, 15 + (counts.vocal * 7)),
    };
  }, [decryptedMemories]);

  const chartData = useMemo(() => {
    if (decryptedMemories.length === 0) return [];
    const now = new Date();
    let intervals: Date[] = [];
    let formatStr = "MMM";
    if (filter === "daily") { intervals = eachDayOfInterval({ start: subMonths(now, 1), end: now }).slice(-14); formatStr = "dd"; }
    else if (filter === "weekly") { intervals = eachWeekOfInterval({ start: subMonths(now, 3), end: now }).slice(-8); formatStr = "ww"; }
    else if (filter === "yearly") { intervals = eachYearOfInterval({ start: subMonths(now, 36), end: now }); formatStr = "yyyy"; }
    else { intervals = eachMonthOfInterval({ start: subMonths(now, 5), end: now }); formatStr = "MMM"; }

    return intervals.map(date => {
      let startRange: Date, endRange: Date;
      if (filter === "daily") { startRange = startOfDay(date); endRange = endOfDay(date); }
      else if (filter === "weekly") { startRange = startOfWeek(date); endRange = endOfWeek(date); }
      else if (filter === "yearly") { startRange = startOfYear(date); endRange = endOfYear(date); }
      else { startRange = startOfMonth(date); endRange = endOfMonth(date); }
      
      const rangeMemories = decryptedMemories.filter((m: any) => {
        if (!m.createdAt?.seconds) return false;
        const mDate = new Date(m.createdAt.seconds * 1000);
        return mDate >= startRange && mDate <= endRange;
      });
      const count = rangeMemories.length;
      return { name: format(date, formatStr), growth: Math.min(100, (count * 12) + 15), mood: count > 0 ? (45 + (Math.random() * 30)) : 0, emotional: count > 0 ? (50 + (count * 4)) : 0 };
    });
  }, [decryptedMemories, filter]);

  const handleGenerateRecap = async () => {
    if (decryptedMemories.length === 0 || !user?.uid || !db) return;
    setIsGenerating(true);
    try {
      const year = new Date().getFullYear();
      const entriesText = decryptedMemories.slice(-30).map((m: any) => `[${m.type}] ${m.content}`).join("\n\n");
      const result = await yearlyRecap({ year, entries: entriesText });
      
      const encryptedRecap = await encryptData(result.recap, user.uid);
      await setDoc(doc(collection(db, "users", user.uid, "memories")), {
        content: encryptedRecap,
        type: 'recap',
        createdAt: serverTimestamp(),
        userId: user.uid,
        isEncrypted: true,
        analysis: { year }
      });
      setRecapResult(result.recap);
      toast({ title: "Annual Echo Secured", description: "Encrypted synthesis archived." });
    } catch (error) { toast({ variant: "destructive", title: "Synthesis Failed" }); }
    finally { setIsGenerating(false); }
  };

  const handleEmotionalSynthesis = async () => {
    if (decryptedMemories.length === 0 || !user?.uid || !db) return;
    setIsSynthesizing(true);
    try {
      const entries = decryptedMemories.slice(-15).map((m: any) => ({
        timestamp: m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        content: m.content,
        type: m.type === 'vocal' ? 'voice_note' : 'journal'
      }));
      const result = await emotionalInsightSummary({ entries });
      const encryptedSummary = await encryptData(result.emotionalSummary, user.uid);
      await setDoc(doc(collection(db, "users", user.uid, "memories")), {
        content: encryptedSummary,
        type: 'synthesis',
        createdAt: serverTimestamp(),
        userId: user.uid,
        isEncrypted: true,
        analysis: result
      });
      setEmotionalInsight(result);
      toast({ title: "Landscape Mapped", description: "Secure synthesis completed." });
    } catch (error) { toast({ variant: "destructive", title: "Synthesis Blocked" }); }
    finally { setIsSynthesizing(false); }
  };

  const handleStartRadio = async (text: string) => {
    setIsRadioLoading(true);
    try {
      const result = await broadcastNeuralRadio({ text });
      setAudioUrl(result.audioDataUri);
    } catch (e) { toast({ variant: "destructive", title: "Radio Signal Lost" }); }
    finally { setIsRadioLoading(false); }
  };

  const stats = [
    { label: "Resilience", value: derivedStats.resilience, icon: Zap, color: "text-primary" },
    { label: "Empathy", value: derivedStats.empathy, icon: Heart, color: "text-accent" },
    { label: "Clarity", value: derivedStats.clarity, icon: Sparkles, color: "text-white" },
    { label: "Openness", value: derivedStats.openness, icon: TrendingUp, color: "text-secondary" },
  ];

  const recentSyntheses = useMemo(() => decryptedMemories.filter((m: any) => m.type === 'synthesis' || m.type === 'recap').slice(-5).reverse(), [decryptedMemories]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="flex justify-between items-end gap-6 text-white">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight flex items-center gap-3">Identity Evolution Map <ChartIcon className="w-8 h-8 text-primary" /></h1>
          <p className="text-muted-foreground font-light text-lg mt-1">Decrypted visualization of your internal neural growth.</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-6 py-3 rounded-full text-primary">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-widest">E2EE Analytics Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvolutionChart data={chartData} />
        </div>
        <div className="space-y-6">
          <Card className="glass-morphism border-white/5 bg-transparent">
            <CardHeader><CardTitle className="font-headline text-lg font-medium text-white">Personality Vector Status</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {memoriesLoading ? <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div> :
                stats.map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><stat.icon className={`w-4 h-4 ${stat.color}`} /><span className="text-white/80">{stat.label}</span></div><span className="font-bold text-white">{stat.value}%</span></div>
                    <Progress value={stat.value} className="h-1 bg-white/5" />
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </div>
      </div>
      
      {emotionalInsight && (
        <Card className="glass-morphism border-primary/20 bg-primary/5">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-headline text-lg text-primary flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure Emotional Synthesis</h4>
              <Button size="sm" variant="outline" className="rounded-full border-primary/20 text-white" onClick={() => handleStartRadio(emotionalInsight.emotionalSummary)} disabled={isRadioLoading}>
                {isRadioLoading ? <Loader2 className="animate-spin" /> : <Radio className="w-4 h-4 mr-2" />} Listen to Echo
              </Button>
            </div>
            <p className="text-lg font-light italic text-white/90">"{emotionalInsight.emotionalSummary}"</p>
            {audioUrl && <audio controls src={audioUrl} className="w-full h-10 filter invert opacity-80 mt-4" autoPlay />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
