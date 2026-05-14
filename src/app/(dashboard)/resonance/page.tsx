
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, Send, Bot, User, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { futureSelfChat } from "@/ai/flows/future-self-chat-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export const maxDuration = 60;

export default function ResonancePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome, younger self. I am the culmination of your growth, existing T+10 years from your now. What reflections shall we share today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const memoriesQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "memories"),
      orderBy("createdAt", "desc"),
      limit(15)
    );
  }, [db, user?.uid]);

  const { data: recentMemories } = useCollection(memoriesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !user || !db) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const memoryContext = recentMemories && recentMemories.length > 0
        ? recentMemories
            .filter(m => m.type !== 'vocal' || !m.content.includes('Dialogue with Future Self'))
            .map(m => `[Type: ${m.type}] ${m.content}`)
            .join("\n")
        : "";

      const response = await futureSelfChat({
        userMessage: input,
        memoryContext: memoryContext,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, assistantMsg]);

      // Archive the interaction
      const interactionRef = doc(collection(db, 'users', user.uid, 'memories'));
      await setDoc(interactionRef, {
        content: `Dialogue with Future Self\nYounger Me: ${input}\nFuture Me: ${response.response}`,
        type: 'journal',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: 'reflective',
        analysis: {
          isAIGenerated: true,
          temporalShift: '+10 Years'
        }
      });

    } catch (error: any) {
      console.error("AI resonance error:", error);
      toast({
        variant: "destructive",
        title: "Link Severed",
        description: "The temporal link was disrupted. Please check your GOOGLE_GENAI_API_KEY.",
      });
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setInput(userMsg.content);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col space-y-4">
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 glass rounded-full hover:bg-white/5 transition-colors group">
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <div>
            <h1 className="font-headline text-2xl font-bold text-white flex items-center gap-2">
              Resonance <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Simulation: Future Self (T+10Y)</span>
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-morphism border-white/5 bg-white/5">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span className="text-[8px] uppercase tracking-widest font-bold text-white/60">Neural Link: Encrypted</span>
        </div>
      </header>

      <Card className="flex-1 glass-morphism border-white/5 bg-transparent flex flex-col overflow-hidden relative rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scroll-smooth custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl ${
                    msg.role === "user" ? "bg-accent/10 border border-accent/20" : "bg-primary/10 border border-primary/20"
                  }`}>
                    {msg.role === "user" ? <User className="w-5 h-5 text-accent" /> : <Bot className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="space-y-1.5">
                    <div className={`p-5 rounded-2xl font-light text-base md:text-lg leading-relaxed shadow-lg ${
                      msg.role === "user" 
                        ? "bg-accent/10 border border-accent/20 text-white rounded-tr-none" 
                        : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none backdrop-blur-md"
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[8px] uppercase tracking-widest font-bold text-muted-foreground ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.role === 'user' ? 'Biological Frequency' : 'Synthesized Perspective'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-1.5 p-4 rounded-full bg-white/5 border border-white/10">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 md:p-8 bg-black/20 backdrop-blur-xl border-t border-white/5">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center gap-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user ? "Send a message to your future..." : "Login to establish link..."}
              disabled={!user || isTyping}
              className="h-14 md:h-16 bg-white/5 border-white/10 rounded-2xl px-6 md:px-8 focus:ring-primary/40 focus:border-primary/40 text-white text-base md:text-lg placeholder:text-white/20"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping || !user}
              className="h-12 w-12 md:h-14 md:w-14 rounded-xl absolute right-1.5 md:right-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </form>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Status: Stable</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-2.5 h-2.5 text-accent" />
              <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Neural Load: 12%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
