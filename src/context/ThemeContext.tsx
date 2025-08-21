import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'auto' | 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) || 'auto';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Listen to system theme changes
  useEffect(() => {
    const getSystemTheme = () =>
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    const updateTheme = () => {
      let applied: 'dark' | 'light';
      if (theme === 'auto') {
        applied = getSystemTheme();
      } else {
        applied = theme;
      }
      setResolvedTheme(applied);

      document.documentElement.setAttribute('data-theme', applied);
      if (applied === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    if (theme === 'auto') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};