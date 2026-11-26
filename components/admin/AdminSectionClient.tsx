'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';
import { AboutFactsSection } from '@/components/admin/AboutFactsSection';
import { CertificatesSection } from '@/components/admin/CertificatesSection';
import { ContactSeoForm } from '@/components/admin/ContactSeoForm';
import { ExperienceSection } from '@/components/admin/ExperienceSection';
import { ProfileHeroForm } from '@/components/admin/ProfileHeroForm';
import { ProjectsSection } from '@/components/admin/ProjectsSection';
import { PublicationsSection } from '@/components/admin/PublicationsSection';
import { SkillsSection } from '@/components/admin/SkillsSection';
import type { AdminSectionSlug } from '@/types/content';

export function AdminSectionClient({ section }: { section: AdminSectionSlug }) {
  const { content, loading, error, refreshContent } = useAdminContext();

  if (loading && !content) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-8 text-sm text-[var(--mute)]">
        Memuat data dari Google Sheets…
      </div>
    );
  }

  if (!content) {
    return (
      <div
        role="alert"
        className="rounded-[var(--radius-panel)] border border-[var(--error-border)] bg-[var(--error-bg)] p-6 text-[var(--acc)]"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold">
              Gagal memuat data dari Google Sheets
            </h2>
            <p className="mt-1 text-sm">
              {error || 'Pastikan GAS_URL dan GAS_SECRET di .env.local sudah benar.'}
            </p>
            <button
              type="button"
              onClick={() => void refreshContent()}
              className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--acc-btn-hover)]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Coba Muat Ulang</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  switch (section) {
    case 'profil':
      return <ProfileHeroForm />;
    case 'tentang':
      return <AboutFactsSection />;
    case 'project':
      return <ProjectsSection />;
    case 'sertifikat':
      return <CertificatesSection />;
    case 'pengalaman':
      return <ExperienceSection />;
    case 'publikasi':
      return <PublicationsSection />;
    case 'keahlian':
      return <SkillsSection />;
    case 'kontak':
      return <ContactSeoForm />;
  }
}
