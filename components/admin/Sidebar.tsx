'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award,
  BookOpen,
  Briefcase,
  ExternalLink,
  FolderKanban,
  Globe,
  LogOut,
  Menu,
  Sparkles,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';
import { ThemeToggle } from '@/components/public/ThemeToggle';
import type { AdminSectionSlug } from '@/types/content';

interface NavItem {
  slug: AdminSectionSlug;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: 'projects' | 'certificates' | 'experience' | 'publications' | 'skills';
}

const NAV_ITEMS: NavItem[] = [
  { slug: 'profil', label: 'Profil & Hero', icon: User },
  { slug: 'tentang', label: 'Tentang & Fakta', icon: UserCheck },
  { slug: 'project', label: 'Project', icon: FolderKanban, countKey: 'projects' },
  { slug: 'sertifikat', label: 'Sertifikat', icon: Award, countKey: 'certificates' },
  { slug: 'pengalaman', label: 'Pengalaman', icon: Briefcase, countKey: 'experience' },
  { slug: 'publikasi', label: 'Publikasi', icon: BookOpen, countKey: 'publications' },
  { slug: 'keahlian', label: 'Keahlian', icon: Sparkles, countKey: 'skills' },
  { slug: 'kontak', label: 'Kontak & SEO', icon: Globe },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { content, confirmDiscardIfDirty } = useAdminContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (pathname === href) {
      setMobileOpen(false);
      return;
    }
    if (!confirmDiscardIfDirty()) {
      event.preventDefault();
      return;
    }
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    if (!confirmDiscardIfDirty()) return;
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  const renderSidebarInner = () => (
    <div className="flex h-full flex-col justify-between bg-[var(--surf)] p-5">
      <div>
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
              {content?.profile.logo_text || 'FES'} Admin
            </p>
            <p className="mt-0.5 font-mono text-[10px] tracking-[0.12em] text-[var(--mute)] uppercase">
              PORTFOLIO V2 CMS
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink)] lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Navigasi Admin" className="mt-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const href = `/admin/${item.slug}`;
            const isActive =
              pathname === href ||
              (item.slug === 'profil' && pathname === '/admin');
            const count =
              item.countKey && content ? content[item.countKey].length : null;
            const Icon = item.icon;

            return (
              <Link
                key={item.slug}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[42px] items-center justify-between rounded-[var(--radius-control)] border px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-[var(--acc)] bg-[var(--error-bg)] text-[var(--acc)]'
                    : 'border-transparent text-[var(--ink)] hover:bg-[var(--bg)] hover:text-[var(--teal)]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {count !== null && (
                  <span
                    className={`font-mono text-xs ${
                      isActive ? 'text-[var(--acc)]' : 'text-[var(--mute)]'
                    }`}
                  >
                    ({count})
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-2 border-t border-[var(--line)] pt-4">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs text-[var(--mute)]">Tema</span>
          <ThemeToggle />
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--ink)]/30 bg-[var(--bg)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--teal)] hover:text-[var(--teal)]"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          <span>Lihat Situs Publik</span>
        </a>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-3 py-2 text-sm font-medium text-[var(--acc)] transition-colors hover:border-[var(--acc)] hover:bg-[var(--error-bg)] disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>{loggingOut ? 'Keluar…' : 'Keluar'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surf)] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink)]"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <p className="font-display text-lg font-bold leading-tight text-[var(--ink)]">
              {content?.profile.logo_text || 'FES'} Admin
            </p>
            <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--mute)] uppercase">
              PORTFOLIO V2 CMS
            </p>
          </div>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 text-xs font-medium text-[var(--ink)]"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Situs</span>
        </a>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-[272px] max-w-[85vw] border-r border-[var(--line)] bg-[var(--surf)] shadow-dialog">
            {renderSidebarInner()}
          </aside>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block lg:w-[264px] lg:border-r lg:border-[var(--line)]">
        {renderSidebarInner()}
      </aside>
    </>
  );
}
