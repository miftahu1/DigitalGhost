"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sparkles, Brain, Search, Info, Loader2, History as HistoryIcon, Eye, Lock, ShieldCheck, ChevronRight } from "lucide-react";
import { interpretDream } from "@/ai/flows/dream-interpreter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { encryptData, decryptData } from "@/lib/encryption";

export default function DreamsPage() {
  const [dream, setDream] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDream, setSelectedDream] = useState<any>(null);
  const [decryptedDreams, setDecryptedDreams] = useState<any[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const dreamsQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, 'users', user.uid, 'memories'), where('type', '==', 'dream'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const { data: previousDreams, loading: dreamsLoading } = useCollection(dreamsQuery);

  useEffect(() => {
    async function processDreams() {
      if (!previousDreams || !user?.uid) return;
      setIsDecrypting(true);
      const decrypted = await Promise.all(
        previousDreams.map(async (d: any) => ({
          ...d,
          content: d.isEncrypted ? await decryptData(d.content, user.uid) : d.content
        }))
      );
      setDecryptedDreams(decrypted);
      setIsDecrypting(false);
    }
    processDreams();
  }, [previousDreams, user?.uid]);

  const handleAnalyze = async () => {
    if (!dream.trim() || !user?.uid || !db || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const result = await interpretDream({ dreamEntry: dream });
      const encryptedDream = await encryptData(dream, user.uid);
      const memoriesRef = collection(db, 'users', user.uid, 'memories');
      await setDoc(doc(memoriesRef), {
        content: encryptedDream,
        type: 'dream',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: 'subconscious',
        isEncrypted: true,
        analysis: { interpretation: result.interpretation, themes: result.themes, patterns: result.subconsciousPatterns }
      });
      setAnalysis(result);
      setDream("");
      toast({ title: "Subconscious Secured", description: "Encrypted mapping archived in the vault." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Neural connection failed." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
            Oneirology Vault <Moon className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">Securely decode the messages of your sleeping mind.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider">Client-Side E2EE</span>
        </div>
      </header>

      {/* Dream Input Section */}
      <section className="space-y-5">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition duration-1000"></div>
          <Textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="Describe your dream... it will be encrypted before it hits the database."
            disabled={isAnalyzing}
            className="min-h-[180px] text-base md:text-lg font-light bg-card/40 glass-morphism border-white/10 p-6 rounded-2xl text-foreground placeholder:text-muted-foreground/50 resize-none"
          />
        </div>
        
        <Button onClick={handleAnalyze} disabled={!dream.trim() || isAnalyzing} className="w-full h-12 md:h-14 rounded-xl font-headline tracking-wider text-base group relative overflow-hidden">
          <span className="relative z-10 flex items-center gap-2">
            {isAnalyzing ? "Securing Subconscious..." : "Analyze & Encrypt Dream"}
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          </span>
        </Button>
      </section>

      {/* Analysis Result */}
      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <h2 className="font-headline text-lg font-bold uppercase tracking-wider">Latest Decrypted Extraction</h2>
            </div>
            <Card className="glass-morphism border-primary/20 bg-primary/5">
              <CardContent className="p-6 space-y-4">
                <p className="text-lg md:text-xl font-light italic text-foreground/90">"{analysis.interpretation}"</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.themes.map((theme: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-white/5 border-white/10 px-3 py-1 text-xs">{theme}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dream Archive */}
      <section className="space-y-6 pt-4">
        <h2 className="font-headline text-xl font-medium flex items-center gap-3"><HistoryIcon className="w-5 h-5 text-muted-foreground" /> Secure Archive</h2>
        {(dreamsLoading || isDecrypting) ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Decrypting Subconscious Buffers...</p>
          </div>
        ) : decryptedDreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decryptedDreams.map((item: any) => (
              <motion.div key={item.id} whileHover={{ y: -4 }} className="cursor-pointer" onClick={() => setSelectedDream(item)}>
                <Card className="glass-morphism border-white/5 bg-white/5 hover:bg-white/10 transition-all h-full">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-primary">
                        {item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), "MMM d, yyyy") : "Fragment"}
                      </span>
                      <Lock className="w-3 h-3 text-primary/40" />
                    </div>
                    <p className="line-clamp-3 text-sm font-light text-foreground/70 italic">"{item.content}"</p>
                    <Button variant="ghost" size="sm" className="w-full rounded-xl text-[10px] uppercase font-bold tracking-wider gap-1">
                      <Eye className="w-3 h-3" /> Open Archive
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass-morphism rounded-2xl border-white/5 text-muted-foreground italic text-sm">No extractions found in the secure vault.</div>
        )}
      </section>

      {/* Dream Detail Dialog */}
      <Dialog open={!!selectedDream} onOpenChange={() => setSelectedDream(null)}>
        <DialogContent className="max-w-2xl glass-morphism-heavy border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl font-bold flex items-center gap-2">Secure Dream Fragment <ShieldCheck className="w-4 h-4 text-primary" /></DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              <h4 className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Decrypted Raw Memory</h4>
              <p className="text-base font-light border-l-2 border-primary/20 pl-5 text-foreground/80 italic">"{selectedDream?.content}"</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[9px] uppercase tracking-wider text-primary font-bold flex items-center gap-2"><Brain className="w-3 h-3" /> AI Interpretation</h4>
              <p className="text-sm font-light bg-white/5 p-5 rounded-xl border border-white/5">{selectedDream?.analysis?.interpretation}</p>
              {selectedDream?.analysis?.themes && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedDream.analysis.themes.map((t: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}