'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { formatZodError, loginSchema } from '@/lib/validation';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ password });
    if (!parsed.success) {
      setError(formatZodError(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || 'Login gagal. Periksa kembali password Anda.');
        setSubmitting(false);
        return;
      }

      const nextPath = searchParams.get('next');
      const safeNext =
        nextPath && nextPath.startsWith('/admin') && !nextPath.startsWith('/admin/login')
          ? nextPath
          : '/admin/profil';

      router.replace(safeNext);
      router.refresh();
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi beberapa saat.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="w-full max-w-[460px] rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-8 shadow-elevated sm:p-10">
        <p className="font-mono text-xs font-medium tracking-[0.12em] text-[var(--teal)] uppercase">
          FES · PANEL EDITOR ADMIN
        </p>

        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
          Masuk ke Editor Portofolio
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[var(--mute)]">
          Perubahan konten disimpan ke Google Sheets dan otomatis memperbarui
          halaman publik melalui ISR.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-[var(--ink)]"
            >
              Password Owner
            </label>
            <div className="relative mt-2">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                placeholder="Masukkan password admin"
                className="min-h-[44px] w-full rounded-[var(--radius-control)] border-2 border-[var(--teal)] bg-[var(--input-bg)] py-2.5 pr-28 pl-3.5 text-sm text-[var(--ink)] placeholder:text-[var(--mute)]/70 focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 inline-flex min-h-[36px] -translate-y-1/2 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-[var(--teal)] hover:bg-[var(--soft)]"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Sembunyikan</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tampilkan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--acc-btn-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Memverifikasi…</span>
              </>
            ) : (
              'Masuk ke Dashboard'
            )}
          </button>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-[var(--radius-control)] border border-[var(--error-border)] bg-[var(--error-bg)] px-3.5 py-3 text-xs leading-relaxed text-[var(--acc)]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <p className="mt-6 font-mono text-[11px] text-[var(--mute)]">
          Sesi cookie httpOnly · HMAC 7 hari · noindex aktif
        </p>
      </div>
    </div>
  );
}
