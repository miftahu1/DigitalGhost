
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart as ChartIcon, Sparkles, TrendingUp, Heart, Zap, Loader2, BookOpen, X } from "lucide-react";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { yearlyRecap } from "@/ai/flows/yearly-recap";
import { useToast } from "@/hooks/use-toast";

export default function EvolutionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [recapResult, setRecapResult] = useState<string | null>(null);

  const userRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const memoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "memories"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: memories } = useCollection(memoriesQuery);

  const handleGenerateRecap = async () => {
    if (!memories || memories.length === 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Data",
        description: "You need at least one memory to generate a recap.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const year = new Date().getFullYear();
      const entriesText = memories
        .map((m: any) => `[${m.type}] ${m.content}`)
        .join("\n\n");

      const result = await yearlyRecap({
        year,
        entries: entriesText,
      });

      setRecapResult(result.recap);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Neural Error",
        description: "The AI could not synthesize your timeline at this moment.",
      });
    } finally {
      setIsGenerating(false);
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
        <p className="text-muted-foreground font-light text-lg mt-1">Visualize your internal growth over the aeons.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvolutionChart />
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
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Calculating Vectors...</span>
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
                <h4 className="font-headline text-lg font-medium">Yearly Recap</h4>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Synthesize your stored reflections into an AI-generated narrative of your year.
                </p>
                <Button 
                  onClick={handleGenerateRecap}
                  disabled={isGenerating || !memories || memories.length === 0}
                  variant="link" 
                  className="text-primary text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  {isGenerating ? "Processing..." : "GENERATE RECAP"}
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-medium tracking-tight">Neural Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-morphism border-white/5 bg-card/20 group hover:border-primary/30 transition-all">
            <CardContent className="p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-full glass flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">Stability Profile</span>
                <h4 className="font-headline text-xl font-medium">Syncing → Stabilized</h4>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Integration of real-time data flow into the primary neural vault. Emotional variance is within expected parameters.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
