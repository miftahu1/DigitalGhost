
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sparkles, Brain, Search, Info, Loader2, History, Eye, Lock, ShieldCheck } from "lucide-react";
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
    return query(
      collection(db, 'users', user.uid, 'memories'),
      where('type', '==', 'dream'),
      orderBy('createdAt', 'desc')
    );
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
      
      // Encrypt before archiving
      const encryptedDream = await encryptData(dream, user.uid);
      
      const memoriesRef = collection(db, 'users', user.uid, 'memories');
      await setDoc(doc(memoriesRef), {
        content: encryptedDream,
        type: 'dream',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: 'subconscious',
        isEncrypted: true,
        analysis: {
          interpretation: result.interpretation,
          themes: result.themes,
          patterns: result.subconsciousPatterns
        }
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
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="flex justify-between items-end text-white">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight flex items-center gap-3">
            Oneirology Vault <Moon className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-muted-foreground font-light text-lg">Securely decode the messages of your sleeping mind.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Client-Side E2EE Active</span>
        </div>
      </header>

      <section className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-primary/30 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition duration-1000"></div>
          <Textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="Describe your dream... it will be encrypted before it hits the database."
            disabled={isAnalyzing}
            className="min-h-[200px] text-lg font-light bg-card/40 glass-morphism border-white/10 p-8 rounded-2xl text-white placeholder:text-white/20"
          />
        </div>
        
        <Button onClick={handleAnalyze} disabled={!dream.trim() || isAnalyzing} className="w-full h-14 rounded-full font-headline tracking-widest text-lg group overflow-hidden relative">
          <span className="relative z-10 flex items-center gap-2">
            {isAnalyzing ? "Securing Subconscious..." : "Analyze & Encrypt Dream"}
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </section>

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-headline text-xl font-bold uppercase tracking-widest">Latest Decrypted Extraction</h2>
          </div>
          <Card className="glass-morphism border-primary/20 bg-primary/5">
            <CardContent className="p-8 space-y-6">
              <p className="text-xl font-light italic text-white/90">"{analysis.interpretation}"</p>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-white/5 border-white/10 px-4 py-1">{theme}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <section className="space-y-8 pt-10">
        <h2 className="font-headline text-2xl font-medium tracking-tight text-white flex items-center gap-3"><History className="w-6 h-6 text-muted-foreground" /> Secure Archive</h2>
        {(dreamsLoading || isDecrypting) ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Synchronizing and Decrypting Subconscious Buffers...</p>
          </div>
        ) : decryptedDreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decryptedDreams.map((item: any) => (
              <motion.div key={item.id} whileHover={{ y: -5 }}>
                <Card className="glass-morphism border-white/5 bg-white/5 hover:bg-white/10 transition-all h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                          {item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), "MMM d, yyyy") : "Vault Fragment"}
                        </span>
                        {item.isEncrypted && <Lock className="w-3 h-3 text-primary/40" />}
                      </div>
                      <p className="line-clamp-3 text-sm font-light text-white/70 italic">"{item.content}"</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedDream(item)} className="w-full rounded-full border-white/10 hover:bg-white/5 text-[10px] uppercase font-bold tracking-widest">
                      <Eye className="w-3 h-3 mr-2" /> Open Archive
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-morphism rounded-3xl border-white/5 text-muted-foreground italic">No extractions found in the secure vault.</div>
        )}
      </section>

      <Dialog open={!!selectedDream} onOpenChange={() => setSelectedDream(null)}>
        <DialogContent className="max-w-3xl glass-morphism border-white/10 bg-card/90 backdrop-blur-3xl text-white">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl font-bold flex items-center gap-3">Secure Dream Fragment <ShieldCheck className="w-5 h-5 text-primary" /></DialogTitle>
          </DialogHeader>
          <div className="space-y-8 mt-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Decrypted Raw Memory</h4>
              <p className="text-lg font-light border-l-2 border-primary/20 pl-6 text-white/80 italic">"{selectedDream?.content}"</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-2"><Brain className="w-3 h-3" /> AI Interpretation</h4>
              <p className="text-base font-light bg-white/5 p-6 rounded-2xl border border-white/5">{selectedDream?.analysis?.interpretation}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
