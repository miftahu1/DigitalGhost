"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ArrowLeft, ShieldCheck, Lock, Sparkles, Loader2, History as HistoryIcon, X, MessageSquare, ChevronRight } from "lucide-react";
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
    { id: "init", role: "assistant", content: "I am here, existing in the spaces between your memories. Our connection is end-to-end encrypted. What shall we explore within your legacy today?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [decryptedHistory, setDecryptedHistory] = useState<any[]>([]);
  const [isDecryptingHistory, setIsDecryptingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const contextQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "memories"), where('type', 'in', ['journal', 'dream']), orderBy("createdAt", "desc"), limit(10));
  }, [db, user?.uid]);

  const { data: rawContext } = useCollection(contextQuery);

  const historyQuery = useMemo(() => {
    if (!db || !user?.uid) return null;
    return query(collection(db, "users", user.uid, "memories"), where('type', '==', 'resonance'), orderBy("createdAt", "desc"), limit(20));
  }, [db, user?.uid]);

  const { data: rawHistory, loading: historyLoading } = useCollection(historyQuery);

  useEffect(() => {
    async function processHistory() {
      if (!rawHistory || !user?.uid) return;
      setIsDecryptingHistory(true);
      const decrypted = await Promise.all(rawHistory.map(async (h: any) => ({ ...h, content: h.isEncrypted ? await decryptData(h.content, user.uid) : h.content })));
      setDecryptedHistory(decrypted);
      setIsDecryptingHistory(false);
    }
    processHistory();
  }, [rawHistory, user?.uid]);

  const scrollToBottom = () => { if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping || !user || !db) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const decryptedContexts = await Promise.all((rawContext || []).map(async (m: any) => {
        const content = m.isEncrypted ? await decryptData(m.content, user.uid) : m.content;
        return `[${m.type}] ${content}`;
      }));
      const response = await futureSelfChat({ userMessage: currentInput, memoryContext: decryptedContexts.join("\n") });
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response.response, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
      const dialogue = `Younger Self: ${currentInput}\nFuture Self: ${response.response}`;
      const encryptedDialogue = await encryptData(dialogue, user.uid);
      await setDoc(doc(collection(db, 'users', user.uid, 'memories')), {
        content: encryptedDialogue, type: 'resonance', createdAt: serverTimestamp(), userId: user.uid, mood: 'reflective', isEncrypted: true, analysis: { isAIGenerated: true, type: 'resonance-dialogue' }
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Temporal Link Severed", description: error.message || "Failed to reach your future self." });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] max-w-4xl mx-auto relative">
      {/* Header */}
      <header className="flex items-center justify-between py-4 border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-md z-20 px-2">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-lg md:text-xl font-headline font-bold text-foreground flex items-center gap-2">
              Neural Resonance <ShieldCheck className="w-4 h-4 text-primary" />
            </h1>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Legacy Dialogue Active</p>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground gap-1">
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Archive</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="glass-morphism-heavy border-white/10 sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-headline text-lg font-bold flex items-center gap-2"><HistoryIcon className="w-4 h-4 text-primary" /> Temporal History</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
              {(historyLoading || isDecryptingHistory) ? (
                <div className="flex flex-col items-center py-16 gap-3"><Loader2 className="w-6 h-6 text-primary animate-spin" /><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Decrypting Logs...</p></div>
              ) : decryptedHistory.length > 0 ? (
                decryptedHistory.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                      <span>{item.createdAt?.seconds ? format(new Date(item.createdAt.seconds * 1000), "MMM d, h:mm a") : "Legacy"}</span>
                      <Lock className="w-3 h-3 opacity-30" />
                    </div>
                  <p className="text-xs font-light text-foreground/80 whitespace-pre-wrap leading-relaxed line-clamp-3">{item.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground italic text-xs">No archived dialogues found.</div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6 scroll-smooth custom-scrollbar px-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-accent/10 border border-accent/20 text-accent" : "bg-primary/10 border border-primary/20 text-primary"}`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white/5 border border-white/10 text-foreground rounded-tl-none"}`}>
                  {msg.content}
                </div>
                <span className="mt-1 text-[9px] text-muted-foreground font-bold uppercase tracking-wider opacity-40">{format(msg.timestamp, "h:mm a")}</span>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>
              <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Footer */}
      <footer className="py-4 bg-background/80 backdrop-blur-md sticky bottom-0 z-20 border-t border-white/5">
        <form onSubmit={handleSend} className="relative max-w-3xl mx-auto flex items-end gap-2 px-2">
          <div className="relative flex-1">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message your future self..." disabled={isTyping} className="h-12 bg-white/5 border-white/10 rounded-xl pl-5 pr-14 text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/50" />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="absolute right-1.5 bottom-1.5 h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:scale-105 transition-transform">
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
        <p className="mt-2 text-center text-[8px] text-muted-foreground/40 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-1">
          <Lock className="w-2.5 h-2.5" /> Secure Neural Tunnel Active
        </p>
      </footer>
    </div>
  );
}