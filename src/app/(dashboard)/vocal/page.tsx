
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Play, Trash2, Volume2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function VocalEchoPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([
    { id: "1", date: "Oct 24, 2023", duration: "0:45", title: "Morning Musings" },
    { id: "2", date: "Oct 20, 2023", duration: "1:22", title: "Rainy Day Thoughts" },
  ]);
  const { toast } = useToast();

  const toggleRecording = () => {
    if (isRecording) {
      toast({ title: "Recording Saved", description: "Neural frequency archived." });
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Vocal Echo Archive</h1>
        <p className="text-muted-foreground font-light text-lg mx-auto max-w-xl">
          Capture the raw frequency of your voice. The sound of who you are in this exact moment.
        </p>
      </header>

      <div className="flex justify-center">
        <div className="relative group">
          {/* Animated Glow Rings for Recording */}
          {isRecording && (
            <>
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
              />
              <motion.div 
                animate={{ scale: [1, 2], opacity: [0.2, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
              />
            </>
          )}

          <Button
            onClick={toggleRecording}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 border-4 z-10 relative transition-all duration-500 ${
              isRecording 
                ? "bg-destructive border-destructive/50 hover:bg-destructive/80" 
                : "bg-primary border-primary/20 hover:scale-105"
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-10 h-10 fill-current" />
                <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Record</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {isRecording && (
        <div className="flex justify-center items-center gap-1 h-20">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [10, 20 + Math.random() * 60, 10] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
              className="w-1 bg-primary rounded-full opacity-60"
            />
          ))}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="font-headline text-xl font-medium tracking-wide flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-primary" />
          Recent Echoes
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {recordings.map((rec) => (
            <Card key={rec.id} className="glass-morphism border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-primary fill-current" />
                  </div>
                  <div>
                    <h4 className="font-headline font-medium text-lg">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-light">
                      {rec.date} • {rec.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
