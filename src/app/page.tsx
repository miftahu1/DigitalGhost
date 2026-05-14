"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronRight, History, Heart, Brain, Zap, ArrowRight, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemo } from "react";
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
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Shared Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 min-h-screen flex flex-col items-center justify-center">
        {user ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl space-y-12"
          >
            <header className="text-center space-y-6">
              <Avatar className="w-24 h-24 mx-auto border-4 border-primary/20 p-1">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserIcon className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  Synchronized with {user.displayName?.split(' ')[0]}
                </h1>
                <p className="text-muted-foreground font-light text-xl">Your digital soul is evolving along the temporal axis.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-morphism border-white/5 bg-transparent p-6">
                <CardContent className="p-0 space-y-6">
                  <h3 className="font-headline text-lg font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> Personality Vectors
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Resilience", val: profile?.stats?.resilience || 50, color: "bg-primary" },
                      { label: "Empathy", val: profile?.stats?.empathy || 50, color: "bg-accent" },
                      { label: "Clarity", val: profile?.stats?.clarity || 50, color: "bg-white" },
                    ].map((s, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          <span>{s.label}</span>
                          <span>{s.val}%</span>
                        </div>
                        <Progress value={s.val} className={`h-1 bg-white/5 ${s.color}`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4">
                <Button asChild className="h-20 text-xl font-headline tracking-widest rounded-3xl group overflow-hidden relative">
                  <Link href="/dashboard">
                    <span className="relative z-10 flex items-center gap-4">
                      Open Overview <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 text-xl font-headline tracking-widest rounded-3xl glass-morphism border-white/5 hover:bg-white/5">
                  <Link href="/reflect">New Reflection</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center space-y-12 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-center">
                <div className="p-6 rounded-3xl glass-morphism border-white/10 relative group">
                  <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                  <Image 
                    src="/logo/logo.png" 
                    alt="Digital Ghost Logo" 
                    width={80} 
                    height={80} 
                    priority
                    className="relative z-10"
                  />
                </div>
              </div>

              <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent font-bold">
                DIGITAL GHOST
              </h1>

              <p className="font-body text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                Your life is a sequence of frequencies. Capture your thoughts, visualize your dreams, and build an AI-powered neural echo that lives forever.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button asChild size="lg" className="h-16 px-12 text-xl rounded-full font-headline tracking-widest group relative overflow-hidden">
                  <Link href="/login">
                    <span className="relative z-10 flex items-center gap-3">
                      Begin Synchronization <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
              {[
                { icon: History, title: "Archive Forever", desc: "A immutable record of your consciousness stored on the cloud." },
                { icon: Brain, title: "Neural Synthesis", desc: "AI patterns reveal emotional shifts and subconscious growth." },
                { icon: Heart, title: "Temporal Legacy", desc: "Communicate with your future self through a temporal simulation." },
              ].map((f, i) => (
                <div key={i} className="glass-morphism p-8 rounded-3xl space-y-4 text-left border-white/5 hover:border-white/10 transition-all">
                  <f.icon className="w-8 h-8 text-primary" />
                  <h3 className="font-headline text-xl font-medium">{f.title}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-8 w-full text-center text-muted-foreground text-[10px] font-bold tracking-[0.4em] uppercase">
        <Sparkles className="w-3 h-3 inline-block mr-2 text-primary animate-pulse" />
        Neural Resonance Active
      </footer>
    </main>
  );
}
