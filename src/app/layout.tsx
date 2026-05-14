
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { useState, useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [particles, setParticles] = useState<{left: string, top: string, delay: string, duration: string}[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${10 + Math.random() * 20}s`
    }));
    setParticles(newParticles);
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
        <FirebaseClientProvider>
          <ThemeProvider>
            <div className="floating-particles">
            {particles.map((p, i) => (
              <div 
                key={i} 
                className="particle" 
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.delay,
                  animationDuration: p.duration
                }} 
              />
            ))}
          </div>
          {children}
          <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
