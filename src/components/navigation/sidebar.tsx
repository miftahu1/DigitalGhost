'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard,
  PenLine,
  History,
  MessageSquare,
  Moon,
  Mic,
  LineChart,
  Video,
  LogOut,
  User as UserIcon,
  Sun,
  Palette,
  Sparkles,
  Leaf,
  Flame,
  Ghost,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { useTheme } from '@/components/theme/theme-provider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', mobileLabel: 'Home' },
  { icon: PenLine, label: 'Reflect', href: '/reflect', mobileLabel: 'Write' },
  { icon: History, label: 'Timeline', href: '/timeline', mobileLabel: 'Timeline' },
  { icon: MessageSquare, label: 'Resonance', href: '/resonance', mobileLabel: 'Chat' },
  { icon: Video, label: 'Neural Cinema', href: '/visualize', mobileLabel: 'Cinema' },
  { icon: Moon, label: 'Dreams', href: '/dreams', mobileLabel: 'Dreams' },
  { icon: Mic, label: 'Vocal Echo', href: '/vocal', mobileLabel: 'Voice' },
  { icon: LineChart, label: 'Evolution', href: '/evolution', mobileLabel: 'Growth' },
];

const COLOR_THEMES = [
  { id: 'ghost', name: 'Ghost', icon: Ghost, colors: 'from-purple-500 to-blue-500' },
  { id: 'aurora', name: 'Aurora', icon: Leaf, colors: 'from-emerald-500 to-teal-500' },
  { id: 'ember', name: 'Ember', icon: Flame, colors: 'from-orange-500 to-rose-500' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsBottomNavVisible(false);
        } else {
          setIsBottomNavVisible(true);
        }
        setLastScrollY(currentScrollY);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile, lastScrollY]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (isMobile) {
    return (
      <>
        <motion.div
          animate={{ y: isBottomNavVisible ? 0 : 120 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-morphism border-t border-white/5 px-2 py-2 h-20"
        >
          <div className="flex justify-around items-center h-full">
            {NAV_ITEMS.slice(0, 5).map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all touch-target relative',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5" strokeWidth={1.5} />
                    {isActive && (
                      <motion.div
                        layoutId="mobile-active"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.mobileLabel}</span>
                </Link>
              );
            })}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl touch-target text-muted-foreground hover:text-foreground transition-colors">
                  <UserIcon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                side="top"
                className="glass-morphism border-white/10 w-56 mb-24"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{user?.displayName || 'Neural Echo'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => router.push('/evolution')} className="cursor-pointer">
                  <LineChart className="w-4 h-4 mr-2" />
                  Growth
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/resonance')} className="cursor-pointer">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Resonance
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <Palette className="w-4 h-4 mr-2" />
                    Color Theme
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="glass-morphism border-white/10">
                    <DropdownMenuRadioGroup
                      value={colorTheme}
                      onValueChange={v => setColorTheme(v as any)}
                    >
                      {COLOR_THEMES.map(t => (
                        <DropdownMenuRadioItem key={t.id} value={t.id} className="cursor-pointer">
                          <t.icon className="w-4 h-4 mr-2" />
                          {t.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <div className="h-20 md:hidden" />
      </>
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
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-primary' : '')} strokeWidth={1.5} />
              <span className="font-body text-sm font-medium tracking-wide">{item.label}</span>
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

      <div className="p-4 border-t border-white/10 space-y-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all">
              <Avatar className="w-10 h-10 border border-white/10">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  <UserIcon className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">{user?.displayName || 'Neural Echo'}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">
                  Synchronized
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="glass-morphism border-white/10 w-64">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 mr-2" />
              ) : (
                <Moon className="w-4 h-4 mr-2" />
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Palette className="w-4 h-4 mr-2" />
                Color Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="glass-morphism border-white/10">
                <DropdownMenuRadioGroup
                  value={colorTheme}
                  onValueChange={v => setColorTheme(v as any)}
                >
                  {COLOR_THEMES.map(t => (
                    <DropdownMenuRadioItem key={t.id} value={t.id} className="cursor-pointer">
                      <t.icon className="w-4 h-4 mr-2" />
                      <span className="flex-1">{t.name}</span>
                      <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', t.colors)} />
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-2 pt-2">
          {COLOR_THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setColorTheme(t.id as any)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1',
                colorTheme === t.id
                  ? `bg-gradient-to-r ${t.colors} text-white shadow-lg scale-105`
                  : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
              )}
            >
              <t.icon className="w-3 h-3" />
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
