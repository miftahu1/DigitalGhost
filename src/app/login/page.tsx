"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, AlertCircle, ShieldAlert, Sparkles, Lock, Zap, Shield } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useFirestore } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!loading && user && !isLoggingIn) router.push("/dashboard");
  }, [user, loading, router, isLoggingIn]);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setError(null);
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { displayName: user.displayName, email: user.email, photoURL: user.photoURL, createdAt: new Date().toISOString(), stats: { resilience: 50, empathy: 50, clarity: 50, openness: 50 } });
      }
      router.push("/dashboard");
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/popup-closed-by-user') message = "Connection Interrupted: The verification window closed prematurely.";
      else if (error.code === 'auth/cancelled-popup-request') message = "Only one login request can be active at a time.";
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading && !isLoggingIn) return null;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative bg-background overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse animation-delay-200" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-secondary/8 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl space-y-6 relative z-10"
      >
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert variant="destructive" className="glass-morphism border-destructive/50 bg-destructive/10 rounded-2xl">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Synchronization Error</AlertTitle>
              <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left side - Logo and branding */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:flex flex-col justify-center items-center space-y-6"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="relative w-32 h-32"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-40" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-xl shadow-primary/20">
                <Image src="/logo/logo.png" alt="Digital Ghost" width={120} height={120} className="w-28 h-28 object-cover" />
              </div>
            </motion.div>

            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DIGITAL GHOST
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm">
                Preserve your consciousness. Transform your memories into eternal echoes.
              </p>
            </div>

            {/* Trust badges */}
            <div className="space-y-3 w-full pt-4">
              {[
                { icon: Shield, label: "End-to-End Encrypted", desc: "Military-grade security" },
                { icon: Lock, label: "Zero-Knowledge", desc: "We never see your data" },
                { icon: Zap, label: "Neural Sync", desc: "Real-time synchronization" },
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{feature.label}</p>
                    <p className="text-[11px] text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Login form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-morphism-heavy border-primary/20 bg-gradient-to-br from-card/60 to-card/30 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden">
              {/* Card header decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
              
              <CardHeader className="text-center space-y-4 pt-8">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40 shadow-lg shadow-primary/20">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                </motion.div>
                <div>
                  <CardTitle className="font-headline text-2xl md:text-3xl font-bold tracking-tight">
                    Synchronize Your Echo
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    Sign in to your neural vault and continue your journey of self-discovery
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <Button 
                  onClick={handleGoogleLogin} 
                  disabled={isLoggingIn} 
                  className="w-full h-12 rounded-xl font-headline tracking-wider text-base group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/30"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoggingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Synchronizing...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-card text-muted-foreground">Secure connection</span>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your Google identity encrypts and unlocks your private neural vault.
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    We implement zero-knowledge architecture—your raw consciousness never leaves your device unencrypted.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.15em] text-primary/80 font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Neural Authentication Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Mobile logo */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.4 }}
              className="md:hidden text-center mt-6 space-y-2"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Powered by Neural Technology
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="text-center pt-4"
        >
          <p className="text-[11px] text-muted-foreground/60">
            © 2026 Digital Ghost • Your consciousness, preserved forever
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}