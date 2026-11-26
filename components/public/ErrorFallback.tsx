'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  message?: string;
}

export function ErrorFallback({ message }: ErrorFallbackProps) {
  return (
    <main
      id="konten-utama"
      className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-5 py-16 sm:px-8"
    >
      <div
        role="alert"
        className="w-full rounded-2xl border border-[var(--acc)]/40 bg-[var(--error-bg)] p-6 sm:p-8"
      >
        <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--acc)]">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>[!] GANGGUAN KONEKSI DATA</span>
        </p>

        <h1 className="mt-3 font-display text-2xl font-bold text-[var(--ink)] sm:text-3xl">
          Data portofolio sedang tidak dapat dimuat
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[var(--mute)] sm:text-base">
          Koneksi ke layanan Google Sheets sedang mengalami kendala sementara. Silakan muat ulang
          halaman beberapa saat lagi.
        </p>

        {message && (
          <p className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--surf)] px-3 py-2 font-mono text-xs text-[var(--mute)]">
            {message}
          </p>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--acc-btn)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--acc-btn-hover)]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Muat Ulang Data</span>
          </button>
        </div>
      </div>
    </main>
  );
}
