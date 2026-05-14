
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ghost, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useFirestore } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Initialize user profile if it doesn't exist
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          stats: {
            resilience: 50,
            empathy: 50,
            clarity: 50,
            openness: 50,
          }
        });
      }
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative bg-background overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md glass-morphism border-white/5 bg-transparent overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Ghost className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="font-headline text-3xl font-bold tracking-tight">Identity Verification</CardTitle>
            <CardDescription className="font-light text-muted-foreground">
              Sign in to synchronize your neural echo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full h-14 rounded-full font-headline tracking-widest text-lg group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            
            <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-center text-muted-foreground font-bold">
              Secure Neural Connection Established
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
