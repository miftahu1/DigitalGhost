
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ArrowLeft, ShieldCheck, Lock, Sparkles, Loader2, History as HistoryIcon, X, MessageSquare } from "lucide-react";
import { futureSelfChat } from "@/ai/flows/future-self-chat-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, query, orderBy, limit, where } from "firebase/firestore";
import { encryptData, decryptData } from "@/lib/encryption";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  const [decryptedHistory, setDecryptedHistory] = useState<any[]>([]);
  const [isDecryptingHistory, setIsDecryptingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Context memories (Journal/Dreams only) for AI guidance
  const contextQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "memories"),
      where('type', 'in', ['journal', 'dream']),
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }, [db, user?.uid]);

  const { data: rawContext } = useCollection(contextQuery);

  // Resonance specific history query
  const historyQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "memories"),
      where('type', '==', 'resonance'),
      orderBy("createdAt", "desc"),
      limit(20)
    );
  }, [db, user?.uid]);

  const { data: rawHistory, loading: historyLoading } = useCollection(historyQuery);

  useEffect(() => {
    async function processHistory() {
      if (!rawHistory || !user?.uid) return;
      setIsDecryptingHistory(true);
      const decrypted = await Promise.all(
        rawHistory.map(async (h: any) => ({
          ...h,
          content: h.isEncrypted ? await decryptData(h.content, user.uid) : h.content
        }))
      );
      setDecryptedHistory(decrypted);
      setIsDecryptingHistory(false);
    }
    processHistory();
  }, [rawHistory, user?.uid]);

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
        (rawContext || []).map(async (m: any) => {
          const content = m.isEncrypted ? await decryptData(m.content, user.uid) : m.content;
          return `[${m.type}] ${content}`;
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

      // Save as 'resonance' type so it doesn't clutter the main timeline
      const dialogue = `Younger Self: ${currentInput}\nFuture Self: ${response.response}`;
      const encryptedDialogue = await encryptData(dialogue, user.uid);

      await setDoc(doc(collection(db, 'users', user.uid, 'memories')), {
        content: encryptedDialogue,
        type: 'resonance',
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
        description: error.message || "Failed to reach your future self." 
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] max-w-4xl mx-auto relative">
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
        
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-white">
                <HistoryIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Archive</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-morphism border-white/10 bg-card/90 backdrop-blur-3xl text-white sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-headline text-xl font-bold flex items-center gap-2">
                  <HistoryIcon className="w-5 h-5 text-primary" /> Temporal History
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-6 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
                {(historyLoading || isDecryptingHistory) ? (
                  <div className="flex flex-col items-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Decrypting Logs...</p>
                  </div>
                ) : decryptedHistory.length > 0 ? (
                  decryptedHistory.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        <span>{item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), "MMM d, h:mm a") : "Legacy"}</span>
                        <Lock className="w-3 h-3 opacity-30" />
                      </div>
                      <p className="text-sm font-light text-white/80 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground italic text-sm">No archived dialogues found.</div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">E2EE Tunnel</span>
          </div>
        </div>
      </header>

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
