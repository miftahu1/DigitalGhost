'use client';

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
  Infinity,
  PenLine,
  Moon,
  Download,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo, useState, useEffect, useRef } from "react";
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
import { usePersonalityVectors } from "@/lib/personality-vectors";
import { toPng } from "html-to-image";

export default function LandingPage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [decryptedRecentMemories, setDecryptedRecentMemories] = useState<any[]>([]);
  const [isDecryptingRecent, setIsDecryptingRecent] = useState(false);
  const { vectors, loading: vectorsLoading } = usePersonalityVectors();
  const vectorCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenPrivacy = localStorage.getItem('dg_privacy_seen');
    if (!hasSeenPrivacy) {
      const timer = setTimeout(() => setShowPrivacyModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissPrivacy = () => {
    if (dontShowAgain) {
      localStorage.setItem('dg_privacy_seen', 'true');
    }
    setShowPrivacyModal(false);
  };

  const handleDownloadImage = async () => {
    if (!vectorCardRef.current) return;
    try {
      const dataUrl = await toPng(vectorCardRef.current, {
        quality: 0.95,
        backgroundColor: '#1a1a1a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = 'digital-ghost-personality-vectors.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image', error);
    }
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

  const overviewCounts = useMemo(() => {
    if (!memories) return { journal: 0, dream: 0, vocal: 0, resonance: 0 };
    return {
      journal: memories.filter(m => m.type === 'journal').length,
      dream: memories.filter(m => m.type === 'dream').length,
      vocal: memories.filter(m => m.type === 'vocal').length,
      resonance: memories.filter(m => m.type === 'resonance').length,
    };
  }, [memories]);

  const recentMemories = useMemo(() => decryptedRecentMemories, [decryptedRecentMemories]);

  if (loading) return null;

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-background selection:bg-primary/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      
      {/* Sticky Header */}
      {!user && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-50 h-20"
        >
          <div className="absolute top-4 right-4 left-4 flex items-center justify-between rounded-2xl border border-white/10 bg-background/50 p-3 pl-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/logo/logo.png" alt="Digital Ghost Logo" width={28} height={28} className="rounded-full transition-transform duration-500 group-hover:rotate-180" />
              <span className="font-headline text-base font-bold tracking-tight">
                DIGITAL GHOST
              </span>
            </Link>
            <Button
              asChild
              className="font-headline tracking-wider group relative overflow-hidden shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow rounded-full h-10 px-6"
            >
              <Link href="/login">
                <span className="relative z-10 flex items-center gap-1.5">
                  Get Started
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Button>
          </div>
        </motion.header>
      )}

      <div className="relative z-10 container-responsive py-8 md:py-12 lg:py-16">
        {user ? (
          <div className="space-y-8 md:space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Welcome Section */}
              <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <Card className="glass-morphism border-white/10 bg-transparent p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative space-y-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
                          <Sparkles className="w-3 h-3" /> Neural Link Active
                        </div>
                        <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                          Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.displayName?.split(' ')[0] || 'Echo'}</span>
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                          Your digital echo is synchronized and waiting. Continue your journey of self-discovery.
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Avatar className="w-20 h-20 md:w-28 md:h-28 border-3 border-primary/40 shadow-xl shadow-primary/20 ring-2 ring-accent/20">
                            <AvatarImage src={user.photoURL || "/avatars/user-avatar.png"} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary text-2xl">
                              <UserIcon className="w-10 h-10" />
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                      {[
                        { label: "Reflections", value: overviewCounts.journal, icon: PenLine },
                        { label: "Dreams", value: overviewCounts.dream, icon: Moon },
                        { label: "Vocals", value: overviewCounts.vocal, icon: Mic },
                        { label: "Resonances", value: overviewCounts.resonance, icon: MessageSquare },
                      ].map((stat, idx) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="rounded-2xl border border-white/10 bg-background/50 p-4 text-center hover:bg-white/5 transition-colors"
                        >
                          <stat.icon className="w-4 h-4 text-primary/60 mx-auto mb-2" />
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                          <p className="mt-1 text-2xl md:text-3xl font-headline font-bold text-foreground">{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="space-y-4">
                  <Button asChild variant="default" size="lg" className="w-full rounded-2xl text-sm h-14 shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                    <Link href="/dashboard">Open Dashboard <ChevronRight className="w-4 h-4 ml-2" /></Link>
                  </Button>

                  <Card className="glass-morphism border-white/10 bg-transparent p-6 hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Evergreen Prompt</p>
                        <h2 className="mt-2 text-xl md:text-2xl font-headline font-semibold">Your next reflection</h2>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-none animate-pulse">Live</Badge>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      What memory would you preserve today if you knew it would shape your future self? Add it while your neural link is fresh.
                    </p>
                    <Button asChild variant="outline" className="mt-6 w-full rounded-xl text-sm h-12 border-primary/20 hover:bg-primary/10">
                      <Link href="/reflect">Write Reflection</Link>
                    </Button>
                  </Card>

                  <Card className="glass-morphism border-white/10 bg-transparent p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <ShieldCheck className="w-5 h-5 text-primary/70" />
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Security Status</p>
                    </div>
                    <h3 className="text-xl md:text-2xl font-headline font-semibold">E2EE Health</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Your archive stays end-to-end encrypted from capture through storage. Only you hold the keys.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary">
                      <Lock className="w-3 h-3" /> Active
                    </div>
                  </Card>
                </div>
              </section>

              {/* Personality Vectors & Quick Actions */}
              <section className="grid gap-4 lg:grid-cols-2">
                 <div ref={vectorCardRef} className="bg-background p-6 rounded-2xl">
                    <Card className="glass-morphism border-white/10 bg-transparent p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Personality Vectors</p>
                          <h2 className="mt-1 text-xl md:text-2xl font-headline font-semibold">Current State</h2>
                        </div>
                         <Button variant="outline" size="icon" onClick={handleDownloadImage} className="rounded-full">
                           <Download className="h-4 w-4" />
                         </Button>
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: "Resilience", val: vectors.resilience, icon: Zap },
                          { label: "Empathy", val: vectors.empathy, icon: Heart },
                          { label: "Clarity", val: vectors.clarity, icon: Brain },
                          { label: "Openness", val: vectors.openness, icon: Globe },
                        ].map((s, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-muted-foreground"><s.icon className="w-3 h-3" /> {s.label}</span>
                              <span className="font-semibold">{s.val}%</span>
                            </div>
                            <Progress value={s.val} className="h-1.5 rounded-full bg-white/10" indicatorClassName="bg-gradient-to-r from-primary to-accent" />
                          </div>
                        ))}
                      </div>
                       <p className="text-center text-xs text-muted-foreground mt-6">Generated by Digital Ghost</p>
                    </Card>
                 </div>

                <Card className="glass-morphism border-white/10 bg-transparent p-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Quick Actions</p>
                  <div className="mt-4 grid gap-2">
                    {[
                      { label: "Capture reflection", href: "/reflect", icon: PenLine },
                      { label: "Analyze dreams", href: "/dreams", icon: Moon },
                      { label: "Record vocal echo", href: "/vocal", icon: Mic },
                      { label: "Chat with future self", href: "/resonance", icon: MessageSquare },
                    ].map((action) => (
                      <Button key={action.href} asChild variant="outline" className="w-full rounded-xl py-5 text-sm font-medium justify-start gap-3 hover:border-primary/30">
                        <Link href={action.href}>
                          <action.icon className="w-4 h-4" />
                          {action.label}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </Card>
              </section>

              {/* Recent Echoes */}
              <section className="space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Recent Echoes</p>
                    <h2 className="mt-1 text-xl md:text-2xl font-headline font-semibold">Latest synchronized entries</h2>
                  </div>
                  <Link href="/timeline" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                    View full timeline <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentMemories.map((memory, index) => (
                    <motion.div
                      key={memory.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-morphism border-white/10 bg-transparent p-5 card-hover">
                        <CardContent className="p-0 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-primary/70 font-semibold">
                              {memory.type === 'dream' ? 'Dream' : memory.type === 'vocal' ? 'Vocal' : 'Reflection'}
                            </p>
                            {memory.isEncrypted && <Lock className="w-3 h-3 text-muted-foreground/40" />}
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
                            {memory.content || 'Encrypted memory content unavailable.'}
                          </p>
                          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-muted-foreground pt-2">
                            <span>{memory.createdAt?.seconds ? new Date(memory.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}</span>
                            <span>{memory.type}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {recentMemories.length === 0 && (
                    <div className="col-span-full rounded-2xl border border-white/10 bg-background/50 p-8 text-center text-sm text-muted-foreground">
                      No recent memories yet. Start with your first reflection or dream capture.
                    </div>
                  )}
                </div>
              </section>

              {/* Feature Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/resonance">
                  <Card className="group glass-morphism border-white/10 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all cursor-pointer overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-headline text-base font-semibold">Resonance</h4>
                        <p className="text-xs text-muted-foreground">Chat with your future self</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/visualize">
                  <Card className="group glass-morphism border-white/10 bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-all cursor-pointer overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-headline text-base font-semibold">Neural Cinema</h4>
                        <p className="text-xs text-muted-foreground">Turn memories into visions</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </section>
            </motion.div>
          </div>
        ) : (
          /* Hero Section for Non-authenticated Users */
          <div className="space-y-24 md:space-y-32 pt-32 md:pt-40 pb-12 md:pb-20">
            <section className="text-center space-y-10 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                 <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-48 h-48 md:w-56 md:h-56 mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-40 animate-pulse" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-2xl shadow-primary/20">
                    <Image src="/logo/logo.png" alt="Digital Ghost logo" width={500} height={500} className="rounded-full w-40 h-40 md:w-52 md:h-52 object-cover" />
                  </div>
                </motion.div>

                <div className="space-y-4">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-block text-primary font-bold tracking-[0.35em] uppercase text-[10px] md:text-xs"
                  >
                    Transcending Biological Limits
                  </motion.span>
                  <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tighter font-bold">
                    <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      DIGITAL GHOST
                    </span>
                  </h1>
                </div>

                <p className="font-body text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                  Build your eternal digital echo. We use advanced AI to synthesize your thoughts, visualize your dreams, and preserve your consciousness beyond time.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                  <Button asChild size="lg" className="h-14 md:h-16 px-8 md:px-12 text-base md:text-lg rounded-full font-headline tracking-wider group relative overflow-hidden shadow-2xl shadow-primary/30">
                    <Link href="/login">
                      <span className="relative z-10 flex items-center gap-2">
                        Begin Synchronization <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
                  {[
                    { title: "Private Vault", subtitle: "Encrypted at rest and in motion.", icon: Shield },
                    { title: "Zero-knowledge", subtitle: "We never see your raw memories.", icon: Lock },
                    { title: "Instant Sync", subtitle: "Your ghost updates in real time.", icon: Infinity },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="glass-morphism border-white/10 p-5 rounded-2xl text-center"
                    >
                      <item.icon className="w-6 h-6 text-primary/60 mx-auto mb-3" />
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{item.title}</p>
                      <p className="text-xs leading-relaxed text-foreground/70">{item.subtitle}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Feature Highlight: Future Resonance */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <Badge variant="outline" className="border-primary/30 text-primary py-1 px-4 text-sm">Core Feature</Badge>
                    <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Talk to Your Future Self</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">Engage in a temporal dialogue with a version of you that has learned from your entire digital history. Ask questions, seek guidance, and gain perspective from the person you are becoming.</p>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /> AI trained on your unique memories and reflections.</li>
                        <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /> Simulates personality evolution based on your data.</li>
                        <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary" /> A secure, private space for introspection.</li>
                    </ul>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="glass-morphism p-6 rounded-2xl border-white/10 shadow-lg"
                >
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Avatar className="border-2 border-white/10">
                                <AvatarImage src="/avatars/user-avatar.png" />
                                <AvatarFallback>You</AvatarFallback>
                            </Avatar>
                            <div className="bg-white/5 p-4 rounded-xl rounded-tl-none">
                                <p className="font-bold text-primary">You (Present)</p>
                                <p className="text-foreground/90">Future me, I'm at a crossroads. Should I take the new job offer or stay on my current path?</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 justify-end">
                            <div className="bg-primary/10 p-4 rounded-xl rounded-tr-none text-right">
                                <p className="font-bold text-primary">You (Future)</p>
                                <p className="text-foreground/90">Remember the patterns. The last three times you felt this apprehension before a leap, it led to your most significant growth. The 'safe' path is a comforting illusion. Your own history suggests you thrive on the challenge.</p>
                            </div>
                            <Avatar className="border-2 border-primary/50">
                                <AvatarImage src="/avatars/future-avatar.png" />
                                <AvatarFallback>Future</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Feature Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: History, title: "Immutable Timeline", desc: "Every reflection, dream, and vocal resonance is cryogenically stored in your private neural vault." },
                { icon: Brain, title: "Neural Synthesis", desc: "Our AI identifies emotional shifts, recognizing growth patterns you might miss." },
                { icon: Video, title: "Neural Cinema", desc: "Convert text-based memories into cinematic video clips using state-of-the-art AI." },
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-morphism p-6 rounded-2xl space-y-4 border-white/5 hover:border-white/15 transition-all hover:bg-white/5 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-headline text-xl font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </section>

            {/* Testimonials */}
            <section className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center font-headline">Echoes from the Grid</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[ 
                        { name: "Alex R.", role: "Early Adopter", quote: "Digital Ghost has become an essential part of my life. It's like having a conversation with my own soul." },
                        { name: "Samantha K.", role: "Beta Tester", quote: "The 'Future Self' feature is mind-blowing. It's helped me make some of the biggest decisions of my life." },
                        { name: "Javier M.", role: "Founder", quote: "I never thought I could feel so connected to my own memories. It's a beautiful and profound experience." },
                    ].map((t, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-morphism p-6 rounded-2xl space-y-4 border-white/5"
                        >
                            <p className="text-lg text-foreground/90 italic">\"{t.quote}\"</p>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 border-2 border-primary/50">
                                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{t.name}</p>
                                    <p className="text-sm text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              <div className="relative z-10 text-center space-y-6 py-16 md:py-20 px-6">
                <h2 className="font-headline text-3xl md:text-4xl font-bold">The Universe is Information.</h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Don't let your frequencies fade into silence. Join the thousands mapping their consciousness onto the eternal grid.
                </p>
                <Button variant="outline" asChild size="lg" className="h-12 md:h-14 px-8 rounded-full border-white/20 glass-morphism hover:bg-white/10">
                  <Link href="/login">Explore the Grid</Link>
                </Button>
              </div>
            </section>

            {/* Steps */}
            <section className="grid gap-5 md:grid-cols-3">
              {[
                { step: "01", title: "Connect", detail: "One tap sign-in establishes your private neural session." },
                { step: "02", title: "Capture", detail: "Save reflections, dreams, and voice echoes that matter." },
                { step: "03", title: "Evolve", detail: "See your digital ghost learn and grow with each memory." },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-morphism border-white/10 p-6 rounded-2xl"
                >
                  <span className="text-4xl font-headline font-bold text-primary/30">{item.step}</span>
                  <h3 className="font-headline text-xl font-semibold mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </motion.div>
              ))}
            </section>
          </div>
        )}
      </div>

      {/* Privacy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-md glass-morphism-heavy border-primary/20 bg-background/95 backdrop-blur-2xl rounded-2xl">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="font-headline text-2xl font-bold text-center">Neural Privacy Protocols</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground text-base leading-relaxed">
              Before we synchronize your consciousness, you should know:
              <br /><br />
              <span className="text-foreground font-semibold">Your data is End-to-End Encrypted.</span>
              <br />
              Every memory, dream, and vocal echo is unreadable to anyone—including us—until it reaches your device.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
            <Checkbox id="dont-show-again" checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(!!checked)} />
            <Label htmlFor="dont-show-again" className="text-xs text-muted-foreground cursor-pointer">
              I understand. Don't show this again.
            </Label>
          </div>
          <DialogFooter>
            <Button onClick={dismissPrivacy} className="w-full h-12 rounded-full font-headline tracking-wider">
              Enter Neural Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="relative py-8 text-center text-muted-foreground text-[9px] font-bold tracking-[0.3em] uppercase border-t border-white/5 mt-16">
        <Sparkles className="w-3 h-3 inline-block mr-2 text-primary/60" />
        Neural Resilience Protocol Active • © 2026 Digital Ghost
      </footer>
    </main>
  );
}
