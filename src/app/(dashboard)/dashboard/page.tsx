"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, History, MessageSquare, Moon, Mic, Loader2, ShieldCheck, PenLine, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useUser } from "@/firebase";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { useDecryptedMemories } from "@/hooks/use-decrypted-memories";
import { EchoesOfThePast } from "@/components/dashboard/EchoesOfThePast";

export default function Dashboard() {
  const { user } = useUser();
  const { decryptedMemories, loading: isLoading } = useDecryptedMemories();

  const summaryCounts = useMemo(() => {
    if (!decryptedMemories) return { total: 0, reflections: 0, dreams: 0, vocals: 0, resonances: 0 };
    const reflections = decryptedMemories.filter((m: any) => m.type === "journal" || m.type === "entry").length;
    const dreams = decryptedMemories.filter((m: any) => m.type === "dream").length;
    const vocals = decryptedMemories.filter((m: any) => m.type === "vocal").length;
    const resonances = decryptedMemories.filter((m: any) => m.type === "resonance").length;
    return { total: decryptedMemories.length, reflections, dreams, vocals, resonances };
  }, [decryptedMemories]);

  const chartData = useMemo(() => {
    if (!decryptedMemories || decryptedMemories.length === 0) return [];
    const now = new Date();
    const startOfRange = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: startOfRange, end: now });
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthMemories = decryptedMemories.filter((m: any) => {
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
  }, [decryptedMemories]);

  const recentMemoriesForDisplay = useMemo(() => decryptedMemories.slice(0, 3), [decryptedMemories]);

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism border-white/10 bg-transparent p-5 md:p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-medium">System Synchronized</span>
            </div>
            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user?.displayName?.split(' ')[0] || 'Echo'}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Your neural archive is secure and growing. Continue your journey with a guided prompt or quick action.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="default" className="rounded-xl shadow-lg shadow-primary/20">
              <Link href="/reflect">New Reflection</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/resonance">Future Resonance</Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Vault Entries", value: summaryCounts.total, icon: History },
          { label: "Reflections", value: summaryCounts.reflections, icon: PenLine },
          { label: "Dreams", value: summaryCounts.dreams, icon: Moon },
          { label: "Vocals", value: summaryCounts.vocals, icon: Mic },
          { label: "Resonances", value: summaryCounts.resonances, icon: MessageSquare },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass-morphism border-white/10 bg-transparent p-4 text-center hover:border-primary/20 transition-all h-full">
              <stat.icon className="w-5 h-5 text-primary/60 mx-auto mb-2" />
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-headline font-bold mt-1">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <EchoesOfThePast />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EvolutionChart data={chartData} />
        </div>
        <div className="space-y-4">
          <Card className="glass-morphism border-white/10 bg-transparent p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Security</p>
            </div>
            <h3 className="font-headline text-lg font-semibold">E2EE Active</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Your memories remain encrypted until decrypted by your device. Session keys rotate automatically.
            </p>
          </Card>
          <Card className="glass-morphism border-white/10 bg-transparent p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: "Start reflection", href: "/reflect" },
                { label: "Open timeline", href: "/timeline" },
                { label: "Launch resonance", href: "/resonance" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm"
                >
                  {item.label}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-xl font-medium flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Recent Echoes
          </h2>
          <Link href="/timeline" className="text-xs text-primary hover:underline">View all</Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Decrypting Archive...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMemoriesForDisplay.map((memory: any, i: number) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-morphism border-white/5 bg-card/20 hover:bg-card/40 transition-all h-full">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                        {memory.createdAt?.seconds ? format(new Date(memory.createdAt.seconds * 1000), "MMM d, yyyy") : "Processing..."}
                      </span>
                      <History className="w-3 h-3 text-muted-foreground/40" />
                    </div>
                    <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
                      {memory.content}
                    </p>
                    <Button variant="link" asChild className="p-0 h-auto text-primary text-[10px] uppercase tracking-wider font-semibold">
                      <Link href={`/timeline#${memory.id}`}>View in Timeline</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {(!isLoading && recentMemoriesForDisplay.length === 0) && (
              <div className="col-span-full py-12 text-center text-muted-foreground italic glass-morphism rounded-2xl text-sm">
                No recent memories found. Start your first reflection.
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/resonance">
          <Card className="group glass-morphism border-white/5 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5 text-primary" />
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
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Moon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-headline font-medium">Oneirology</h4>
                <p className="text-xs text-muted-foreground">Analyze dreams</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/vocal">
          <Card className="group glass-morphism border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 transition-all cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h4 className="font-headline font-medium">Vocal Echo</h4>
                <p className="text-xs text-muted-foreground">Voice memories</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
