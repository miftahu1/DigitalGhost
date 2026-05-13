
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  PenLine, 
  History, 
  MessageSquare, 
  Moon, 
  Mic, 
  LineChart, 
  Ghost,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: PenLine, label: "Reflect", href: "/reflect" },
  { icon: History, label: "Timeline", href: "/timeline" },
  { icon: MessageSquare, label: "Resonance", href: "/resonance" },
  { icon: Moon, label: "Dreams", href: "/dreams" },
  { icon: Mic, label: "Vocal Echo", href: "/vocal" },
  { icon: LineChart, label: "Evolution", href: "/evolution" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 md:w-64 glass-morphism border-r border-white/5 h-screen flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Ghost className="w-6 h-6 text-primary" strokeWidth={1.5} />
          </div>
          <span className="hidden md:block font-headline text-lg font-bold tracking-tight text-glow">
            GHOST
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
              <span className="hidden md:block font-body text-sm font-medium tracking-wide">
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-white transition-colors">
          <Search className="w-6 h-6" strokeWidth={1.5} />
          <span className="hidden md:block font-body text-sm">Neural Search</span>
        </button>
      </div>
    </aside>
  );
}
