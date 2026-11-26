'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled page error:', error);
  }, [error]);

  return (
    <main
      id="konten-utama"
      className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-5 py-16 sm:px-8"
    >
      <div
        role="alert"
        className="w-full rounded-2xl border border-[var(--error-border)] bg-[var(--surf)] p-6 shadow-[var(--shadow-card)] sm:p-8"
      >
        <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--acc)]">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>TERJADI KESALAHAN</span>
        </p>

        <h1 className="mt-3 font-display text-2xl font-bold leading-snug text-[var(--ink)] sm:text-3xl">
          Halaman gagal dimuat sementara
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[var(--mute)] sm:text-base">
          Maaf, terjadi gangguan tak terduga saat menyiapkan halaman ini. Anda dapat mencoba memuat
          ulang atau kembali ke beranda.
        </p>

        {error.digest && (
          <p className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--mute)]">
            Kode referensi: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--acc-btn)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--acc-btn-hover)]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--teal)] hover:text-[var(--teal)]"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
