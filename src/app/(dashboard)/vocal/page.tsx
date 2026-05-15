"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Trash2, Volume2, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VocalEchoPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const vocalQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "memories"), where("type", "==", "vocal"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: recordings, loading, error: queryError } = useCollection(vocalQuery);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      return true;
    } catch (err) {
      setPermissionStatus('denied');
      toast({ variant: "destructive", title: "Microphone Required", description: "Please enable microphone access in your browser settings." });
      return false;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (event) => { audioChunks.current.push(event.data); };
      mediaRecorder.current.onstop = async () => {
        if (!user || !db) return;
        try {
          await addDoc(collection(db, "users", user.uid, "memories"), { content: "A new vocal frequency captured.", type: "vocal", createdAt: serverTimestamp(), userId: user.uid, mood: "vocal-resonance", analysis: { duration: "0:12", isSimulation: true } });
          toast({ title: "Echo Archived", description: "Your neural frequency has been stored." });
        } catch (e) { toast({ variant: "destructive", title: "Archive Failed", description: "The void rejected the signal." }); }
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) { console.error("Recording error:", err); }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "memories", id));
      toast({ title: "Echo Faded", description: "The frequency has returned to silence." });
    } catch (e) { toast({ variant: "destructive", title: "Deletion Failed" }); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-3">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Vocal Echo Archive</h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">Capture the raw frequency of your voice. The sound of who you are in this exact moment.</p>
        <div className="mx-auto max-w-md rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-muted-foreground">Voice capture is under development and will work soon.</div>
      </header>

      {permissionStatus === 'denied' && (
        <Alert variant="destructive" className="glass-morphism border-destructive/50 rounded-xl">
          <AlertCircle className="h-4 w-4" /><AlertTitle>Microphone Access Blocked</AlertTitle>
          <AlertDescription>Please update your browser permissions to continue.</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <div className="relative group">
          {isRecording && (
            <>
              <motion.div animate={{ scale: [1, 1.4], opacity: [0.3, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <motion.div animate={{ scale: [1, 1.8], opacity: [0.2, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }} className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
            </>
          )}
          <Button onClick={isRecording ? stopRecording : startRecording} disabled={!user} className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 border-4 z-10 transition-all duration-500 ${isRecording ? "bg-destructive border-destructive/50" : "bg-primary border-primary/20 hover:scale-105"}`}>
            {isRecording ? <><Square className="w-7 h-7 fill-current" /><span className="text-[9px] uppercase font-bold animate-pulse">Stop</span></> : <><Mic className="w-7 h-7" /><span className="text-[9px] uppercase font-bold">Record</span></>}
          </Button>
        </div>
      </div>

      {isRecording && (
        <div className="flex justify-center items-center gap-0.5 h-16">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={i} animate={{ height: [8, 20 + Math.random() * 40, 8] }} transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.04 }} className="w-1 bg-primary rounded-full opacity-60" />
          ))}
        </div>
      )}

      <div className="space-y-5">
        <h2 className="font-headline text-lg font-medium flex items-center gap-2"><Volume2 className="w-5 h-5 text-primary" /> Recent Echoes</h2>
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3"><Loader2 className="w-6 h-6 text-primary animate-spin" /><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Syncing Vocal Frequencies...</p></div>
        ) : queryError ? (
          <div className="text-center py-12 glass-morphism rounded-xl border-destructive/20 text-destructive text-xs">Neural index required. Please ensure Firestore composite indexes are built.</div>
        ) : (
          <div className="space-y-3">
            {recordings?.map((rec: any) => (
              <Card key={rec.id} className="glass-morphism border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform"><Play className="w-4 h-4 text-primary fill-current" /></div>
                    <div><h4 className="font-headline font-medium text-sm">{rec.content.length > 40 ? rec.content.substring(0, 40) + "..." : rec.content}</h4><p className="text-[9px] text-muted-foreground uppercase tracking-wider">{rec.createdAt?.seconds ? format(new Date(rec.createdAt.seconds * 1000), "MMM d, yyyy") : "Processing..."} • {rec.analysis?.duration || "0:12"}</p></div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(rec.id)} className="rounded-full hover:bg-destructive/10 hover:text-destructive h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                </CardContent>
              </Card>
            ))}
            {recordings?.length === 0 && <div className="text-center py-16 text-muted-foreground italic glass-morphism rounded-xl text-sm">The vocal archive is empty. Speak to the ghost.</div>}
          </div>
        )}
      </div>
    </div>
  );
}