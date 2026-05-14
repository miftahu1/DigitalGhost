
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, Trash2, Undo2, AlertTriangle, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { decryptData } from "@/lib/encryption";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TimelinePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [decryptedMemories, setDecryptedMemories] = useState<any[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<Record<string, number>>({});
  
  const deletionTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const memoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "memories"),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: rawMemories, loading } = useCollection(memoriesQuery);

  useEffect(() => {
    async function processMemories() {
      if (!rawMemories || !user?.uid) return;
      setIsDecrypting(true);
      try {
        const decrypted = await Promise.all(
          rawMemories.map(async (m: any) => ({
            ...m,
            content: m.isEncrypted ? await decryptData(m.content, user.uid) : m.content
          }))
        );
        // Filter out resonance dialogues to keep the timeline focused on life entries
        const filtered = decrypted.filter(m => m.type !== 'resonance');
        setDecryptedMemories(filtered);
      } catch (err) {
        console.error("Timeline decryption error:", err);
      } finally {
        setIsDecrypting(false);
      }
    }
    processMemories();
  }, [rawMemories, user?.uid]);

  const filteredMemories = useMemo(() => {
    return decryptedMemories.filter(m => 
      (m.content?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (m.type?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [decryptedMemories, searchTerm]);

  const startCountdown = (id: string) => {
    setPendingDeletions(prev => ({ ...prev, [id]: 10 }));
    
    const interval = setInterval(() => {
      setPendingDeletions(prev => {
        const current = prev[id];
        if (current <= 1) {
          clearInterval(interval);
          finalizeDelete(id);
          const newMap = { ...prev };
          delete newMap[id];
          return newMap;
        }
        return { ...prev, [id]: current - 1 };
      });
    }, 1000);

    deletionTimers.current[id] = interval;
  };

  const cancelDelete = (id: string) => {
    if (deletionTimers.current[id]) {
      clearInterval(deletionTimers.current[id]);
      delete deletionTimers.current[id];
    }
    setPendingDeletions(prev => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
    toast({ title: "Operation Aborted", description: "The memory remains intact." });
  };

  const finalizeDelete = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "memories", id));
      toast({ title: "Echo Faded", description: "Memory purged from the neural vault." });
    } catch (e) {
      toast({ variant: "destructive", title: "Dissolution Failed" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            Chronicle Timeline <ShieldCheck className="w-8 h-8 text-primary/40" />
          </h1>
          <p className="text-muted-foreground font-light text-lg mt-1">Scrolling through your securely encrypted evolution.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search archive..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-morphism border-white/10 rounded-full text-white" 
            />
          </div>
        </div>
      </header>

      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-transparent -translate-x-1/2 opacity-30" />

        <div className="space-y-12 relative">
          {(loading || isDecrypting) ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Decrypting neural archive locally...</p>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground italic glass-morphism rounded-3xl p-10">
              No echoes found in this temporal slice.
            </div>
          ) : (
            filteredMemories.map((memory: any, idx: number) => {
              const isPending = pendingDeletions[memory.id] !== undefined;
              const countdown = pendingDeletions[memory.id];

              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"}`}
                >
                  <div className="w-full md:w-1/2 relative">
                    <Card className={`glass-morphism border-white/5 transition-all group overflow-hidden relative ${isPending ? 'grayscale opacity-50' : 'bg-white/5 hover:bg-white/10'}`}>
                      <AnimatePresence>
                        {isPending && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md space-y-4"
                          >
                            <div className="text-5xl font-headline font-bold text-primary animate-pulse">{countdown}s</div>
                            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/60">Dissolving Memory...</p>
                            <Button variant="outline" size="sm" onClick={() => cancelDelete(memory.id)} className="rounded-full border-primary/50 text-primary hover:bg-primary/10">
                              <Undo2 className="w-4 h-4 mr-2" /> UNDO
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div className={`h-1 w-full bg-gradient-to-r ${idx % 2 === 0 ? "from-primary to-accent" : "from-accent to-primary"} opacity-40`} />
                      <CardContent className="p-6 md:p-8 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase border-primary/20 text-primary">
                              {memory.type}
                            </Badge>
                            <Lock className="w-3 h-3 text-primary/40" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                              {memory.createdAt?.seconds 
                                ? format(new Date(memory.createdAt.seconds * 1000), "MMM d, yyyy") 
                                : "Syncing..."}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isPending && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setConfirmDeleteId(memory.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive md:opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-base md:text-lg font-light leading-relaxed text-foreground/90 group-hover:text-white transition-colors">
                          {memory.content}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="hidden md:flex relative z-10 w-12 h-12 rounded-full glass items-center justify-center border-white/10 shrink-0">
                    <div className={`w-4 h-4 rounded-full animate-pulse ${idx % 2 === 0 ? "bg-primary" : "bg-accent"}`} />
                  </div>

                  <div className="hidden md:block w-1/2">
                    <div className="flex items-center gap-4 px-10">
                      <Calendar className="w-5 h-5 text-muted-foreground/30" />
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="glass-morphism border-destructive/20 bg-background/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive font-headline text-xl">
              <AlertTriangle className="w-5 h-5" /> Start Dissolution Sequence?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-light leading-relaxed">
              This will begin a 10-second purge of the selected memory from your neural archive. You can abort the sequence at any time before it completes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-white/10 hover:bg-white/5">Maintain Echo</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (confirmDeleteId) startCountdown(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
              className="bg-destructive hover:bg-destructive/90 rounded-full font-headline uppercase tracking-widest text-xs h-10 px-6"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
