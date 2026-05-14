'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { AlertCircle, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<ReturnType<typeof initializeFirebase> | null>(null);
  const [triedToInit, setTriedToInit] = useState(false);

  useEffect(() => {
    const instances = initializeFirebase();
    setFirebase(instances);
    setTriedToInit(true);
  }, []);

  if (!triedToInit) {
    return null; // Initial mount
  }

  // If Firebase failed to initialize (missing keys), show a helpful setup message
  if (!firebase) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive" className="glass-morphism border-primary/50 bg-primary/5">
            <AlertCircle className="h-5 w-5 text-primary" />
            <AlertTitle className="font-headline text-lg text-primary tracking-tight">Neural Link Offline</AlertTitle>
            <AlertDescription className="mt-2 text-muted-foreground font-light leading-relaxed">
              The Digital Ghost requires a Firebase connection to synchronize. 
              Please click the <strong className="text-foreground">"Connect Firebase"</strong> button in the project dashboard to inject your credentials.
            </AlertDescription>
          </Alert>
          <div className="p-4 rounded-xl glass-morphism border-white/5 bg-black/20 font-mono text-[10px] text-muted-foreground uppercase tracking-widest text-center">
            System status: Awaiting Environment Variables
          </div>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider app={firebase.app} db={firebase.db} auth={firebase.auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
