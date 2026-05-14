
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, Send, Bot, User, ArrowLeft, ShieldCheck, Zap, Lock } from "lucide-react";
import { futureSelfChat } from "@/ai/flows/future-self-chat-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { encryptData, decryptData } from "@/lib/encryption";

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
      id: "1",
      role: "assistant",
      content: "Welcome back. Our channel is end-to-end encrypted. What shall we explore within your legacy today?",
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
      limit(10)
    );
  }, [db, user?.uid]);

  const { data: rawMemories } = useCollection(memoriesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !user || !db) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // 1. Decrypt context for AI
      const decryptedContexts = await Promise.all(
        (rawMemories || []).map(async (m: any) => 
          `[${m.type}] ${m.isEncrypted ? await decryptData(m.content, user.uid) : m.content}`
        )
      );
      
      const response = await futureSelfChat({
        userMessage: input,
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
      const dialogue = `Younger Self: ${input}\nFuture Self: ${response.response}`;
      const encryptedDialogue = await encryptData(dialogue, user.uid);

      await setDoc(doc(collection(db, 'users', user.uid, 'memories')), {
        content: encryptedDialogue,
        type: 'journal',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: 'reflective',
        isEncrypted: true,
        analysis: { isAIGenerated: true, protocol: 'E2EE' }
      });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Channel Disrupted", description: "Encryption key or AI link failed." });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-4">
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 glass rounded-full hover:bg-white/5 transition-colors group">
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <div>
            <h1 className="font-headline text-2xl font-bold text-white flex items-center gap-2">
              Neural Resonance <ShieldCheck className="w-5 h-5 text-primary" />
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-muted-foreground">E2EE Tunnel: Active</span>
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full glass-morphism border-white/5 bg-white/5">
          <Lock className="w-3 h-3 text-primary/60" />
          <span className="text-[8px] uppercase tracking-widest font-bold text-white/60">Zero-Trust Archive</span>
        </div>
      </header>

      <Card className="flex-1 glass-morphism border-white/5 bg-transparent flex flex-col overflow-hidden relative rounded-[2rem]">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 scroll-smooth custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    msg.role === "user" ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"
                  }`}>
                    {msg.role === "user" ? <User className="w-5 h-5 text-accent" /> : <Bot className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="space-y-1.5">
                    <div className={`p-5 rounded-2xl font-light text-base md:text-lg leading-relaxed shadow-lg ${
                      msg.role === "user" 
                        ? "bg-accent/10 border-accent/20 text-white rounded-tr-none" 
                        : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none backdrop-blur-md"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"><Bot className="w-5 h-5 text-primary" /></div>
                <div className="flex gap-1.5 p-4 rounded-full bg-white/5 border border-white/10">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 bg-black/20 backdrop-blur-xl border-t border-white/5">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center gap-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send an encrypted message to the future..."
              disabled={isTyping}
              className="h-16 bg-white/5 border-white/10 rounded-2xl px-8 focus:ring-primary/40 focus:border-primary/40 text-white text-lg"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="h-14 w-14 rounded-xl absolute right-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Send className="w-6 h-6" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
