
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { History, Calendar, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { format } from "date-fns";

export default function TimelinePage() {
  const { user } = useUser();
  const db = useFirestore();

  const memoriesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "memories"),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: memories, loading } = useCollection(memoriesQuery);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Chronicle Timeline</h1>
          <p className="text-muted-foreground font-light text-lg mt-1">Scrolling through the chapters of your digital evolution.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search memories..." className="pl-10 glass-morphism border-white/10 rounded-full" />
          </div>
          <button className="p-3 glass rounded-full hover:bg-white/5">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="relative">
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-transparent md:-translate-x-1/2 opacity-30 hidden md:block" />

        <div className="space-y-20 relative">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Syncing with neural archive...</div>
          ) : memories?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground italic">No echoes found in this temporal slice.</div>
          ) : (
            memories?.map((memory: any, idx: number) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="w-full md:w-1/2">
                  <Card className="glass-morphism border-white/5 bg-white/5 hover:bg-white/10 transition-all group overflow-hidden">
                    <div className={`h-1 w-full bg-gradient-to-r ${idx % 2 === 0 ? "from-primary to-accent" : "from-accent to-primary"} opacity-40`} />
                    <CardContent className="p-8 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase border-primary/20 text-primary">
                            {memory.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-light tracking-wide">
                            {memory.createdAt?.seconds 
                              ? format(new Date(memory.createdAt.seconds * 1000), "MMMM d, yyyy") 
                              : "Momentarily..."}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{memory.mood}</span>
                      </div>
                      <p className="text-lg font-light leading-relaxed text-foreground/90 group-hover:text-white transition-colors">
                        {memory.content}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="hidden md:flex relative z-10 w-12 h-12 rounded-full glass items-center justify-center border-white/10 shrink-0">
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                </div>

                <div className="w-full md:w-1/2 hidden md:block">
                  <div className="flex items-center gap-4 px-10">
                    <Calendar className="w-5 h-5 text-muted-foreground/30" />
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
