"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/navigation/sidebar";
import { useUser } from "@/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-headline text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary">Synchronizing Neural Data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
        <div className="relative z-10 p-4 md:p-6 lg:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}