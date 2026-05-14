
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart as ChartIcon, Sparkles, TrendingUp, Heart, Zap, Loader2 } from "lucide-react";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

export default function EvolutionPage() {
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profile, loading } = useDoc(userRef);

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
              {loading ? (
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
                <Sparkles className="w-8 h-8 text-primary mx-auto" />
                <h4 className="font-headline text-lg font-medium">Yearly Recap</h4>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Your neural data for the period is processing. Ready to generate your Digital Echo?
                </p>
                <button className="text-primary text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                  GENERATE RECAP
                </button>
             </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-medium tracking-tight">Recent Emotional Shifts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { period: "Recent Entry", shift: "Syncing → Stabilized", reason: "Integration of real-time data flow into the primary neural vault." },
          ].map((shift, i) => (
            <Card key={i} className="glass-morphism border-white/5 bg-card/20 group hover:border-primary/30 transition-all">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">{shift.period}</span>
                  <h4 className="font-headline text-xl font-medium">{shift.shift}</h4>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {shift.reason}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
