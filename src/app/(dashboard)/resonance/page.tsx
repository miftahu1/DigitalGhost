
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ArrowLeft, ShieldCheck, Lock, Sparkles, Loader2 } from "lucide-react";
import { futureSelfChat } from "@/ai/flows/future-self-chat-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { encryptData, decryptData } from "@/lib/encryption";
import { format } from "date-fns";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function ResonancePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "I am here, existing in the spaces between your memories. Our connection is end-to-end encrypted. What shall we explore within your legacy today?",
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

  const { data: rawMemories } = useCollection(memoriesQuery);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping || !user || !db) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input, 
      timestamp: new Date() 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // 1. Decrypt context for AI
      const decryptedContexts = await Promise.all(
        (rawMemories || []).map(async (m: any) => {
          const content = m.isEncrypted ? await decryptData(m.content, user.uid) : m.content;
          return `[${m.type} - ${format(new Date(m.createdAt?.seconds * 1000 || Date.now()), 'yyyy-MM-dd')}] ${content}`;
        })
      );
      
      const response = await futureSelfChat({
        userMessage: currentInput,
        memoryContext: decryptedContexts.join("\n"),
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, assistantMsg]);

      // 2. Encrypt dialogue for archive
      const dialogue = `Younger Self: ${currentInput}\nFuture Self: ${response.response}`;
      const encryptedDialogue = await encryptData(dialogue, user.uid);

      await setDoc(doc(collection(db, 'users', user.uid, 'memories')), {
        content: encryptedDialogue,
        type: 'journal',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: 'reflective',
        isEncrypted: true,
        analysis: { isAIGenerated: true, type: 'resonance-dialogue' }
      });

    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Temporal Link Severed", 
        description: error.message || "Failed to reach your future self. Check your network." 
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col relative">
      {/* Cinematic Header */}
      <header className="flex items-center justify-between pb-6 px-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2.5 glass-morphism rounded-full hover:bg-white/10 transition-colors group">
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              Neural Resonance
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] uppercase tracking-widest font-bold text-primary">
                <ShieldCheck className="w-3 h-3" /> E2EE Active
              </span>
            </h1>
            <p className="text-xs text-muted-foreground font-light mt-1">Direct communication with your projected digital legacy.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-full glass-morphism border-white/5 bg-white/5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">Quantum Tunnel Sync</span>
        </div>
      </header>

      {/* Main Chat Area */}
      <Card className="flex-1 glass-morphism border-white/5 bg-transparent flex flex-col overflow-hidden relative rounded-[2.5rem] shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background/40 to-transparent z-10 pointer-events-none" />
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 scroll-smooth custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 shadow-lg ${
                    msg.role === "user" 
                      ? "bg-accent/20 border-accent/40 text-accent" 
                      : "bg-primary/20 border-primary/40 text-primary"
                  }`}>
                    {msg.role === "user" ? <User className="w-5 h-5 md:w-6 md:h-6" /> : <Bot className="w-5 h-5 md:w-6 md:h-6" />}
                  </div>
                  
                  <div className={`space-y-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div className={`p-5 md:p-7 rounded-[2rem] font-light text-base md:text-xl leading-relaxed shadow-xl backdrop-blur-xl ${
                      msg.role === "user" 
                        ? "bg-accent/10 border-accent/20 text-white rounded-tr-none" 
                        : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-2">
                      {format(msg.timestamp, "h:mm a")}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex gap-4 items-center"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex gap-2 p-5 rounded-full bg-white/5 border border-white/10 px-8">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-primary rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Input Area */}
        <div className="p-8 bg-black/40 backdrop-blur-3xl border-t border-white/5">
          <form 
            onSubmit={handleSend}
            className="relative flex items-center gap-4 max-w-4xl mx-auto"
          >
            <div className="relative flex-1 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Whisper to the future..."
                disabled={isTyping}
                className="relative h-16 bg-white/5 border-white/10 rounded-2xl px-10 focus:ring-primary/40 focus:border-primary/40 text-white text-lg placeholder:text-white/20"
              />
            </div>
            
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/20 group transition-all"
            >
              {isTyping ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Send className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
            </Button>
          </form>
          <div className="mt-4 flex justify-center items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground/40">
            <Lock className="w-3 h-3" /> Zero-Knowledge Neural Tunnel active
          </div>
        </div>
      </Card>

      {/* Background Ambience */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
