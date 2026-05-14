"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Sparkles, Wand2, Loader2, AlertCircle, PlayCircle } from "lucide-react";
import { visualizeMemory } from "@/ai/flows/memory-visualizer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function NeuralCinemaPage() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setVideoUrl(null);

    try {
      const result = await visualizeMemory({ memoryText: prompt });
      setVideoUrl(result.videoUrl);

      // Archive the cinematic visualization
      if (user && db) {
        await addDoc(collection(db, "users", user.uid, "memories"), {
          content: `Cinematic Visualization: ${prompt}`,
          type: "cinema",
          createdAt: serverTimestamp(),
          userId: user.uid,
          mood: "cinematic",
          analysis: { videoUrl: result.videoUrl }
        });
      }

      toast({ title: "Neural Cinema Rendered", description: "Your memory has been visualized." });
    } catch (error: any) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "Generation Failed", 
        description: error.message || "The AI model is currently busy. Please try again in a moment." 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight flex items-center gap-3">
            Neural Cinema <Video className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-muted-foreground font-light text-lg">Convert your memories into 5-second cinematic dreamscapes.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <Card className="glass-morphism border-white/5 bg-transparent p-1">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-headline text-lg font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Scene Description
              </h3>
              <Textarea
                placeholder="Describe a memory or a dream... (e.g., A rainy night in a neon city, walking through a tunnel of light)"
                className="min-h-[200px] bg-white/5 border-white/10 rounded-2xl text-lg font-light leading-relaxed"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button 
                onClick={handleGenerate} 
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-14 rounded-full font-headline tracking-widest text-lg group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isGenerating ? "Rendering Reality..." : "Visualize Memory"}
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>

          <Alert className="glass-morphism border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-bold">Heads Up</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground font-light">
              Video generation is an intensive process and can take up to 60 seconds. Veo models have strict rate limits; if it fails, please wait a few seconds before retrying.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="glass-morphism border-white/5 bg-transparent aspect-video flex items-center justify-center relative overflow-hidden group">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="font-headline text-xs uppercase tracking-[0.3em] text-primary animate-pulse">Processing Neural Buffers...</p>
                </motion.div>
              ) : videoUrl ? (
                <motion.video 
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-light italic">Your visual echo will appear here.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
}
