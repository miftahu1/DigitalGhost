"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Smile, MessageSquare, History, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { encryptData } from "@/lib/encryption";

export default function ReflectPage() {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const handleSave = async () => {
    if (!content.trim() || !user?.uid || !db || isSaving) return;
    setIsSaving(true);
    try {
      const encryptedContent = await encryptData(content, user.uid);
      const memoriesRef = collection(db, 'users', user.uid, 'memories');
      const memoryRef = doc(memoriesRef);
      await setDoc(memoryRef, { content: encryptedContent, type: 'journal', createdAt: serverTimestamp(), userId: user.uid, mood: 'neutral', isEncrypted: true });
      toast({ title: "Memory Encrypted & Archived", description: "Your reflection has been integrated into the zero-trust vault." });
      setContent("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Archive Failed", description: "The neural link could not secure the data." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Neural Reflection Log</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">Speak your truth to the void. It remembers, securely.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider">E2EE Protocol Active</span>
        </div>
      </header>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="glass-morphism bg-transparent border-white/5 p-0.5 h-11 rounded-full w-full max-w-md mx-auto mb-8 grid grid-cols-2">
          <TabsTrigger value="entry" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Daily Entry</TabsTrigger>
          <TabsTrigger value="guided" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Guided Meditation</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are you feeling right now? Your data is encrypted locally."
              disabled={isSaving}
              className="min-h-[350px] text-base md:text-lg font-light leading-relaxed bg-card/40 glass-morphism border-white/10 p-6 rounded-2xl focus:ring-primary/40 resize-none text-foreground placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[Smile, MessageSquare, History].map((Icon, idx) => (
                  <div key={idx} className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-white/5">
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-light italic">Local encryption key applied</span>
            </div>

            <Button onClick={handleSave} disabled={!content.trim() || isSaving} size="lg" className="px-8 h-12 rounded-xl font-headline tracking-wider text-base shadow-lg shadow-primary/20">
              {isSaving ? "Securing..." : "Archive & Encrypt"} {isSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}