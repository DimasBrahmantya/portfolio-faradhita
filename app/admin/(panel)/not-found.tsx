import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function AdminNotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-8 text-center shadow-[var(--shadow-card)]">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--soft)] text-[var(--teal)]">
        <FileQuestion className="h-6 w-6" aria-hidden="true" />
      </div>

      <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--acc)]">
        404 · SECTION TIDAK DITEMUKAN
      </p>

      <h1 className="mt-2 font-display text-2xl font-bold text-[var(--ink)]">
        Menu editor tidak dikenali
      </h1>

      <p className="mt-2 text-sm leading-relaxed text-[var(--mute)]">
        Pilih salah satu menu di sidebar atau kembali ke bagian Profil &amp; Hero.
      </p>

      <div className="mt-6 flex justify-center">
        <Link
          href="/admin/profil"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--acc-btn-hover)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Ke Profil &amp; Hero</span>
        </Link>
      </div>
    </div>
  );
}
