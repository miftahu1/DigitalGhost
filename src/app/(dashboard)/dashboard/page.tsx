
"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, History, MessageSquare, Moon, Mic, Loader2, ShieldCheck } from "lucide-react";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { decryptData } from "@/lib/encryption";

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const [decryptedRecent, setDecryptedRecent] = useState<any[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const memoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "memories"),
      orderBy("createdAt", "desc"),
      limit(10) // Fetch a few more to filter if necessary
    );
  }, [db, user]);

  const { data: memories, loading } = useCollection(memoriesQuery);

  useEffect(() => {
    async function processMemories() {
      if (!memories || !user?.uid) return;
      setIsDecrypting(true);
      try {
        const processed = await Promise.all(
          memories.slice(0, 3).map(async (m: any) => ({
            ...m,
            content: m.isEncrypted ? await decryptData(m.content, user.uid) : m.content
          }))
        );
        setDecryptedRecent(processed);
      } catch (err) {
        console.error("Dashboard decryption error:", err);
      } finally {
        setIsDecrypting(false);
      }
    }
    processMemories();
  }, [memories, user?.uid]);

  const summaryCounts = useMemo(() => {
    if (!memories) return { total: 0, reflections: 0, dreams: 0, vocals: 0, resonances: 0 };

    const reflections = memories.filter((m: any) => m.type === "journal").length;
    const dreams = memories.filter((m: any) => m.type === "dream").length;
    const vocals = memories.filter((m: any) => m.type === "vocal").length;
    const resonances = memories.filter((m: any) => m.content?.includes("Dialogue with Future Self")).length;

    return {
      total: memories.length,
      reflections,
      dreams,
      vocals,
      resonances,
    };
  }, [memories]);

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
    <div className="space-y-8 md:space-y-10">
      <div className="grid gap-8 xl:grid-cols-[2fr_1.1fr]">
        <section className="space-y-6">
          <div className="glass-morphism border-white/10 bg-transparent p-8 shadow-xl shadow-black/10 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            <div className="relative grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-center">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-primary mb-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium">System Synchronized</span>
                </motion.div>
                <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-foreground dark:text-white">
                  Welcome back, {user?.displayName?.split(' ')[0] || 'Echo'}
                </h1>
                <p className="max-w-2xl text-muted-foreground font-light text-sm md:text-base leading-relaxed">
                  Your neural archive is secure, private, and growing with every memory. Continue your journey with a guided prompt, quick actions, and a summary of your latest echoes.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                  <Button asChild className="h-14 rounded-full glass-morphism border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold">
                    <Link href="/reflect">New Reflection</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-14 rounded-full border-white/10 font-semibold">
                    <Link href="/resonance">Future Resonance</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Card className="glass-morphism border-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Active Mode</p>
                  <h3 className="mt-2 text-2xl font-headline font-semibold">Personal Growth</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Stay grounded with secure journaling, dream analysis, and voice echo capture.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                    <ShieldCheck className="w-4 h-4" /> Synced & encrypted
                  </div>
                </Card>
                <Card className="glass-morphism border-white/10 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Today’s Focus</p>
                  <h3 className="mt-2 text-2xl font-headline font-semibold">Dream integration</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Review your latest dream notes and turn them into a reflective journal entry before bedtime.
                  </p>
                </Card>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Vault Entries", value: summaryCounts.total, description: "Memories stored in your private stream." },
              { label: "Dream Excerpts", value: summaryCounts.dreams, description: "Visualized dreams held in your archive." },
              { label: "Voice Echoes", value: summaryCounts.vocals, description: "Recorded audio entries preserved." },
              { label: "Resonances", value: summaryCounts.resonances, description: "Future self conversations generated." },
            ].map((item) => (
              <Card key={item.label} className="glass-morphism border-white/10 bg-transparent p-5">
                <CardContent className="p-0 space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground">{item.label}</p>
                  <p className="text-3xl font-headline font-bold">{item.value}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-morphism border-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Security Check</p>
                  <h3 className="mt-2 text-2xl font-headline font-semibold">Privacy health</h3>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                  <ShieldCheck className="w-4 h-4" /> E2EE Active
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Your memories remain encrypted until decrypted by your device, and session keys rotate automatically on each login.
              </p>
            </Card>
            <Card className="glass-morphism border-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Quick planning</p>
              <h3 className="mt-2 text-2xl font-headline font-semibold">Your next action</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Create a new dream summary or record a vocal echo to keep your neural profile current.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" className="h-12 rounded-full border-primary/20 text-primary hover:bg-primary/10 text-sm">
                  <Link href="/dreams">Review Dreams</Link>
                </Button>
                <Button asChild className="h-12 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-sm">
                  <Link href="/vocal">Capture Voice</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <aside className="space-y-6">
          <Card className="glass-morphism border-white/10 bg-transparent p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Progress</p>
            <h3 className="mt-2 text-2xl font-headline font-semibold">Growth snapshot</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your latest reflections and dream entries are shaping the next evolution of your digital ghost.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-3xl bg-background/60 p-4 border border-white/10">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Consistency</p>
                <p className="mt-2 text-lg font-semibold">4 sessions this week</p>
              </div>
              <div className="rounded-3xl bg-background/60 p-4 border border-white/10">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Insight</p>
                <p className="mt-2 text-lg font-semibold">3 dream patterns detected</p>
              </div>
            </div>
          </Card>

          <Card className="glass-morphism border-white/10 bg-transparent p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shortcuts</p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Start reflection", href: "/reflect" },
                { label: "Open timeline", href: "/timeline" },
                { label: "Launch resonance", href: "/resonance" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-xl md:text-2xl font-medium tracking-tight flex items-center gap-3">
          <History className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          Recent Echoes
        </h2>
        
        {isDecrypting ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Decrypting Archive...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {decryptedRecent.map((memory: any, i: number) => (
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
                    <p className="line-clamp-3 font-light text-sm md:text-base leading-relaxed text-foreground/80 dark:text-white/80">
                      {memory.content}
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto text-primary text-[10px] md:text-xs uppercase tracking-widest font-bold">
                      <Link href="/timeline">View In Timeline</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {(!loading && decryptedRecent.length === 0) && (
              <div className="col-span-full py-10 px-6 text-center text-muted-foreground italic glass-morphism rounded-2xl text-sm">
                No recent memories found. Start your first reflection.
              </div>
            )}
          </div>
        )}
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
          </Card>
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
