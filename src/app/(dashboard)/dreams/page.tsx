"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sparkles, Brain, Search, Info } from "lucide-react";
import { interpretDream } from "@/ai/flows/dream-interpreter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function DreamsPage() {
  const [dream, setDream] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const handleAnalyze = async () => {
    if (!dream.trim() || !user || !db) return;
    setIsAnalyzing(true);
    try {
      const result = await interpretDream({ dreamEntry: dream });
      setAnalysis(result);
      
      // Generate a clean reference for the new memory
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

      toast({ title: "Interpretation Complete", description: "Subconscious patterns archived in the vault." });
    } catch (error) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "The void was silent." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight flex items-center gap-3">
            Oneirology Vault <Moon className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-muted-foreground font-light text-lg">Decode the messages of your sleeping mind.</p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary animate-pulse">
          Neural Pathway Active
        </Badge>
      </header>

      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-primary/30 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition duration-1000"></div>
          <Textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="I was flying over a city made of glass..."
            className="min-h-[250px] text-lg font-light leading-relaxed bg-card/40 glass-morphism border-white/10 p-8 rounded-2xl focus:ring-accent/40"
          />
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={!dream.trim() || isAnalyzing || !user}
          className="w-full h-14 rounded-full font-headline tracking-widest text-lg group relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isAnalyzing ? "Interpreting Subconscious..." : "Analyze Dream Patterns"}
            <Brain className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="glass-morphism border-white/10 bg-white/5 md:col-span-2">
            <CardContent className="p-8 space-y-4">
              <h3 className="font-headline text-xl font-medium flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Interpretation
              </h3>
              <p className="text-foreground/90 font-light leading-relaxed text-lg italic">
                "{analysis.interpretation}"
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-white/5 bg-white/5">
            <CardContent className="p-8 space-y-4">
              <h3 className="font-headline text-lg font-medium flex items-center gap-2">
                <Search className="w-5 h-5 text-accent" />
                Recurring Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-white/5 hover:bg-white/10 text-white rounded-full px-4 py-1 font-light border-white/10">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-white/5 bg-white/5">
            <CardContent className="p-8 space-y-4">
              <h3 className="font-headline text-lg font-medium flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Subconscious Insights
              </h3>
              <ul className="space-y-3">
                {analysis.subconsciousPatterns.map((pattern: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground font-light">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {pattern}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
