
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
  Globe,
  Lock,
  Shield,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { decryptData } from "@/lib/encryption";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function LandingPage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [decryptedRecentMemories, setDecryptedRecentMemories] = useState<any[]>([]);
  const [isDecryptingRecent, setIsDecryptingRecent] = useState(false);

  useEffect(() => {
    const hasSeenPrivacy = localStorage.getItem('dg_privacy_seen');
    if (!hasSeenPrivacy) {
      const timer = setTimeout(() => setShowPrivacyModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissPrivacy = () => {
    if (dontShowAgain) {
      localStorage.setItem('dg_privacy_seen', 'true');
    }
    setShowPrivacyModal(false);
  };

  const memoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "memories"), orderBy("createdAt", "asc"));
  }, [db, user]);

  const { data: memories } = useCollection(memoriesQuery);

  useEffect(() => {
    async function decryptRecent() {
      if (!memories || !user?.uid) return;
      setIsDecryptingRecent(true);
      try {
        const processed = await Promise.all(
          memories.slice(-3).reverse().map(async (m: any) => ({
            ...m,
            content: m.isEncrypted ? await decryptData(m.content, user.uid) : m.content,
          }))
        );
        setDecryptedRecentMemories(processed);
      } catch (err) {
        console.error("Landing page decryption error:", err);
      } finally {
        setIsDecryptingRecent(false);
      }
    }

    decryptRecent();
  }, [memories, user?.uid]);

  const derivedStats = useMemo(() => {
    if (!memories) return { resilience: 50, empathy: 50, clarity: 50, openness: 50 };
    
    const counts = {
      journal: memories.filter(m => m.type === 'journal').length,
      dream: memories.filter(m => m.type === 'dream').length,
      vocal: memories.filter(m => m.type === 'vocal').length,
      resonance: memories.filter(m => m.content?.includes('Dialogue with Future Self')).length,
    };

    return {
      resilience: Math.min(100, 30 + (counts.journal * 3)),
      empathy: Math.min(100, 30 + (counts.resonance * 8)),
      clarity: Math.min(100, 30 + (counts.dream * 7)),
      openness: Math.min(100, 30 + (counts.vocal * 6)),
    };
  }, [memories]);

  const overviewCounts = useMemo(() => {
    if (!memories) return { journal: 0, dream: 0, vocal: 0, resonance: 0 };

    return {
      journal: memories.filter(m => m.type === 'journal').length,
      dream: memories.filter(m => m.type === 'dream').length,
      vocal: memories.filter(m => m.type === 'vocal').length,
      resonance: memories.filter(m => m.content?.includes('Dialogue with Future Self')).length,
    };
  }, [memories]);

  const recentMemories = useMemo(() => {
    return decryptedRecentMemories;
  }, [decryptedRecentMemories]);

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
          <div className="min-h-screen py-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <Card className="glass-morphism border-white/10 bg-transparent p-8 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/15 to-transparent pointer-events-none" />
                  <div className="relative space-y-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-4">
                        {/* <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                          <Sparkles className="w-4 h-4" /> Neural Link Active
                        </div> */}
                        <div>
                          <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground dark:text-white">
                            Welcome back, {user.displayName?.split(' ')[0] || 'Echo'}
                          </h1>
                          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                            Your personal echo is synced and ready. Capture a reflection, analyze a dream, or explore your resonance in one click.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Avatar className="w-24 h-24 border-4 border-primary/20 p-1 shadow-2xl shadow-primary/15">
                          <AvatarImage src={user.photoURL || ""} className="object-cover rounded-full" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <UserIcon className="w-12 h-12" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 text-right">
                          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Next sync</p>
                          <p className="font-semibold text-foreground">In 2 min</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: "Reflections", value: overviewCounts.journal },
                        { label: "Dreams", value: overviewCounts.dream },
                        { label: "Vocals", value: overviewCounts.vocal },
                        { label: "Resonances", value: overviewCounts.resonance },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-3xl border border-white/10 bg-background/80 p-5">
                          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                          <p className="mt-3 text-3xl font-headline font-semibold text-foreground">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="space-y-4">
                  <Button asChild variant="outline" className="w-full rounded-full text-sm h-14">
                    <Link href="/dashboard">Open Dashboard</Link>
                  </Button>

                  <Card className="glass-morphism border-white/10 bg-transparent p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Evergreen prompt</p>
                        <h2 className="mt-2 text-2xl font-headline font-semibold text-foreground dark:text-white">Your next reflection</h2>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-none">Live</Badge>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      What memory would you preserve today if you knew it would shape your future self? Add it while your neural link is fresh.
                    </p>
                    <Button asChild variant="default" className="mt-6 w-full rounded-full text-sm h-14">
                      <Link href="/reflect">Write Reflection</Link>
                    </Button>
                  </Card>

                  <Card className="glass-morphism border-white/10 bg-transparent p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Secure status</p>
                    <h3 className="mt-2 text-2xl font-headline font-semibold text-foreground dark:text-white">E2EE health</h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      Your archive stays end-to-end encrypted from capture through storage. All data decrypts only on your device.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                      <ShieldCheck className="w-4 h-4" /> Active
                    </div>
                  </Card>
                </div>
              </section>

              <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                <Card className="glass-morphism border-white/10 bg-transparent p-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Personality vectors</p>
                        <h2 className="mt-2 text-2xl font-headline font-semibold text-foreground dark:text-white">Your current state</h2>
                      </div>
                      <Badge className="bg-accent/20 text-accent border-none">Adaptive</Badge>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Resilience", val: derivedStats.resilience, color: "bg-primary", icon: Globe },
                        { label: "Empathy", val: derivedStats.empathy, color: "bg-accent", icon: Heart },
                        { label: "Clarity", val: derivedStats.clarity, color: "bg-white", icon: Brain },
                      ].map((s, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
                            <span className="flex items-center gap-2"><s.icon className="w-4 h-4" /> {s.label}</span>
                            <span>{s.val}%</span>
                          </div>
                          <Progress value={s.val} className="h-2 rounded-full bg-white/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="glass-morphism border-white/10 bg-transparent p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Quick actions</p>
                  <div className="mt-5 grid gap-3">
                    {[
                      { label: "Capture reflection", href: "/reflect" },
                      { label: "Analyze dreams", href: "/dreams" },
                      { label: "Record vocal echo", href: "/vocal" },
                      { label: "Chat with future self", href: "/resonance" },
                    ].map((action) => (
                      <Button key={action.href} asChild variant="outline" className="w-full rounded-3xl py-4 text-sm font-semibold">
                        <Link href={action.href}>{action.label}</Link>
                      </Button>
                    ))}
                  </div>
                </Card>
              </section>

              <section className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Recent echoes</p>
                    <h2 className="mt-2 text-2xl font-headline font-semibold text-foreground dark:text-white">Latest synchronized entries</h2>
                  </div>
                  <Link href="/timeline" className="text-sm font-semibold text-primary hover:underline">
                    View full timeline
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {recentMemories.map((memory, index) => (
                    <Card key={memory.id || index} className="glass-morphism border-white/10 bg-transparent p-5">
                      <CardContent className="p-0 space-y-4">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                          {memory.type === 'dream' ? 'Dream' : memory.type === 'vocal' ? 'Vocal' : 'Reflection'}
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/90 dark:text-white/90 line-clamp-4">
                          {memory.content || 'Encrypted memory content unavailable.'}
                        </p>
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          <span>{memory.createdAt?.seconds ? new Date(memory.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}</span>
                          <span>{memory.type}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {recentMemories.length === 0 && (
                    <div className="col-span-full rounded-3xl border border-white/10 bg-background/80 p-8 text-center text-sm text-muted-foreground">
                      No recent memories yet. Start with your first reflection or dream capture.
                    </div>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/resonance">
                  <Card className="group glass-morphism border-white/10 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all cursor-pointer">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-headline text-lg font-semibold">Resonance</h4>
                        <p className="text-sm text-muted-foreground">Chat with future self</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/visualize">
                  <Card className="group glass-morphism border-white/10 bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-all cursor-pointer">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-headline text-lg font-semibold">Neural Cinema</h4>
                        <p className="text-sm text-muted-foreground">Turn memories into visions</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </section>
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
                    className="rounded-full glass-morphism border-white/10 relative group w-[160px] h-[160px] md:w-[200px] md:h-[200px] flex items-center justify-center overflow-hidden aspect-square"
                  >
                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all" />
                    <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-white/10 flex items-center justify-center aspect-square">
                      <Image 
                        src="/logo/logo.png" 
                        alt="Digital Ghost Logo" 
                        width={200}
                        height={200}
                        priority
                        className="object-cover w-full h-full rounded-full aspect-square"
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
                  <h1 className="font-headline text-5xl md:text-9xl tracking-tighter text-foreground dark:bg-gradient-to-b dark:from-white dark:to-white/40 dark:bg-clip-text dark:text-transparent font-bold">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-4xl mx-auto text-center">
                  {[
                    { title: "Private Vault", subtitle: "Encrypted at rest and in motion.", color: "from-primary to-transparent" },
                    { title: "Zero-knowledge", subtitle: "We never see your raw memories.", color: "from-accent to-transparent" },
                    { title: "Instant Sync", subtitle: "Your ghost updates in real time.", color: "from-white to-transparent" },
                  ].map((item, index) => (
                    <div key={index} className="glass-morphism border-white/10 p-5 rounded-3xl shadow-lg shadow-black/10">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">{item.title}</p>
                      <p className="text-sm leading-6 text-foreground">{item.subtitle}</p>
                    </div>
                  ))}
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
                  <Globe className="w-[240px] h-[240px] md:w-[420px] md:h-[420px] text-primary animate-pulse" />
                </div>
              </div>
              <div className="relative z-10 text-center space-y-8 max-w-3xl px-6">
                <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold">The Universe is Information.</h2>
                <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
                  Don't let your frequencies fade into silence. Join the thousands who are mapping their consciousness onto the eternal grid.
                </p>
                <Button variant="outline" asChild size="lg" className="h-16 px-10 rounded-full border-white/20 glass-morphism hover:bg-white/10">
                  <Link href="/login">Explore the Grid</Link>
                </Button>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3 mt-12">
              {[
                { step: "Connect", detail: "One tap sign-in establishes your private neural session."},
                { step: "Capture", detail: "Save reflections, dreams, and voice echoes that matter."},
                { step: "Evolve", detail: "See your digital ghost learn and grow with each memory."},
              ].map((item, index) => (
                <div key={index} className="glass-morphism border-white/10 p-6 rounded-3xl shadow-xl shadow-black/10">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-4">Step {index + 1}</p>
                  <h3 className="font-headline text-xl font-semibold mb-2 text-white">{item.step}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>

      {/* Privacy & E2EE Disclosure Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-md glass-morphism border-primary/20 bg-background/95 backdrop-blur-2xl text-foreground dark:text-white">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="font-headline text-2xl font-bold text-center">Neural Privacy Protocols</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-light text-base leading-relaxed">
              Before we synchronize your consciousness, you should know:
              <br /><br />
              <span className="text-foreground font-medium">Your data is End-to-End Encrypted.</span> 
              <br />
              Every memory, dream, and vocal echo is unreadable to anyone—including us—until it reaches your device. Your digital ghost is yours alone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
              <Checkbox 
                id="dont-show-again" 
                checked={dontShowAgain} 
                onCheckedChange={(checked) => setDontShowAgain(!!checked)}
                className="border-primary data-[state=checked]:bg-primary"
              />
              <Label htmlFor="dont-show-again" className="text-xs text-muted-foreground cursor-pointer select-none">
                I understand. Don't show this notification again.
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-2 text-center">
                <Lock className="w-5 h-5 text-primary/60" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary/80">Zero Trust</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-2 text-center">
                <Shield className="w-5 h-5 text-accent/60" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent/80">E2EE Active</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={dismissPrivacy} className="w-full h-12 rounded-full font-headline tracking-widest uppercase text-sm group relative overflow-hidden">
              <span className="relative z-10">Enter Neural Link</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="relative py-12 text-center text-muted-foreground text-[10px] font-bold tracking-[0.5em] uppercase border-t border-white/5">
        <Sparkles className="w-4 h-4 inline-block mr-2 text-primary animate-pulse" />
        Neural Resilience Protocol Active • © 2024 Digital Ghost
      </footer>
    </main>
  );
}
