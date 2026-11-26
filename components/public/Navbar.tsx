'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export interface NavLinkItem {
  id: string;
  label: string;
}

interface NavbarProps {
  logoText: string;
  links: NavLinkItem[];
}

export function Navbar({ logoText, links }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 18);

      if (links.length === 0) return;

      // If near the bottom of the page, highlight the last section (e.g. Kontak)
      const docHeight = document.documentElement.scrollHeight;
      if (window.innerHeight + scrollY >= docHeight - 60) {
        setActiveId(links[links.length - 1].id);
        return;
      }

      // Trigger point below the sticky glass navbar
      const triggerOffset = 150;
      let currentActive = '';

      for (const link of links) {
        const el = document.getElementById(link.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerOffset) {
          currentActive = link.id;
        }
      }

      setActiveId(currentActive);
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateScrollState();
      });
    };

    updateScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [links]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--surf)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[var(--ink)] focus:shadow-lg"
      >
        Lewati ke konten utama
      </a>

      <div
        className={`glass-navbar mx-auto max-w-6xl rounded-2xl border transition-all duration-300 ${
          scrolled ? 'glass-navbar-scrolled' : 'shadow-xs'
        }`}
      >
        <div className="flex h-[64px] items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#beranda"
            onClick={() => setActiveId('')}
            className="inline-flex min-h-[44px] items-center font-display text-xl font-extrabold tracking-tight text-[var(--ink)] transition-colors hover:text-[var(--acc)]"
            aria-label={`${logoText || 'Beranda'} — kembali ke atas`}
          >
            {logoText || 'FES'}
          </a>

          {links.length > 0 && (
            <nav aria-label="Navigasi utama" className="hidden md:block">
              <ul className="flex items-center gap-1">
                {links.map((link) => {
                  const isActive = activeId === link.id;
                  return (
                    <li key={link.id}>
                      <a
                        href={`#${link.id}`}
                        onClick={() => setActiveId(link.id)}
                        aria-current={isActive ? 'location' : undefined}
                        className={`relative inline-flex min-h-[40px] items-center rounded-full px-3.5 py-1.5 text-sm transition-all duration-300 ${
                          isActive
                            ? 'bg-[var(--soft)] font-semibold text-[var(--teal)] shadow-[0_0_16px_rgba(11,97,104,0.18)]'
                            : 'font-medium text-[var(--mute)] hover:bg-[var(--surf)]/60 hover:text-[var(--ink)]'
                        }`}
                      >
                        <span>{link.label}</span>
                        <span
                          aria-hidden="true"
                          className={`absolute bottom-1 left-1/2 h-1 -translate-x-1/2 rounded-full bg-[var(--teal)] transition-all duration-300 ${
                            isActive ? 'w-4 opacity-100' : 'w-0 opacity-0'
                          }`}
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {links.length > 0 && (
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)]/80 bg-[var(--surf)]/75 text-[var(--ink)] backdrop-blur-md transition-colors hover:border-[var(--teal)] md:hidden"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>

        {menuOpen && links.length > 0 && (
          <nav
            id="mobile-nav-menu"
            aria-label="Navigasi seluler"
            className="animate-nav-slide-down border-t border-[var(--line)]/60 px-4 py-3 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {links.map((link) => {
                const isActive = activeId === link.id;
                return (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={() => {
                        setActiveId(link.id);
                        setMenuOpen(false);
                      }}
                      aria-current={isActive ? 'location' : undefined}
                      className={`flex min-h-[44px] items-center justify-between rounded-xl px-3.5 text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[var(--soft)] font-semibold text-[var(--teal)]'
                          : 'text-[var(--ink)] hover:bg-[var(--surf)]/70'
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_8px_var(--teal)]"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
