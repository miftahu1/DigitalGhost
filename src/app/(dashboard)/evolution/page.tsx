"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart as ChartIcon, Sparkles, TrendingUp, Heart, Zap, Loader2, BookOpen, BrainCircuit } from "lucide-react";
import { EvolutionChart, ChartDataPoint } from "@/components/dashboard/evolution-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { yearlyRecap } from "@/ai/flows/yearly-recap";
import { emotionalInsightSummary, EmotionalInsightSummaryOutput } from "@/ai/flows/emotional-insight-summary";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isSameMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function EvolutionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [recapResult, setRecapResult] = useState<string | null>(null);
  const [emotionalInsight, setEmotionalInsight] = useState<EmotionalInsightSummaryOutput | null>(null);

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
    // Start from the earliest memory or 5 months ago, whichever is later
    const firstMemoryDate = memories[0].createdAt?.seconds 
      ? new Date(memories[0].createdAt.seconds * 1000) 
      : subMonths(now, 5);
      
    const startOfRange = firstMemoryDate > subMonths(now, 5) ? firstMemoryDate : subMonths(now, 5);
    const months = eachMonthOfInterval({ start: startOfRange, end: now });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthMemories = memories.filter((m: any) => {
        if (!m.createdAt?.seconds) return false;
        const date = new Date(m.createdAt.seconds * 1000);
        return date >= monthStart && date <= monthEnd;
      });

      const count = monthMemories.length;
      return {
        name: format(month, "MMM"),
        growth: Math.min(100, (count * 12) + 15),
        mood: count > 0 ? (45 + (Math.random() * 30)) : 0,
        emotional: count > 0 ? (50 + (count * 4)) : 0
      } as ChartDataPoint;
    });
  }, [memories]);

  const handleGenerateRecap = async () => {
    if (!memories || memories.length === 0) {
      toast({ variant: "destructive", title: "Insufficient Data", description: "You need at least one memory." });
      return;
    }

    setIsGenerating(true);
    try {
      const year = new Date().getFullYear();
      const entriesText = memories
        .map((m: any) => `[${m.type}] ${m.content}`)
        .join("\n\n");

      const result = await yearlyRecap({ year, entries: entriesText });
      setRecapResult(result.recap);
    } catch (error) {
      toast({ variant: "destructive", title: "Neural Error", description: "Synthesis failed." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmotionalSynthesis = async () => {
    if (!memories || memories.length === 0) return;
    setIsSynthesizing(true);
    try {
      const entries = memories.slice(-20).map((m: any) => ({
        timestamp: m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        content: m.content,
        type: m.type === 'vocal' ? 'voice_note' : 'journal'
      }));

      const result = await emotionalInsightSummary({ entries });
      setEmotionalInsight(result);
    } catch (error) {
      toast({ variant: "destructive", title: "Synthesis Blocked", description: "Could not read the emotional ether." });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const stats = [
    { label: "Resilience", value: profile?.stats?.resilience || 0, icon: Zap, color: "text-primary" },
    { label: "Empathy", value: profile?.stats?.empathy || 0, icon: Heart, color: "text-accent" },
    { label: "Clarity", value: profile?.stats?.clarity || 0, icon: Sparkles, color: "text-white" },
    { label: "Openness", value: profile?.stats?.openness || 0, icon: TrendingUp, color: "text-secondary" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight flex items-center gap-3">
          Identity Evolution Map <ChartIcon className="w-8 h-8 text-primary" />
        </h1>
        <p className="text-muted-foreground font-light text-lg mt-1">Visualize your internal growth over the temporal axis.</p>
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
                        <span className="font-light">{stat.label}</span>
                      </div>
                      <span className="font-bold tabular-nums">{stat.value}%</span>
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
                <h4 className="font-headline text-lg font-medium">Yearly Echo</h4>
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
          <h2 className="font-headline text-2xl font-medium tracking-tight flex items-center gap-3">
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

        {emotionalInsight ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="glass-morphism border-white/5 bg-accent/5 col-span-full">
              <CardContent className="p-8 space-y-4">
                <h4 className="font-headline text-lg text-accent flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Global Summary
                </h4>
                <p className="text-lg font-light italic leading-relaxed text-foreground/90">
                  "{emotionalInsight.emotionalSummary}"
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {emotionalInsight.persistentFeelings.map((feeling, i) => (
                    <Badge key={i} variant="outline" className="rounded-full bg-white/5 border-white/10 px-4 py-1">
                      {feeling}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-white/5 bg-transparent">
              <CardHeader>
                <CardTitle className="text-base font-medium">Significant Shifts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emotionalInsight.significantShifts.map((shift, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{shift.period}</span>
                      <TrendingUp className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-sm font-light leading-relaxed">{shift.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-morphism border-white/5 bg-transparent">
              <CardHeader>
                <CardTitle className="text-base font-medium">Neural State</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-accent/40 rounded-full animate-ping opacity-20" />
                  <Heart className="w-10 h-10 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-bold text-accent capitalize">
                    {emotionalInsight.overallEmotionalState}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Current Dominant Vector</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="py-20 text-center glass-morphism rounded-3xl border-white/5 text-muted-foreground font-light">
            Trigger Neural Synthesis to map your internal emotional shifts.
          </div>
        )}
      </section>

      <Dialog open={!!recapResult} onOpenChange={(open) => !open && setRecapResult(null)}>
        <DialogContent className="max-w-2xl glass-morphism border-white/10 bg-card/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Your Annual Echo
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              A narrative synthesis of your digital journey this year.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            <p className="text-lg font-light leading-relaxed text-foreground/90 italic whitespace-pre-wrap">
              {recapResult}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setRecapResult(null)} variant="outline" className="rounded-full border-white/10">
              Close Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}