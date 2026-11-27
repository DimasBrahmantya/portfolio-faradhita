'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Type } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';
import { apiUpdateProfile } from '@/components/admin/api';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { formatZodError, profileUpdateSchema } from '@/lib/validation';
import { SITE_TEXT_MAX, siteTextFieldsFor, type SiteTextGroup } from '@/lib/site-text';

export function SectionTextEditor({ group }: { group: SiteTextGroup }) {
  const { content, setContent, setIsDirty } = useAdminContext();
  const fields = useMemo(() => siteTextFieldsFor(group), [group]);
  const profile = content?.profile as Record<string, string> | undefined;

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, profile?.[f.key] ?? f.defaultValue]))
  );
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => () => setIsDirty(false, 'section-text'), [setIsDirty]);

  useEffect(() => {
    if (dirty || !profile) return;
    setValues(
      Object.fromEntries(fields.map((f) => [f.key, profile[f.key] ?? f.defaultValue]))
    );
  }, [profile, fields, dirty]);

  if (fields.length === 0) return null;

  const formId = `section-text-${group}`;

  const updateField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setIsDirty(true, 'section-text');
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = profileUpdateSchema.safeParse(values);
    if (!parsed.success) {
      setStatus('error');
      setErrorMsg(formatZodError(parsed.error));
      return;
    }

    setStatus('saving');
    try {
      await apiUpdateProfile(values);
      // Nilai kosong kembali ke teks bawaan, sama seperti yang tampil di halaman publik.
      const applied = Object.fromEntries(
        fields.map((f) => [f.key, values[f.key].trim() || f.defaultValue])
      );
      setValues(applied);
      setContent((prev) =>
        prev ? { ...prev, profile: { ...prev.profile, ...applied } } : prev
      );
      setDirty(false);
      setIsDirty(false, 'section-text');
      setStatus('saved');
      setSavedAt(formatTimeWib());
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan teks section.');
    }
  };

  return (
    <details
      open
      className="group rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] shadow-card"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5">
          <Type className="h-4 w-4 text-[var(--teal)]" aria-hidden="true" />
          <span>
            <span className="block font-display text-lg font-bold text-[var(--ink)]">
              Teks di Halaman Publik
            </span>
            <span className="block text-xs text-[var(--mute)]">
              Judul section, label, dan teks tombol untuk bagian ini.
            </span>
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-[var(--mute)] transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <form
        id={formId}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 border-t border-[var(--line)] p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => {
            const inputId = `${formId}-${field.key}`;
            const common = {
              id: inputId,
              value: values[field.key] ?? '',
              maxLength: SITE_TEXT_MAX,
              placeholder: field.defaultValue || 'Otomatis',
              onChange: (
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => updateField(field.key, e.target.value),
            };
            return (
              <div key={field.key} className={field.multiline ? 'md:col-span-2' : undefined}>
                <label htmlFor={inputId} className="block text-sm font-medium text-[var(--ink)]">
                  {field.label}
                </label>
                {field.multiline ? (
                  <textarea
                    {...common}
                    rows={2}
                    className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                  />
                ) : (
                  <input
                    {...common}
                    type="text"
                    className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                  />
                )}
                {field.hint && (
                  <p className="mt-1 text-xs text-[var(--mute)]">{field.hint}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[var(--mute)]">
            Kosongkan kolom untuk kembali ke teks bawaan.
          </p>
          <SaveBar
            formId={formId}
            status={status}
            savedAt={savedAt}
            errorMessage={errorMsg}
            isDirty={dirty}
            saveLabel="Simpan Teks"
          />
        </div>
      </form>
    </details>
  );
}
