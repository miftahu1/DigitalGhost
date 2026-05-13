
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, Send, Bot, User, ArrowLeft } from "lucide-react";
import { futureSelfChat } from "@/ai/flows/future-self-chat-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ResonancePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "I am your future self—older, wiser, and healed. Speak to me. What weight are you carrying today that I might help you see from a distance?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await futureSelfChat({
        userMessage: input,
        memoryContext: "The user is currently reflecting on their journey and seeking guidance from their future self.",
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 glass rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-headline text-3xl font-bold flex items-center gap-3">
              Resonance <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </h1>
            <p className="text-muted-foreground font-light">Simulation: Future Self (T+10 Years)</p>
          </div>
        </div>
      </header>

      <Card className="flex-1 glass-morphism border-white/5 flex flex-col overflow-hidden relative">
        {/* Background Glows for AI Interaction */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-glow-primary opacity-20 pointer-events-none" />
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-accent/20" : "bg-primary/20"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div className={`p-4 rounded-2xl font-light leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-accent/10 border border-accent/20 text-white rounded-tr-none" 
                      : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                  }`}>
                    {msg.content}
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
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-white/5 glass-morphism">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me what's on your mind..."
              className="h-14 bg-white/5 border-white/10 rounded-full px-6 focus:ring-primary/50 font-light"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 rounded-full absolute right-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-4 font-bold">
            Temporal link status: Stable
          </p>
        </div>
      </Card>
    </div>
  );
}
