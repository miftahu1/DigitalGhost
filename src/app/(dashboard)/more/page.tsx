'use client';

import { useTheme } from '@/components/theme/theme-provider';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User as UserIcon, LogOut, Sun, Moon, Palette, Ghost, Leaf, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const COLOR_THEMES = [
  { id: 'ghost', name: 'Ghost', icon: Ghost, colors: 'from-purple-500 to-blue-500' },
  { id: 'aurora', name: 'Aurora', icon: Leaf, colors: 'from-emerald-500 to-teal-500' },
  { id: 'ember', name: 'Ember', icon: Flame, colors: 'from-orange-500 to-rose-500' },
];

export default function MorePage() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight">More Options</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border">
            <AvatarImage src={user?.photoURL || ''} />
            <AvatarFallback>
              <UserIcon />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.displayName || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p>Theme</p>
            <Button variant="outline" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
          <div>
            <p className="mb-2">Color Theme</p>
            <div className="flex gap-2">
              {COLOR_THEMES.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setColorTheme(t.id as any)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 touch-target',
                    colorTheme === t.id
                      ? `bg-gradient-to-r ${t.colors} text-white shadow-lg`
                      : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
