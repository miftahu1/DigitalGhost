
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PenLine, Save, Sparkles, Smile, MessageSquare, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function ReflectPage() {
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (!content.trim()) return;
    toast({
      title: "Memory Archived",
      description: "Your reflection has been integrated into the neural vault.",
    });
    setContent("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="space-y-2">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Neural Reflection Log</h1>
        <p className="text-muted-foreground font-light text-lg">Speak your truth to the void. It remembers.</p>
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
              placeholder="What are you feeling right now?"
              className="min-h-[400px] text-xl font-light leading-relaxed bg-card/40 glass-morphism border-white/10 p-8 rounded-2xl focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[Smile, MessageSquare, History].map((Icon, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors cursor-pointer">
                    <Icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-light">Tag emotional resonance</span>
            </div>

            <Button 
              size="lg" 
              onClick={handleSave}
              className="w-full md:w-auto px-10 h-14 rounded-full font-headline tracking-widest text-lg group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                Archive Memory <Save className="w-5 h-5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="guided" className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {[
            { title: "The Child Within", duration: "10 mins", prompt: "Think back to your earliest memory of joy." },
            { title: "Future Ambitions", duration: "15 mins", prompt: "Where do you see your digital echo in 50 years?" },
            { title: "Shadow Work", duration: "20 mins", prompt: "What part of yourself are you currently hiding?" },
            { title: "Gratitude Loop", duration: "5 mins", prompt: "List three things the universe gave you today." },
          ].map((session, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="glass-morphism p-8 rounded-2xl border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:border-primary/20 cursor-pointer transition-all flex flex-col justify-between h-56"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-headline text-xl font-medium">{session.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{session.duration}</span>
                </div>
                <p className="text-muted-foreground font-light">{session.prompt}</p>
              </div>
              <Button variant="outline" className="w-fit rounded-full border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all">
                Begin Session
              </Button>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
