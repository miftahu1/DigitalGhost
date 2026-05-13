
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
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();

  const recentMemoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "memories"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
  }, [db, user]);

  const { data: recentMemories } = useCollection(recentMemoriesQuery);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary mb-2"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs uppercase tracking-[0.3em] font-medium">System Synchronized</span>
          </motion.div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Echo'}
          </h1>
          <p className="text-muted-foreground font-light text-lg mt-1">
            Your digital reflection is evolving.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="glass-morphism border-white/10 hover:bg-white/5 px-6 rounded-full font-headline tracking-wide">
            <Link href="/reflect">New Reflection</Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvolutionChart />
        </div>
        
        <Card className="glass-morphism border-white/5 bg-transparent overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <h3 className="font-headline text-lg font-medium">Daily Prompt</h3>
              <p className="text-xl text-foreground font-light leading-relaxed italic">
                "What is a memory that shaped your perspective on fear?"
              </p>
            </div>
            <Button variant="outline" asChild className="mt-8 rounded-full border-white/10 glass-morphism hover:bg-white/5">
              <Link href="/reflect">Reflect Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-medium tracking-tight flex items-center gap-3">
          <History className="w-6 h-6 text-primary" />
          Recent Echoes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentMemories?.map((memory: any, i: number) => (
            <motion.div 
              key={memory.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="glass-morphism border-white/5 bg-card/20 hover:bg-card/40 transition-colors h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">
                      {memory.createdAt?.seconds 
                        ? format(new Date(memory.createdAt.seconds * 1000), "MMM d, yyyy") 
                        : "Processing..."}
                    </span>
                    <History className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="line-clamp-3 font-light leading-relaxed">
                    {memory.content}
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto text-primary text-xs uppercase tracking-widest font-bold">
                    <Link href="/timeline">View In Timeline</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {(!recentMemories || recentMemories.length === 0) && (
            <div className="col-span-full py-10 text-center text-muted-foreground italic glass-morphism rounded-2xl">
              No recent memories found. Start your first reflection.
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/resonance">
          <Card className="group glass-morphism border-white/5 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all cursor-pointer">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-headline font-medium">Resonance</h4>
                <p className="text-xs text-muted-foreground">Chat with future self</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dreams">
          <Card className="group glass-morphism border-white/5 bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-all cursor-pointer">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Moon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-headline font-medium">Oneirology</h4>
                <p className="text-xs text-muted-foreground">Analyze your dreams</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vocal">
          <Card className="group glass-morphism border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all cursor-pointer">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h4 className="font-headline font-medium">Vocal Echo</h4>
                <p className="text-xs text-muted-foreground">Voice memories</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
