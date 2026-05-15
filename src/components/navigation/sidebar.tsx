'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard,
  PenLine,
  History,
  MessageSquare,
  User as UserIcon,
  Settings,
  Cloudy,
  TrendingUp,
  Video,
  Mic,
  MoreHorizontal,
  BrainCircuit,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: PenLine, label: 'Reflect', href: '/reflect' },
  { icon: Cloudy, label: 'Dreams', href: '/dreams' },
  { icon: TrendingUp, label: 'Evolution', href: '/evolution' },
  { icon: History, label: 'Timeline', href: '/timeline' },
  { icon: Video, label: 'Visualize', href: '#', disabled: true },
  { icon: Mic, label: 'Vocal', href: '/vocal' },
  { icon: MessageSquare, label: 'Resonance', href: '/resonance' },
  { icon: BrainCircuit, label: 'Cognitive Atlas', href: '/cognitive-atlas' },
  { icon: Package, label: 'Legacy', href: '/legacy' },
  { icon: Settings, label: 'More', href: '/more' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 56) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  if (isMobile) {
    const primaryMobileItems = NAV_ITEMS.filter(item =>
      ['/dashboard', '/reflect', '/timeline', '/resonance'].includes(item.href)
    );

    return (
      <motion.div
        animate={{ y: isScrolled ? 100 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed bottom-0 left-0 right-0 z-40 h-20 border-t border-white/5 bg-background/80 backdrop-blur-lg"
      >
        <nav className="flex h-full items-center justify-around">
          {primaryMobileItems.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="h-5 w-5" />
                <span>More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-background/90 backdrop-blur-lg rounded-t-2xl border-t border-white/10">
              <div className="grid grid-cols-4 gap-4 p-4">
                {NAV_ITEMS.map(item => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg py-3 text-center text-xs transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-6 w-6 mb-1" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </motion.div>
    );
  }

  return (
    <aside className="hidden md:flex md:w-72 flex-col glass-morphism border-r border-white/5 h-screen sticky top-0 z-30">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
            <Image
              src="/logo/logo.png"
              alt="Digital Ghost"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-headline text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DIGITAL
            </span>
            <span className="font-headline text-lg font-bold tracking-tight block leading-tight bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              GHOST
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-primary' : '')} strokeWidth={1.5} />
              <span className="font-body text-sm font-medium tracking-wide">{item.label}</span>
              {item.disabled && <span className='text-xs text-muted-foreground'>Coming soon...</span>}
              {isActive && (
                <motion.div
                  layoutId="desktop-active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
