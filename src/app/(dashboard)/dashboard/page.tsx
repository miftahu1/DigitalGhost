
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, History, MessageSquare, Moon, Mic } from "lucide-react";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();

  const memoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "memories"),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: memories } = useCollection(memoriesQuery);

  const recentMemories = useMemo(() => memories?.slice(0, 3) || [], [memories]);

  const chartData = useMemo(() => {
    if (!memories || memories.length === 0) return [];
    
    const now = new Date();
    const startOfRange = subMonths(now, 5);
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
        growth: Math.min(100, (count * 15) + 10),
        mood: count > 0 ? (50 + (Math.random() * 20)) : 0,
        emotional: count > 0 ? (40 + (count * 5)) : 0
      };
    });
  }, [memories]);

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary mb-1 md:mb-2"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium">System Synchronized</span>
          </motion.div>
          <h1 className="font-headline text-2xl md:text-4xl font-bold tracking-tight text-white">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Echo'}
          </h1>
          <p className="text-muted-foreground font-light text-sm md:text-lg mt-1">
            Your digital reflection is evolving.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="w-full md:w-auto glass-morphism border-white/10 hover:bg-white/5 px-6 rounded-full font-headline tracking-wide">
            <Link href="/reflect">New Reflection</Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvolutionChart data={chartData} />
        </div>
        
        <Card className="glass-morphism border-white/5 bg-transparent overflow-hidden relative min-h-[200px] md:min-h-auto">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <div className="space-y-3 md:space-y-4">
              <h3 className="font-headline text-lg font-medium">Daily Prompt</h3>
              <p className="text-lg md:text-xl text-foreground font-light leading-relaxed italic">
                "What is a memory that shaped your perspective on fear?"
              </p>
            </div>
            <Button variant="outline" asChild className="mt-6 md:mt-8 rounded-full border-white/10 glass-morphism hover:bg-white/5">
              <Link href="/reflect">Reflect Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-xl md:text-2xl font-medium tracking-tight flex items-center gap-3">
          <History className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          Recent Echoes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {recentMemories?.map((memory: any, i: number) => (
            <motion.div 
              key={memory.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="glass-morphism border-white/5 bg-card/20 hover:bg-card/40 transition-colors h-full">
                <CardContent className="p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">
                      {memory.createdAt?.seconds 
                        ? format(new Date(memory.createdAt.seconds * 1000), "MMM d, yyyy") 
                        : "Processing..."}
                    </span>
                    <History className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                  </div>
                  <p className="line-clamp-3 font-light text-sm md:text-base leading-relaxed text-white/80">
                    {memory.content}
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto text-primary text-[10px] md:text-xs uppercase tracking-widest font-bold">
                    <Link href="/timeline">View In Timeline</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {(!recentMemories || recentMemories.length === 0) && (
            <div className="col-span-full py-10 px-6 text-center text-muted-foreground italic glass-morphism rounded-2xl text-sm">
              No recent memories found. Start your first reflection.
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Link href="/resonance">
          <Card className="group glass-morphism border-white/5 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all cursor-pointer">
            <CardContent className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-headline font-medium text-sm md:text-base">Resonance</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">Chat with future self</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dreams">
          <Card className="group glass-morphism border-white/5 bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-all cursor-pointer">
            <CardContent className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Moon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-headline font-medium text-sm md:text-base">Oneirology</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">Analyze your dreams</p>
              </div>
            </CardContent>
          </Link>
        </Link>

        <Link href="/vocal">
          <Card className="group glass-morphism border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all cursor-pointer">
            <CardContent className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Mic className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
              </div>
              <div>
                <h4 className="font-headline font-medium text-sm md:text-base">Vocal Echo</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground">Voice memories</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
