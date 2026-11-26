'use client';

import React, { useEffect, useState } from 'react';
import { useAdminContext } from '@/components/admin/AdminContext';
import { apiUpdateProfile } from '@/components/admin/api';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { SafeImage } from '@/components/public/SafeImage';
import { formatZodError, profileContactSeoSchema } from '@/lib/validation';

interface ContactSeoValues {
  contact_intro: string;
  whatsapp_url: string;
  linkedin_url: string;
  email: string;
  location: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
}

export function ContactSeoForm() {
  const { content, setContent, setIsDirty } = useAdminContext();
  const profile = content?.profile;

  const [values, setValues] = useState<ContactSeoValues>({
    contact_intro: profile?.contact_intro ?? '',
    whatsapp_url: profile?.whatsapp_url ?? '',
    linkedin_url: profile?.linkedin_url ?? '',
    email: profile?.email ?? '',
    location: profile?.location ?? '',
    meta_title: profile?.meta_title ?? '',
    meta_description: profile?.meta_description ?? '',
    og_image_url: profile?.og_image_url ?? '',
  });
  const [localDirty, setLocalDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => setIsDirty(false);
  }, [setIsDirty]);

  const updateField = <K extends keyof ContactSeoValues>(
    field: K,
    value: ContactSeoValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setLocalDirty(true);
    setIsDirty(true);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = profileContactSeoSchema.safeParse(values);
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
        err instanceof Error ? err.message : 'Gagal menyimpan Kontak & SEO.'
      );
    }
  };

  return (
    <form id="contact-seo-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            Kontak &amp; SEO
          </h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Atur tautan kontak, lokasi di footer, serta metadata SEO dan Open Graph.
          </p>
        </div>
        <SaveBar
          formId="contact-seo-form"
          status={status}
          savedAt={savedAt}
          errorMessage={errorMsg}
          isDirty={localDirty}
          saveLabel="Simpan Perubahan"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kontak */}
        <div className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            Informasi Kontak
          </h2>

          <div>
            <label htmlFor="contact_intro" className="block text-sm font-medium text-[var(--ink)]">
              Teks Ajakan Kontak <span className="font-mono text-xs text-[var(--mute)]">(contact_intro)</span>
            </label>
            <textarea
              id="contact_intro"
              rows={3}
              value={values.contact_intro}
              onChange={(e) => updateField('contact_intro', e.target.value)}
              className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="whatsapp_url" className="block text-sm font-medium text-[var(--ink)]">
              URL WhatsApp <span className="font-mono text-xs text-[var(--mute)]">(whatsapp_url)</span>
            </label>
            <input
              id="whatsapp_url"
              type="url"
              value={values.whatsapp_url}
              onChange={(e) => updateField('whatsapp_url', e.target.value)}
              placeholder="https://wa.me/628..."
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium text-[var(--ink)]">
              URL LinkedIn <span className="font-mono text-xs text-[var(--mute)]">(linkedin_url)</span>
            </label>
            <input
              id="linkedin_url"
              type="url"
              value={values.linkedin_url}
              onChange={(e) => updateField('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--ink)]">
              Email <span className="font-mono text-xs text-[var(--mute)]">(email)</span>
            </label>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="nama@email.com"
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[var(--ink)]">
              Lokasi Footer <span className="font-mono text-xs text-[var(--mute)]">(location)</span>
            </label>
            <input
              id="location"
              type="text"
              value={values.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Jombang, Jawa Timur"
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>
        </div>

        {/* SEO */}
        <div className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            SEO &amp; Open Graph
          </h2>

          <div>
            <label htmlFor="meta_title" className="block text-sm font-medium text-[var(--ink)]">
              Judul Halaman / Meta Title <span className="font-mono text-xs text-[var(--mute)]">(meta_title)</span>
            </label>
            <input
              id="meta_title"
              type="text"
              value={values.meta_title}
              onChange={(e) => updateField('meta_title', e.target.value)}
              placeholder="Faradhita Eka Septiana – Portofolio Data"
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="meta_description" className="block text-sm font-medium text-[var(--ink)]">
              Meta Description <span className="font-mono text-xs text-[var(--mute)]">(meta_description)</span>
            </label>
            <textarea
              id="meta_description"
              rows={3}
              value={values.meta_description}
              onChange={(e) => updateField('meta_description', e.target.value)}
              placeholder="Deskripsi singkat portofolio untuk mesin pencari dan pratinjau tautan."
              className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--mute)]">
              {values.meta_description.length} / 320 karakter (ideal 120–160)
            </p>
          </div>

          <div>
            <label htmlFor="og_image_url" className="block text-sm font-medium text-[var(--ink)]">
              Gambar Pratinjau Social / OG Image <span className="font-mono text-xs text-[var(--mute)]">(og_image_url)</span>
            </label>
            {values.og_image_url && (
              <div className="mt-2 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)]">
                <SafeImage
                  src={values.og_image_url}
                  alt="Pratinjau OG Image"
                  className="aspect-[1200/630] w-full object-cover"
                />
              </div>
            )}
            <div className="mt-2.5">
              <ImageUploader
                currentUrl={values.og_image_url}
                onUploaded={(url) => updateField('og_image_url', url)}
                buttonLabel="Unggah Gambar OG (1200×630)"
              />
            </div>
            <input
              id="og_image_url"
              type="url"
              value={values.og_image_url}
              onChange={(e) => updateField('og_image_url', e.target.value)}
              placeholder="https://..."
              className="mt-2 min-h-[38px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
