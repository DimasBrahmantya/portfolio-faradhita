import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Compass } from 'lucide-react';
import { Navbar } from '@/components/public/Navbar';

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan (404)',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar logoText="FES" links={[]} />

      <main
        id="konten-utama"
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 sm:px-8"
      >
        <div className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surf)] p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--soft)] text-[var(--teal)]">
            <Compass className="h-6 w-6" aria-hidden="true" />
          </div>

          <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--acc)]">
            404 · HALAMAN TIDAK DITEMUKAN
          </p>

          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-[var(--ink)] sm:text-4xl">
            Tautan yang Anda cari tidak tersedia
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--mute)] sm:text-base">
            Halaman mungkin sudah dipindahkan atau alamat URL yang diketik kurang tepat. Silakan
            kembali ke halaman utama portofolio.
          </p>

          <div className="mt-7 flex justify-center">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--acc-btn)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--acc-btn-hover)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
