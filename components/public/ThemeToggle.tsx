'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    setMounted(true);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event: MediaQueryListEvent) => {
      const currentSaved = window.localStorage.getItem('theme');
      if (!currentSaved) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handleMediaChange);
    return () => mq.removeEventListener('change', handleMediaChange);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      window.localStorage.setItem('theme', next);
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  };

  const isDark = mounted && theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Ubah ke mode terang' : 'Ubah ke mode gelap'}
      aria-label={isDark ? 'Ubah ke mode terang' : 'Ubah ke mode gelap'}
      aria-pressed={isDark}
      className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)]/80 bg-[var(--surf)]/75 text-[var(--teal)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--teal)] hover:bg-[var(--soft)]/80 active:scale-95"
    >
      <span
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      >
        <Sun className="h-[18px] w-[18px]" />
      </span>
      <span
        aria-hidden="true"
        className={`absolute transition-all duration-300 ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      >
        <Moon className="h-[18px] w-[18px]" />
      </span>
    </button>
  );
}
