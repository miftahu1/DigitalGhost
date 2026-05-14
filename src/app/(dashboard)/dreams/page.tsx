
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sparkles, Brain, Search, Info, Loader2, History, Eye, X } from "lucide-react";
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

export default function DreamsPage() {
  const [dream, setDream] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDream, setSelectedDream] = useState<any>(null);
  
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

  const handleAnalyze = async () => {
    if (!dream.trim() || !user?.uid || !db || isAnalyzing) {
      if (!user?.uid) toast({ variant: "destructive", title: "Error", description: "Login required." });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await interpretDream({ dreamEntry: dream });
      
      const memoriesRef = collection(db, 'users', user.uid, 'memories');
      const dreamRef = doc(memoriesRef);
      
      await setDoc(dreamRef, {
        content: dream,
        type: 'dream',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: 'subconscious',
        analysis: {
          interpretation: result.interpretation,
          themes: result.themes,
          patterns: result.subconsciousPatterns
        }
      });

      setAnalysis(result);
      setDream("");
      toast({ title: "Interpretation Complete", description: "Subconscious patterns archived in the vault." });
    } catch (error: any) {
      console.error("Dream Analysis Error:", error);
      toast({ 
        variant: "destructive", 
        title: "Analysis Failed", 
        description: error.message?.includes("API key") ? "AI Engine requires a valid key." : "Neural connection failed." 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-white">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight flex items-center gap-3">
            Oneirology Vault <Moon className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-muted-foreground font-light text-lg">Decode the messages of your sleeping mind.</p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary animate-pulse py-1 px-4 rounded-full">
          Neural Pathway Active
        </Badge>
      </header>

      <section className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-primary/30 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition duration-1000"></div>
          <Textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="I was flying over a city made of glass..."
            disabled={isAnalyzing}
            className="min-h-[200px] text-lg font-light leading-relaxed bg-card/40 glass-morphism border-white/10 p-8 rounded-2xl focus:ring-accent/40 text-white placeholder:text-white/20"
          />
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={!dream.trim() || isAnalyzing || !user?.uid}
          className="w-full h-14 rounded-full font-headline tracking-widest text-lg group relative overflow-hidden shadow-lg shadow-accent/20"
        >
          <span className="relative z-10 flex items-center gap-2 text-white">
            {isAnalyzing ? "Interpreting Subconscious..." : "Analyze Dream Patterns"}
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </section>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-headline text-xl font-bold tracking-widest uppercase">Latest Extraction</h2>
          </div>
          <Card className="glass-morphism border-primary/20 bg-primary/5">
            <CardContent className="p-8 space-y-6">
              <p className="text-xl font-light leading-relaxed italic text-white/90">
                "{analysis.interpretation}"
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-white/5 text-white border-white/10 px-4 py-1">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <section className="space-y-8 pt-10">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-muted-foreground" />
          <h2 className="font-headline text-2xl font-medium tracking-tight text-white">Dream Archive</h2>
        </div>

        {dreamsLoading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Synchronizing with subconscious buffers...</p>
          </div>
        ) : previousDreams && previousDreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousDreams.map((item: any) => (
              <motion.div key={item.id} whileHover={{ y: -5 }}>
                <Card className="glass-morphism border-white/5 bg-white/5 hover:bg-white/10 transition-all h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                          {item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), "MMM d, yyyy") : "Fragment"}
                        </span>
                        <Moon className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <p className="line-clamp-3 text-sm font-light text-white/70 italic leading-relaxed">
                        "{item.content}"
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDream(item)}
                      className="w-full rounded-full border-white/10 hover:bg-white/5 text-[10px] uppercase tracking-widest font-bold"
                    >
                      <Eye className="w-3 h-3 mr-2" /> Open Archive
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-morphism rounded-3xl border-white/5 text-muted-foreground italic">
            No subconscious extractions found in the vault.
          </div>
        )}
      </section>

      <Dialog open={!!selectedDream} onOpenChange={() => setSelectedDream(null)}>
        <DialogContent className="max-w-3xl glass-morphism border-white/10 bg-card/90 backdrop-blur-3xl text-white">
          <DialogHeader>
            <div className="flex justify-between items-center pr-8">
              <div className="space-y-1">
                <DialogTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                  Dream Fragment <Sparkles className="w-5 h-5 text-primary" />
                </DialogTitle>
                <DialogDescription className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                  Extracted: {selectedDream?.createdAt?.seconds ? format(new Date(selectedDream.createdAt.seconds * 1000), "MMMM d, yyyy") : "Unknown Temporal Point"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-8 mt-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Raw Memory</h4>
              <p className="text-lg font-light leading-relaxed italic border-l-2 border-primary/20 pl-6 text-white/80">
                "{selectedDream?.content}"
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                <Brain className="w-3 h-3" /> AI Interpretation
              </h4>
              <p className="text-base font-light leading-relaxed text-white/90 bg-white/5 p-6 rounded-2xl border border-white/5">
                {selectedDream?.analysis?.interpretation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-accent font-bold flex items-center gap-2">
                  <Search className="w-3 h-3" /> Core Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDream?.analysis?.themes?.map((theme: string, i: number) => (
                    <Badge key={i} variant="outline" className="rounded-full bg-accent/10 border-accent/20 text-accent">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                  <Info className="w-3 h-3" /> Subconscious Insights
                </h4>
                <ul className="space-y-2">
                  {selectedDream?.analysis?.patterns?.map((pattern: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground font-light flex gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setSelectedDream(null)} variant="outline" className="rounded-full border-white/10 hover:bg-white/5">
              Close Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
