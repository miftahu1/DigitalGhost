"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart as ChartIcon, Sparkles, TrendingUp, Heart, Zap, Loader2, BookOpen, BrainCircuit, Trash2, Calendar, Radio, History as HistoryIcon, ShieldCheck, ChevronRight } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { decryptData, encryptData } from "@/lib/encryption";
import { usePersonalityVectors } from "@/lib/personality-vectors";

type FilterRange = "daily" | "weekly" | "monthly" | "yearly";

export default function EvolutionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { vectors, loading: vectorsLoading } = usePersonalityVectors();

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
      const decrypted = await Promise.all(rawMemories.map(async (m: any) => ({ ...m, content: m.isEncrypted ? await decryptData(m.content, user.uid) : m.content })));
      setDecryptedMemories(decrypted);
    }
    process();
  }, [rawMemories, user?.uid]);

  const chartData = useMemo(() => {
    if (decryptedMemories.length === 0) return [];
    const now = new Date();
    let intervals: Date[] = [];
    let formatStr = "MMM";
    if (filter === "daily") { intervals = eachDayOfInterval({ start: subMonths(now, 1), end: now }).slice(-14); formatStr = "dd"; }
    else if (filter === "weekly") { intervals = eachWeekOfInterval({ start: subMonths(now, 3), end: now }).slice(-8); formatStr = "'W'ww"; }
    else if (filter === "yearly") { intervals = eachYearOfInterval({ start: subMonths(now, 36), end: now }); formatStr = "yyyy"; }
    else { intervals = eachMonthOfInterval({ start: subMonths(now, 5), end: now }); formatStr = "MMM"; }

    return intervals.map(date => {
      let startRange: Date, endRange: Date;
      if (filter === "daily") { startRange = startOfDay(date); endRange = endOfDay(date); }
      else if (filter === "weekly") { startRange = startOfWeek(date); endRange = endOfWeek(date); }
      else if (filter === "yearly") { startRange = startOfYear(date); endRange = endOfYear(date); }
      else { startRange = startOfMonth(date); endRange = endOfMonth(date); }
      const rangeMemories = decryptedMemories.filter((m: any) => { if (!m.createdAt?.seconds) return false; const mDate = new Date(m.createdAt.seconds * 1000); return mDate >= startRange && mDate <= endRange; });
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
      await setDoc(doc(collection(db, "users", user.uid, "memories")), { content: encryptedRecap, type: 'recap', createdAt: serverTimestamp(), userId: user.uid, isEncrypted: true, analysis: { year } });
      setRecapResult(result.recap);
      toast({ title: "Annual Echo Secured", description: "Encrypted synthesis archived." });
    } catch (error) { toast({ variant: "destructive", title: "Synthesis Failed" }); }
    finally { setIsGenerating(false); }
  };

  const handleEmotionalSynthesis = async () => {
    if (decryptedMemories.length === 0 || !user?.uid || !db) return;
    setIsSynthesizing(true);
    try {
      const entries = decryptedMemories.slice(-15).map((m: any) => ({ timestamp: m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toISOString() : new Date().toISOString(), content: m.content, type: m.type === 'vocal' ? 'voice_note' : 'journal' }));
      const result = await emotionalInsightSummary({ entries });
      const encryptedSummary = await encryptData(result.emotionalSummary, user.uid);
      await setDoc(doc(collection(db, "users", user.uid, "memories")), { content: encryptedSummary, type: 'synthesis', createdAt: serverTimestamp(), userId: user.uid, isEncrypted: true, analysis: result });
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
    { label: "Resilience", value: vectors.resilience, icon: Zap, color: "text-primary" },
    { label: "Empathy", value: vectors.empathy, icon: Heart, color: "text-accent" },
    { label: "Clarity", value: vectors.clarity, icon: Sparkles, color: "text-foreground" },
    { label: "Openness", value: vectors.openness, icon: TrendingUp, color: "text-secondary" },
  ];

  const recentSyntheses = useMemo(() => decryptedMemories.filter((m: any) => m.type === 'synthesis' || m.type === 'recap').slice(-5).reverse(), [decryptedMemories]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">Identity Evolution Map <ChartIcon className="w-7 h-7 text-primary" /></h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">Decrypted visualization of your internal neural growth.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full"><ShieldCheck className="w-4 h-4 text-primary" /><span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider">E2EE Analytics</span></div>
      </header>

      {/* Chart & Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground">Temporal Projection</h3>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterRange)} className="w-auto">
              <TabsList className="glass-morphism bg-transparent border-white/5 p-0.5 h-9 rounded-full">
                <TabsTrigger value="daily" className="rounded-full px-4 text-xs data-[state=active]:bg-primary">Day</TabsTrigger>
                <TabsTrigger value="weekly" className="rounded-full px-4 text-xs data-[state=active]:bg-primary">Week</TabsTrigger>
                <TabsTrigger value="monthly" className="rounded-full px-4 text-xs data-[state=active]:bg-primary">Month</TabsTrigger>
                <TabsTrigger value="yearly" className="rounded-full px-4 text-xs data-[state=active]:bg-primary">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <EvolutionChart data={chartData} />
        </div>
        <div className="space-y-5">
          <Card className="glass-morphism border-white/5 bg-transparent">
            <CardHeader><CardTitle className="font-headline text-base font-medium">Personality Status</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {vectorsLoading ? <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div> :
                stats.map((stat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs"><div className="flex items-center gap-2"><stat.icon className={`w-3.5 h-3.5 ${stat.color}`} /><span className="text-foreground/80">{stat.label}</span></div><span className="font-bold text-foreground">{stat.value}%</span></div>
                    <Progress value={stat.value} className="h-1.5 bg-white/5" />
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Synthesis Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-morphism border-white/5 bg-transparent p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><BrainCircuit className="w-6 h-6 text-primary" /></div>
            <div><h3 className="font-headline text-xl font-bold">Neural Synthesis</h3><p className="text-xs text-muted-foreground">Map your emotional landscape</p></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleEmotionalSynthesis} disabled={isSynthesizing || decryptedMemories.length === 0} className="flex-1 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 h-11 text-sm">
              {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />} Emotional Snapshot
            </Button>
            <Button onClick={handleGenerateRecap} disabled={isGenerating || decryptedMemories.length === 0} className="flex-1 rounded-xl bg-accent/20 hover:bg-accent/30 text-accent border border-accent/20 h-11 text-sm">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />} Annual Echo
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="font-headline text-sm font-medium text-muted-foreground flex items-center gap-2"><HistoryIcon className="w-4 h-4" /> Synthesis Archive</h3>
          <div className="space-y-3">
            {recentSyntheses.map((synth: any) => (
              <Card key={synth.id} className="glass-morphism border-white/5 bg-white/5 hover:bg-white/10 transition-all p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-none uppercase tracking-wider text-[9px]">{synth.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{synth.createdAt?.seconds ? format(new Date(synth.createdAt.seconds * 1000), "MMM d") : "Fragment"}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5 rounded-full h-8 w-8 p-0" onClick={() => handleStartRadio(synth.content)} disabled={isRadioLoading}>
                    {isRadioLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </Card>
            ))}
            {recentSyntheses.length === 0 && <div className="text-center py-8 glass-morphism rounded-xl border-white/5 italic text-muted-foreground text-xs">Archive is currently empty.</div>}
          </div>
        </div>
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {(emotionalInsight || audioUrl) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card className="glass-morphism border-primary/20 bg-primary/5 overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline text-base text-primary flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure Synthesis Results</h4>
                  <Button variant="ghost" size="sm" onClick={() => { setEmotionalInsight(null); setAudioUrl(null); }} className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
                {emotionalInsight && <p className="text-base md:text-lg font-light italic text-foreground/90 leading-relaxed">"{emotionalInsight.emotionalSummary}"</p>}
                {audioUrl && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-primary">Streaming Neural Signal...</p>
                    <audio controls src={audioUrl} className="w-full h-8" autoPlay />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}