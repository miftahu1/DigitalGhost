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

      <div className="relative z-10 container-responsive py-8 md:py-12 lg:py-16">
        {user ? (
          <div>...</div>
        ) : (
          /* Hero Section for Non-authenticated Users */
          <div className="space-y-24 md:space-y-32 py-12 md:py-20">
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
                    <Image src="/logo/logo.png" alt="Digital Ghost logo" width={200} height={200} className="w-40 h-40 md:w-52 md:h-52 object-cover" />
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

       {/* Sticky Header */}
       <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <header className="container-responsive flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo/logo.png" alt="Digital Ghost Logo" width={40} height={40} />
                <span className="font-headline text-lg font-bold">DIGITAL GHOST</span>
            </Link>
            <Button asChild size="sm" className="rounded-full font-headline tracking-wider">
                <Link href="/login">Get Started</Link>
            </Button>
        </header>
    </motion.div>


      {/* Privacy Modal & Footer... */}
    </main>
  );
}
