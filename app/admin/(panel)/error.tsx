'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin panel error:', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto max-w-2xl rounded-[var(--radius-panel)] border border-[var(--error-border)] bg-[var(--error-bg)] p-6 text-[var(--ink)] sm:p-8"
    >
      <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--acc)]">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>KESALAHAN PANEL ADMIN</span>
      </p>

      <h1 className="mt-3 font-display text-2xl font-bold leading-snug text-[var(--ink)]">
        Bagian editor ini gagal ditampilkan
      </h1>

      <p className="mt-2 text-sm leading-relaxed text-[var(--mute)]">
        Data di Google Sheets Anda tetap aman. Coba muat ulang bagian ini atau kembali ke menu
        Profil &amp; Hero.
      </p>

      {error.digest && (
        <p className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--surf)] px-3 py-2 font-mono text-xs text-[var(--mute)]">
          Kode referensi: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--acc-btn-hover)]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Coba Lagi</span>
        </button>

        <Link
          href="/admin/profil"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-5 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--teal)] hover:text-[var(--teal)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Profil</span>
        </Link>
      </div>
    </div>
  );
}
