
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Smile, MessageSquare, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function ReflectPage() {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const handleSave = async () => {
    if (!content.trim() || !user || !db || isSaving) return;

    setIsSaving(true);
    const memoryRef = doc(collection(db, 'users', user.uid, 'memories'));

    const memoryData = {
      content,
      type: 'journal',
      createdAt: serverTimestamp(),
      userId: user.uid,
      mood: 'neutral'
    };

    try {
      await setDoc(memoryRef, memoryData);
      toast({
        title: "Memory Archived",
        description: "Your reflection has been integrated into the neural vault.",
      });
      setContent("");
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: memoryRef.path,
          operation: 'create',
          requestResourceData: memoryData,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "An unexpected error occurred while archiving.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10 md:pb-20">
      <header className="space-y-1 md:space-y-2">
        <h1 className="font-headline text-2xl md:text-4xl font-bold tracking-tight">Neural Reflection Log</h1>
        <p className="text-muted-foreground font-light text-sm md:text-lg">Speak your truth to the void. It remembers.</p>
      </header>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="glass-morphism bg-transparent border-white/5 p-1 h-10 md:h-12 rounded-full w-full max-w-sm md:max-w-md mx-auto mb-6 md:mb-8 grid grid-cols-2">
          <TabsTrigger value="entry" className="rounded-full text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Daily Entry</TabsTrigger>
          <TabsTrigger value="guided" className="rounded-full text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Guided Meditation</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4 md:space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are you feeling right now?"
              disabled={isSaving}
              className="min-h-[300px] md:min-h-[400px] text-lg md:text-xl font-light leading-relaxed bg-card/40 glass-morphism border-white/10 p-5 md:p-8 rounded-2xl focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex -space-x-2">
                {[Smile, MessageSquare, History].map((Icon, idx) => (
                  <div key={idx} className="w-8 h-8 md:w-10 md:h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors cursor-pointer">
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] md:text-sm text-muted-foreground font-light">Tag emotional resonance</span>
            </div>

            <Button 
              size="lg" 
              onClick={handleSave}
              disabled={!content.trim() || !user || isSaving}
              className="w-full md:w-auto px-10 h-12 md:h-14 rounded-full font-headline tracking-widest text-base md:text-lg group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSaving ? "Syncing..." : user ? "Archive Memory" : "Login to Archive"} <Save className="w-4 h-4 md:w-5 md:h-5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="guided" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4">
          {[
            { title: "The Child Within", duration: "10 mins", prompt: "Think back to your earliest memory of joy." },
            { title: "Future Ambitions", duration: "15 mins", prompt: "Where do you see your digital echo in 50 years?" },
            { title: "Shadow Work", duration: "20 mins", prompt: "What part of yourself are you currently hiding?" },
            { title: "Gratitude Loop", duration: "5 mins", prompt: "List three things the universe gave you today." },
          ].map((session, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="glass-morphism p-6 md:p-8 rounded-2xl border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:border-primary/20 cursor-pointer transition-all flex flex-col justify-between h-48 md:h-56"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-headline text-lg md:text-xl font-medium">{session.title}</h3>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-primary font-bold">{session.duration}</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground font-light line-clamp-2">{session.prompt}</p>
              </div>
              <Button variant="outline" className="w-fit h-9 md:h-10 rounded-full text-xs md:text-sm border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all">
                Begin Session
              </Button>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
