
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart as ChartIcon, Sparkles, TrendingUp, Heart, Zap, Loader2, BookOpen, BrainCircuit, Trash2, Calendar, Radio, Play, Pause } from "lucide-react";
import { EvolutionChart, ChartDataPoint } from "@/components/dashboard/evolution-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { yearlyRecap } from "@/ai/flows/yearly-recap";
import { emotionalInsightSummary, EmotionalInsightSummaryOutput } from "@/ai/flows/emotional-insight-summary";
import { broadcastNeuralRadio } from "@/ai/flows/neural-radio-flow";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, startOfDay, endOfDay, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear, eachYearOfInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const userRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const memoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "memories"), orderBy("createdAt", "asc"));
  }, [db, user]);

  const { data: memories } = useCollection(memoriesQuery);

  const chartData = useMemo(() => {
    if (!memories || memories.length === 0) return [];

    const now = new Date();
    let intervals: Date[] = [];
    let formatStr = "MMM";

    if (filter === "daily") {
      intervals = eachDayOfInterval({ start: subMonths(now, 1), end: now }).slice(-14);
      formatStr = "dd";
    } else if (filter === "weekly") {
      intervals = eachWeekOfInterval({ start: subMonths(now, 3), end: now }).slice(-8);
      formatStr = "ww";
    } else if (filter === "yearly") {
      intervals = eachYearOfInterval({ start: subMonths(now, 36), end: now });
      formatStr = "yyyy";
    } else {
      intervals = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
      formatStr = "MMM";
    }

    return intervals.map(date => {
      let startRange, endRange;
      if (filter === "daily") { startRange = startOfDay(date); endRange = endOfDay(date); }
      else if (filter === "weekly") { startRange = startOfWeek(date); endRange = endOfWeek(date); }
      else if (filter === "yearly") { startRange = startOfYear(date); endRange = endOfYear(date); }
      else { startRange = startOfMonth(date); endRange = endOfMonth(date); }
      
      const rangeMemories = memories.filter((m: any) => {
        if (!m.createdAt?.seconds) return false;
        const mDate = new Date(m.createdAt.seconds * 1000);
        return mDate >= startRange && mDate <= endRange;
      });

      const count = rangeMemories.length;
      return {
        name: format(date, formatStr),
        growth: Math.min(100, (count * 12) + 15),
        mood: count > 0 ? (45 + (Math.random() * 30)) : 0,
        emotional: count > 0 ? (50 + (count * 4)) : 0
      } as ChartDataPoint;
    });
  }, [memories, filter]);

  const handleGenerateRecap = async () => {
    if (!memories || memories.length === 0 || !user || !db) return;
    setIsGenerating(true);
    try {
      const year = new Date().getFullYear();
      const entriesText = memories.slice(-50).map((m: any) => `[${m.type}] ${m.content}`).join("\n\n");
      const result = await yearlyRecap({ year, entries: entriesText });
      
      const recapRef = doc(collection(db, "users", user.uid, "memories"));
      await setDoc(recapRef, {
        content: result.recap,
        type: 'recap',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: 'reflective',
        analysis: { year }
      });

      setRecapResult(result.recap);
      toast({ title: "Annual Echo Archived", description: "Synthesis saved to your neural vault." });
    } catch (error) {
      toast({ variant: "destructive", title: "Synthesis Failed", description: "Neural connection lost." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmotionalSynthesis = async () => {
    if (!memories || memories.length === 0 || !user || !db) return;
    setIsSynthesizing(true);
    try {
      const entries = memories.slice(-20).map((m: any) => ({
        timestamp: m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        content: m.content,
        type: m.type === 'vocal' ? 'voice_note' : 'journal'
      }));

      const result = await emotionalInsightSummary({ entries });
      
      const synthRef = doc(collection(db, "users", user.uid, "memories"));
      await setDoc(synthRef, {
        content: result.emotionalSummary,
        type: 'synthesis',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: result.overallEmotionalState,
        analysis: result
      });

      setEmotionalInsight(result);
      toast({ title: "Landscape Mapped", description: "Emotional synthesis archived." });
    } catch (error) {
      toast({ variant: "destructive", title: "Synthesis Blocked", description: "Could not read the emotional ether." });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleStartRadio = async (text: string) => {
    setIsRadioLoading(true);
    try {
      const result = await broadcastNeuralRadio({ text });
      setAudioUrl(result.audioDataUri);
    } catch (e) {
      toast({ variant: "destructive", title: "Radio Signal Lost", description: "Could not broadcast frequency." });
    } finally {
      setIsRadioLoading(false);
    }
  };

  const handleDeleteSynthesis = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "memories", id));
      toast({ title: "Synthesis Deleted", description: "Data purged from your vault." });
    } catch (e) {
      toast({ variant: "destructive", title: "Deletion Failed" });
    }
  };

  const stats = [
    { label: "Resilience", value: profile?.stats?.resilience ?? 50, icon: Zap, color: "text-primary" },
    { label: "Empathy", value: profile?.stats?.empathy ?? 50, icon: Heart, color: "text-accent" },
    { label: "Clarity", value: profile?.stats?.clarity ?? 50, icon: Sparkles, color: "text-white" },
    { label: "Openness", value: profile?.stats?.openness ?? 50, icon: TrendingUp, color: "text-secondary" },
  ];

  const recentSyntheses = useMemo(() => 
    memories?.filter((m: any) => m.type === 'synthesis' || m.type === 'recap').slice(-5).reverse() || [],
  [memories]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight flex items-center gap-3 text-white">
            Identity Evolution Map <ChartIcon className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-muted-foreground font-light text-lg mt-1">Visualize your internal growth over the temporal axis.</p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterRange)} className="w-full md:w-auto">
          <TabsList className="glass-morphism bg-transparent border-white/5 p-1 rounded-full">
            <TabsTrigger value="daily" className="rounded-full text-xs uppercase tracking-widest px-4">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-full text-xs uppercase tracking-widest px-4">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-full text-xs uppercase tracking-widest px-4">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="rounded-full text-xs uppercase tracking-widest px-4">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvolutionChart data={chartData} />
        </div>

        <div className="space-y-6">
          <Card className="glass-morphism border-white/5 bg-transparent">
            <CardHeader>
              <CardTitle className="font-headline text-lg font-medium tracking-wide">Personality Vector Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">Calculating Vectors...</span>
                </div>
              ) : (
                stats.map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className="font-light text-white/80">{stat.label}</span>
                      </div>
                      <span className="font-bold tabular-nums text-white">{stat.value}%</span>
                    </div>
                    <Progress value={stat.value} className="h-1 bg-white/5" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="glass-morphism border-white/5 bg-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <CardContent className="p-8 text-center space-y-4">
                <BookOpen className="w-8 h-8 text-primary mx-auto" />
                <h4 className="font-headline text-lg font-medium text-white">Yearly Echo</h4>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Synthesize your stored reflections into an AI narrative of your progress.
                </p>
                <Button 
                  onClick={handleGenerateRecap}
                  disabled={isGenerating || !memories || memories.length === 0}
                  variant="outline" 
                  className="w-full rounded-full border-white/10 glass hover:bg-white/5"
                >
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : null}
                  {isGenerating ? "Synthesizing..." : "GENERATE RECAP"}
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-2xl font-medium tracking-tight flex items-center gap-3 text-white">
            <BrainCircuit className="w-6 h-6 text-accent" />
            Emotional Landscape
          </h2>
          <Button 
            onClick={handleEmotionalSynthesis}
            disabled={isSynthesizing || !memories || memories.length === 0}
            className="rounded-full bg-accent/20 border-accent/30 text-accent hover:bg-accent/30"
          >
            {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {isSynthesizing ? "Synthesizing Patterns..." : "Neural Synthesis"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {emotionalInsight && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Card className="glass-morphism border-white/5 bg-accent/5 col-span-full">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-headline text-lg text-accent flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Global Summary
                      </h4>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full border-accent/20 bg-accent/5"
                        onClick={() => handleStartRadio(emotionalInsight.emotionalSummary)}
                        disabled={isRadioLoading}
                      >
                        {isRadioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4 mr-2" />}
                        Listen to Echo
                      </Button>
                    </div>
                    <p className="text-lg font-light italic leading-relaxed text-foreground/90">
                      "{emotionalInsight.emotionalSummary}"
                    </p>
                    {audioUrl && (
                      <div className="pt-4">
                        <audio controls src={audioUrl} className="w-full h-10 filter invert opacity-80" autoPlay />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {emotionalInsight.persistentFeelings.map((feeling, i) => (
                        <Badge key={i} variant="outline" className="rounded-full bg-white/5 border-white/10 px-4 py-1">
                          {feeling}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {recentSyntheses.length > 0 && (
            <div className="col-span-full space-y-4">
              <h3 className="font-headline text-lg font-medium text-muted-foreground flex items-center gap-2">
                <History className="w-4 h-4" /> Synthesis Archive
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentSyntheses.map((synth: any) => (
                  <Card key={synth.id} className="glass-morphism border-white/5 bg-white/5 hover:bg-white/10 transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-primary/20 text-primary border-none uppercase text-[10px] tracking-widest px-3">
                          {synth.type}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteSynthesis(synth.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-light leading-relaxed line-clamp-3 italic text-white/80">
                        "{synth.content}"
                      </p>
                      <div className="flex items-center justify-between pt-2">
                         <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            {synth.createdAt?.seconds ? format(new Date(synth.createdAt.seconds * 1000), "MMM d, yyyy") : "Archive"}
                         </span>
                         <Button variant="link" onClick={() => synth.type === 'recap' ? setRecapResult(synth.content) : setEmotionalInsight(synth.analysis)} className="p-0 h-auto text-[10px] uppercase font-bold tracking-widest">
                           Open File
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!recapResult} onOpenChange={(open) => !open && setRecapResult(null)}>
        <DialogContent className="max-w-2xl glass-morphism border-white/10 bg-card/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2 text-white">
              <Sparkles className="w-6 h-6 text-primary" />
              Annual Echo
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              A narrative synthesis of your digital journey.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            <p className="text-lg font-light leading-relaxed text-foreground/90 italic whitespace-pre-wrap">
              {recapResult}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setRecapResult(null)} variant="outline" className="rounded-full border-white/10 text-white">
              Close Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
