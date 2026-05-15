'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';
type ColorTheme = 'ghost' | 'aurora' | 'ember';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('ghost');

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('dg_theme') as Theme | null;
    const savedColorTheme = localStorage.getItem('dg_color_theme') as ColorTheme | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme);
    setColorTheme(savedColorTheme === 'aurora' || savedColorTheme === 'ember' ? savedColorTheme : 'ghost');
  }, []);

  // Apply theme and color theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    document.documentElement.dataset.theme = theme;
    
    localStorage.setItem('dg_theme', theme);
    localStorage.setItem('dg_color_theme', colorTheme);
  }, [theme, colorTheme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      colorTheme,
      setColorTheme,
    }),
    [theme, colorTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}