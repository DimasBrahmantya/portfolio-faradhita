import React from 'react';
import { FolderOpen } from 'lucide-react';

export function EmptyState() {
  return (
    <section
      aria-labelledby="empty-state-heading"
      className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surf)] p-8 text-center sm:p-10">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--soft)] text-[var(--teal)]">
          <FolderOpen className="h-6 w-6" aria-hidden="true" />
        </div>

        <p className="mt-4 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--teal)]">
          KONTEN SEDANG DISIAPKAN
        </p>

        <h2
          id="empty-state-heading"
          className="mt-2 font-display text-2xl font-bold text-[var(--ink)] sm:text-3xl"
        >
          Belum ada bagian portofolio yang ditampilkan
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--mute)] sm:text-base">
          Portofolio ini sedang dalam tahap pembaruan konten. Silakan kunjungi kembali beberapa saat
          lagi untuk melihat studi kasus, sertifikat, dan pengalaman terbaru.
        </p>
      </div>
    </section>
  );
}
