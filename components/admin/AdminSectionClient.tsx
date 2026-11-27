'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';
import { AboutFactsSection } from '@/components/admin/AboutFactsSection';
import { CertificatesSection } from '@/components/admin/CertificatesSection';
import { ContactSeoForm } from '@/components/admin/ContactSeoForm';
import { CustomSectionsSection } from '@/components/admin/CustomSectionsSection';
import { ExperienceSection } from '@/components/admin/ExperienceSection';
import { ProfileHeroForm } from '@/components/admin/ProfileHeroForm';
import { ProjectsSection } from '@/components/admin/ProjectsSection';
import { PublicationsSection } from '@/components/admin/PublicationsSection';
import { SectionTextEditor } from '@/components/admin/SectionTextEditor';
import { SkillsSection } from '@/components/admin/SkillsSection';
import type { AdminSectionSlug } from '@/types/content';

export function AdminSectionClient({ section }: { section: AdminSectionSlug }) {
  const { content, loading, error, refreshContent } = useAdminContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (loading && !content)) {
    return (
      <div
        aria-busy="true"
        aria-label="Memuat data dari Google Sheets"
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="h-3.5 w-32 animate-pulse rounded bg-[var(--soft)]" />
          <div className="h-8 w-64 animate-pulse rounded-lg bg-[var(--line)]" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-3 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-5 xl:col-span-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--bg)]"
              />
            ))}
          </div>
          <div className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 xl:col-span-7">
            <div className="h-6 w-48 animate-pulse rounded bg-[var(--line)]" />
            <div className="h-11 w-full animate-pulse rounded-[var(--radius-control)] bg-[var(--bg)]" />
            <div className="h-24 w-full animate-pulse rounded-[var(--radius-control)] bg-[var(--bg)]" />
          </div>
        </div>
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
              {error || 'Pastikan konfigurasi koneksi Google Apps Script di server sudah benar.'}
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

  return (
    <div className="space-y-8">
      <SectionBody section={section} />
      {section !== 'section' && <SectionTextEditor key={section} group={section} />}
    </div>
  );
}

function SectionBody({ section }: { section: AdminSectionSlug }) {
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
    case 'section':
      return <CustomSectionsSection />;
    case 'kontak':
      return <ContactSeoForm />;
  }
}
