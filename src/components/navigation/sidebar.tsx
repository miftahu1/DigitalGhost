"use client";

import { usePathname, useRouter } from "next/navigation";
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
  Search,
  LogOut,
  User as UserIcon,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "firebase/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

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
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-morphism border-b border-white/5 z-[60]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Ghost className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="font-headline text-sm font-bold tracking-tight text-glow">
            GHOST
          </span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 glass rounded-lg hover:bg-white/5 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 glass-morphism border-r border-white/5 h-full flex flex-col z-50 transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ghost className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <span className="font-headline text-lg font-bold tracking-tight text-glow">
              GHOST
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 md:py-0 space-y-1 overflow-y-auto custom-scrollbar mt-16 md:mt-0">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
                <span className="font-body text-sm font-medium tracking-wide">
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

        <div className="p-4 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-white transition-colors">
            <Search className="w-6 h-6" strokeWidth={1.5} />
            <span className="font-body text-sm">Neural Search</span>
          </button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 transition-all text-left">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <UserIcon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.displayName || 'Neural Echo'}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-bold">Authenticated</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-morphism border-white/10 bg-card/90 backdrop-blur-xl">
                <div className="p-2 px-3 py-2">
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Echo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>
    </>
  );
}