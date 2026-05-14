
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ArrowLeft, ShieldCheck, Lock, Sparkles, Loader2 } from "lucide-react";
import { futureSelfChat } from "@/ai/flows/future-self-chat-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] max-w-4xl mx-auto relative">
      {/* Header - Simple & Clean */}
      <header className="flex items-center justify-between py-4 border-b border-white/5 sticky top-0 bg-background/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-headline font-bold text-white flex items-center gap-2">
              Neural Resonance
              <ShieldCheck className="w-4 h-4 text-primary" />
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Legacy Dialogue Active</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">E2EE Tunnel</span>
        </div>
      </header>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-8 space-y-8 scroll-smooth custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                msg.role === "user" 
                  ? "bg-accent/10 border-accent/20 text-accent" 
                  : "bg-primary/10 border-primary/20 text-primary"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none font-medium" 
                    : "bg-white/5 border border-white/10 text-white rounded-tl-none font-light"
                }`}>
                  {msg.content}
                </div>
                <span className="mt-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                  {format(msg.timestamp, "h:mm a")}
                </span>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area - Pinned at Bottom */}
      <footer className="py-4 bg-background/80 backdrop-blur-md sticky bottom-0 z-20 border-t border-white/5">
        <form 
          onSubmit={handleSend}
          className="relative max-w-3xl mx-auto flex items-end gap-2 group px-2 sm:px-0"
        >
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your future self..."
              disabled={isTyping}
              className="h-14 bg-white/5 border-white/10 rounded-2xl pl-6 pr-14 text-white placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:scale-105 transition-transform"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
        <p className="mt-3 text-center text-[8px] sm:text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <Lock className="w-3 h-3" /> Secure Neural Tunnel Active
        </p>
      </footer>
    </div>
  );
}
