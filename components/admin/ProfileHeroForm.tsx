'use client';

import React, { useEffect, useState } from 'react';
import { useAdminContext } from '@/components/admin/AdminContext';
import { apiUpdateProfile } from '@/components/admin/api';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { SafeImage } from '@/components/public/SafeImage';
import { formatZodError, profileHeroSchema } from '@/lib/validation';

interface HeroFormValues {
  full_name_1: string;
  full_name_2: string;
  logo_text: string;
  role: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_photo_url: string;
}

export function ProfileHeroForm() {
  const { content, setContent, setIsDirty } = useAdminContext();
  const profile = content?.profile;

  const [values, setValues] = useState<HeroFormValues>({
    full_name_1: profile?.full_name_1 ?? '',
    full_name_2: profile?.full_name_2 ?? '',
    logo_text: profile?.logo_text ?? '',
    role: profile?.role ?? '',
    hero_cta_primary: profile?.hero_cta_primary ?? '',
    hero_cta_secondary: profile?.hero_cta_secondary ?? '',
    hero_photo_url: profile?.hero_photo_url ?? '',
  });
  const [localDirty, setLocalDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => setIsDirty(false);
  }, [setIsDirty]);

  const updateField = <K extends keyof HeroFormValues>(
    field: K,
    value: HeroFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setLocalDirty(true);
    setIsDirty(true);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = profileHeroSchema.safeParse(values);
    if (!parsed.success) {
      setStatus('error');
      setErrorMsg(formatZodError(parsed.error));
      return;
    }

    setStatus('saving');
    try {
      await apiUpdateProfile(parsed.data);
      setContent((prev) =>
        prev
          ? { ...prev, profile: { ...prev.profile, ...parsed.data } }
          : prev
      );
      setLocalDirty(false);
      setIsDirty(false);
      setStatus('saved');
      setSavedAt(formatTimeWib());
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menyimpan Profil & Hero.'
      );
    }
  };

  return (
    <form id="profile-hero-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            Profil &amp; Hero
          </h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Mengatur nama tampilan, logo teks, peran, CTA utama, dan foto portrait Hero.
          </p>
        </div>
        <SaveBar
          formId="profile-hero-form"
          status={status}
          savedAt={savedAt}
          errorMessage={errorMsg}
          isDirty={localDirty}
          saveLabel="Simpan Perubahan"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="full_name_1"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Nama Depan <span className="font-mono text-xs text-[var(--mute)]">(full_name_1)</span>
              </label>
              <input
                id="full_name_1"
                type="text"
                required
                value={values.full_name_1}
                onChange={(e) => updateField('full_name_1', e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="full_name_2"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Nama Belakang <span className="font-mono text-xs text-[var(--mute)]">(full_name_2)</span>
              </label>
              <input
                id="full_name_2"
                type="text"
                value={values.full_name_2}
                onChange={(e) => updateField('full_name_2', e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="logo_text"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Logo Teks Navbar <span className="font-mono text-xs text-[var(--mute)]">(logo_text)</span>
              </label>
              <input
                id="logo_text"
                type="text"
                required
                value={values.logo_text}
                onChange={(e) => updateField('logo_text', e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Peran / Subjudul Hero <span className="font-mono text-xs text-[var(--mute)]">(role)</span>
              </label>
              <input
                id="role"
                type="text"
                required
                value={values.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hero_cta_primary"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Tombol Utama <span className="font-mono text-xs text-[var(--mute)]">(hero_cta_primary)</span>
              </label>
              <input
                id="hero_cta_primary"
                type="text"
                value={values.hero_cta_primary}
                onChange={(e) => updateField('hero_cta_primary', e.target.value)}
                placeholder="Lihat project"
                className="mt-1.5 min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="hero_cta_secondary"
                className="block text-sm font-medium text-[var(--ink)]"
              >
                Tombol Sekunder <span className="font-mono text-xs text-[var(--mute)]">(hero_cta_secondary)</span>
              </label>
              <input
                id="hero_cta_secondary"
                type="text"
                value={values.hero_cta_secondary}
                onChange={(e) => updateField('hero_cta_secondary', e.target.value)}
                placeholder="Hubungi saya"
                className="mt-1.5 min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">
            Foto Hero <span className="font-mono text-xs font-normal text-[var(--mute)]">(hero_photo_url)</span>
          </h2>

          <div className="mt-4 overflow-hidden rounded-t-[140px] rounded-b-[var(--radius-card)] border border-[var(--line)] bg-[var(--soft)]">
            <SafeImage
              src={values.hero_photo_url}
              alt="Foto Portrait Hero"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          <div className="mt-4">
            <ImageUploader
              currentUrl={values.hero_photo_url}
              onUploaded={(url) => updateField('hero_photo_url', url)}
              buttonLabel="Ganti Foto Portrait"
              helperText="Dikompres otomatis di browser (maks 1600px, kualitas 0,82, batas 5 MB) sebelum diunggah ke Drive."
            />
          </div>

          <div className="mt-3">
            <label
              htmlFor="hero_photo_url"
              className="block text-xs font-medium text-[var(--mute)]"
            >
              URL Gambar (otomatis terisi setelah unggah)
            </label>
            <input
              id="hero_photo_url"
              type="url"
              value={values.hero_photo_url}
              onChange={(e) => updateField('hero_photo_url', e.target.value)}
              placeholder="https://..."
              className="mt-1 min-h-[38px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
