
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Smile, MessageSquare, History, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs";
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
      // 1. Encrypt before saving
      const encryptedContent = await encryptData(content, user.uid);

      const memoriesRef = collection(db, 'users', user.uid, 'memories');
      const memoryRef = doc(memoriesRef);

      await setDoc(memoryRef, {
        content: encryptedContent,
        type: 'journal',
        createdAt: serverTimestamp(),
        userId: user.uid,
        mood: 'neutral',
        isEncrypted: true
      });

      toast({
        title: "Memory Encrypted & Archived",
        description: "Your reflection has been integrated into the zero-trust vault.",
      });
      setContent("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Archive Failed", description: "The neural link could not secure the data." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div className="space-y-2 text-white">
          <h1 className="font-headline text-4xl font-bold tracking-tight">Neural Reflection Log</h1>
          <p className="text-muted-foreground font-light text-lg">Speak your truth to the void. It remembers, securely.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold tracking-widest">E2EE Protocol Active</span>
        </div>
      </header>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="glass-morphism bg-transparent border-white/5 p-1 h-12 rounded-full w-full max-w-md mx-auto mb-8 grid grid-cols-2">
          <TabsTrigger value="entry" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Daily Entry</TabsTrigger>
          <TabsTrigger value="guided" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Guided Meditation</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are you feeling right now? Your data is encrypted locally."
              disabled={isSaving}
              className="min-h-[400px] text-xl font-light leading-relaxed bg-card/40 glass-morphism border-white/10 p-8 rounded-2xl focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30 text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[Smile, MessageSquare, History].map((Icon, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-white/5">
                    <Icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-light italic">Local encryption key applied</span>
            </div>

            <Button 
              size="lg" 
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              className="px-10 h-14 rounded-full font-headline tracking-widest text-lg group overflow-hidden relative shadow-lg shadow-primary/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSaving ? "Securing..." : "Archive & Encrypt"} 
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
