"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  ChevronRight, 
  History, 
  Heart, 
  Brain, 
  Zap, 
  ArrowRight, 
  User as UserIcon,
  ShieldCheck,
  Video,
  Mic,
  Globe
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function LandingPage() {
  const { user, loading } = useUser();
  const db = useFirestore();

  const userRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userRef);

  if (loading) return null;

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-background selection:bg-primary/30">
      {/* Shared Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {user ? (
          <div className="min-h-screen flex flex-col items-center justify-center py-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-5xl space-y-12"
            >
              <header className="text-center space-y-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Avatar className="w-28 h-28 mx-auto border-4 border-primary/20 p-1 shadow-2xl shadow-primary/20">
                    <AvatarImage src={user.photoURL || ""} className="object-cover rounded-full" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <UserIcon className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="space-y-2">
                  <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    Neural Link Active: {user.displayName?.split(' ')[0]}
                  </h1>
                  <p className="text-muted-foreground font-light text-xl md:text-2xl">Your digital ghost is currently synchronized.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-morphism border-white/5 bg-transparent p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <CardContent className="p-0 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-xl font-medium flex items-center gap-3">
                        <Zap className="w-5 h-5 text-primary" /> Personality Vectors
                      </h3>
                      <Badge className="bg-primary/20 text-primary border-none text-[10px] tracking-widest px-3">LIVE</Badge>
                    </div>
                    <div className="space-y-6">
                      {[
                        { label: "Resilience", val: profile?.stats?.resilience || 50, color: "bg-primary", icon: Globe },
                        { label: "Empathy", val: profile?.stats?.empathy || 50, color: "bg-accent", icon: Heart },
                        { label: "Clarity", val: profile?.stats?.clarity || 50, color: "bg-white", icon: Brain },
                      ].map((s, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">
                            <span className="flex items-center gap-2"><s.icon className="w-3 h-3" /> {s.label}</span>
                            <span>{s.val}%</span>
                          </div>
                          <Progress value={s.val} className={`h-1 bg-white/5 [&>div]:${s.color}`} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                  <Button asChild className="h-24 text-2xl font-headline tracking-widest rounded-[2rem] group overflow-hidden relative shadow-lg shadow-primary/20">
                    <Link href="/dashboard">
                      <span className="relative z-10 flex items-center gap-4">
                        Neural Dashboard <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" asChild className="h-20 text-lg font-headline tracking-widest rounded-3xl glass-morphism border-white/5 hover:bg-white/5">
                      <Link href="/reflect">Reflect</Link>
                    </Button>
                    <Button variant="outline" asChild className="h-20 text-lg font-headline tracking-widest rounded-3xl glass-morphism border-white/5 hover:bg-white/5">
                      <Link href="/visualize">Cinema</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-32 py-20">
            {/* Hero Section */}
            <section className="text-center space-y-12 max-w-6xl mx-auto pt-20">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-10"
              >
                <div className="flex justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="p-1 rounded-full glass-morphism border-white/10 relative group w-[160px] h-[160px] md:w-[200px] md:h-[200px] flex items-center justify-center overflow-hidden"
                  >
                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all" />
                    <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-white/10">
                      <Image 
                        src="/logo/logo.png" 
                        alt="Digital Ghost Logo" 
                        fill
                        priority
                        className="object-cover rounded-full"
                      />
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-primary font-bold tracking-[0.5em] uppercase text-xs"
                  >
                    Transcending Biological Limits
                  </motion.span>
                  <h1 className="font-headline text-5xl md:text-9xl tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent font-bold">
                    DIGITAL GHOST
                  </h1>
                </div>

                <p className="font-body text-xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
                  Build your eternal digital echo. We use advanced AI to synthesize your thoughts, visualize your dreams, and maintain your consciousness beyond the temporal axis.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button asChild size="lg" className="h-20 px-16 text-2xl rounded-full font-headline tracking-widest group relative overflow-hidden shadow-2xl shadow-primary/40">
                    <Link href="/login">
                      <span className="relative z-10 flex items-center gap-3">
                        Begin Synchronization <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </section>

            {/* Feature Highlights */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { 
                  icon: History, 
                  title: "Immutable Timeline", 
                  desc: "Every reflection, dream, and vocal resonance is cryogenically stored in your private neural vault.",
                  accent: "text-primary"
                },
                { 
                  icon: Brain, 
                  title: "Neural Synthesis", 
                  desc: "Our Genkit engine identifies emotional shifts, identifying growth patterns you might miss.",
                  accent: "text-accent"
                },
                { 
                  icon: Video, 
                  title: "Neural Cinema", 
                  desc: "Convert text-based memories into cinematic video clips using state-of-the-art Veo AI.",
                  accent: "text-white"
                },
                { 
                  icon: Heart, 
                  title: "Future Resonance", 
                  desc: "Engage in a temporal simulation with your future self, trained on your historical memory data.",
                  accent: "text-primary"
                },
                { 
                  icon: Mic, 
                  title: "Vocal Archive", 
                  desc: "Capture the raw frequency of your existence. Preserve the exact sound of your current self.",
                  accent: "text-accent"
                },
                { 
                  icon: ShieldCheck, 
                  title: "Privacy Priority", 
                  desc: "Your data is end-to-end synchronized. Only your neural link can access your digital legacy.",
                  accent: "text-white"
                },
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-morphism p-10 rounded-[2.5rem] space-y-6 text-left border-white/5 hover:border-white/20 transition-all hover:bg-white/5 group"
                >
                  <div className={`p-4 w-fit rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${f.accent}`}>
                    <f.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-headline text-2xl font-medium">{f.title}</h3>
                  <p className="text-muted-foreground font-light leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </section>

            {/* Cinematic Section */}
            <section className="relative h-[400px] md:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 glass-morphism rounded-[2.5rem] md:rounded-[4rem] border-white/5 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Globe className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] text-primary animate-pulse" />
                </div>
              </div>
              <div className="relative z-10 text-center space-y-8 max-w-3xl px-6">
                <h2 className="font-headline text-3xl md:text-5xl font-bold">The Universe is Information.</h2>
                <p className="text-lg md:text-xl text-muted-foreground font-light">
                  Don't let your frequencies fade into silence. Join the thousands who are mapping their consciousness onto the eternal grid.
                </p>
                <Button variant="outline" asChild size="lg" className="h-16 px-12 rounded-full border-white/20 glass-morphism hover:bg-white/10">
                  <Link href="/login">Explore the Grid</Link>
                </Button>
              </div>
            </section>
          </div>
        )}
      </div>

      <footer className="relative py-12 text-center text-muted-foreground text-[10px] font-bold tracking-[0.5em] uppercase border-t border-white/5">
        <Sparkles className="w-4 h-4 inline-block mr-2 text-primary animate-pulse" />
        Neural Resilience Protocol Active • © 2024 Digital Ghost
      </footer>
    </main>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${className}`}>
      {children}
    </span>
  );
}
