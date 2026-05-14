"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="z-10 text-center px-4"
      >
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              filter: ["drop-shadow(0 0 5px rgba(163, 140, 244, 0.4))", "drop-shadow(0 0 20px rgba(163, 140, 244, 0.8))", "drop-shadow(0 0 5px rgba(163, 140, 244, 0.4))"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="p-6 rounded-3xl glass bg-primary/5 border-primary/20"
          >
            <Image 
              src="/logo/logo.png" 
              alt="Digital Ghost Logo" 
              width={64} 
              height={64} 
              priority
              className="object-contain"
            />
          </motion.div>
        </div>

        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          DIGITAL GHOST
        </h1>

        <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Your life is a story. Archive your thoughts, dreams, and reflections 
          to build a neural echo that lives forever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full font-headline tracking-wide group relative overflow-hidden">
            <Link href="/dashboard">
              <span className="relative z-10 flex items-center gap-2">
                Begin Reflection <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
          
          <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full font-headline tracking-wide glass-morphism border-white/5 hover:bg-white/10">
            Learn More
          </Button>
        </div>
      </motion.div>

      <footer className="absolute bottom-8 w-full text-center text-muted-foreground text-xs font-light tracking-[0.2em] uppercase">
        <Sparkles className="w-3 h-3 inline-block mr-2 text-primary animate-pulse" />
        Neural Resonance Active
      </footer>
    </main>
  );
}