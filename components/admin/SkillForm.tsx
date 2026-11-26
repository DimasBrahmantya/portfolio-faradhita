'use client';

import React, { useEffect, useState } from 'react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { SafeImage } from '@/components/public/SafeImage';
import { formatZodError, skillInputSchema } from '@/lib/validation';
import type { Skill } from '@/types/content';

export interface SkillFormPayload {
  name: string;
  icon_url: string;
  visible: boolean;
}

interface SkillFormProps {
  skill: Skill | null;
  onSave: (payload: SkillFormPayload) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  onCancelNew?: () => void;
}

export function SkillForm({
  skill,
  onSave,
  onDirtyChange,
  onCancelNew,
}: SkillFormProps) {
  const [name, setName] = useState(skill?.name ?? '');
  const [iconUrl, setIconUrl] = useState(skill?.icon_url ?? '');
  const [visible, setVisible] = useState(skill?.visible ?? true);

  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(skill?.name ?? '');
    setIconUrl(skill?.icon_url ?? '');
    setVisible(skill?.visible ?? true);
    setDirty(false);
    setStatus('idle');
    setErrorMsg(null);
    onDirtyChange(false);
  }, [skill, onDirtyChange]);

  const markDirty = () => {
    setDirty(true);
    onDirtyChange(true);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = skillInputSchema.safeParse({
      name,
      icon_url: iconUrl,
      visible,
    });
    if (!parsed.success) {
      setStatus('error');
      setErrorMsg(formatZodError(parsed.error));
      return;
    }

    setStatus('saving');
    try {
      await onSave(parsed.data);
      setDirty(false);
      onDirtyChange(false);
      setStatus('saved');
      setSavedAt(formatTimeWib());
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menyimpan keahlian.'
      );
    }
  };

  return (
    <form
      id="skill-form"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card"
      noValidate
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-[var(--ink)]">
          {skill ? 'Edit Keahlian' : 'Tambah Keahlian Baru'}
        </h2>
        {!skill && onCancelNew && (
          <button
            type="button"
            onClick={onCancelNew}
            className="text-xs font-medium text-[var(--mute)] hover:text-[var(--ink)]"
          >
            Batal
          </button>
        )}
      </div>

      <div>
        <label htmlFor="skill-name" className="block text-sm font-medium text-[var(--ink)]">
          Nama Perangkat / Keahlian
        </label>
        <input
          id="skill-name"
          type="text"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            markDirty();
          }}
          placeholder="Contoh: Python, Google Looker Studio, Microsoft Excel"
          className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="skill-icon-url" className="block text-sm font-medium text-[var(--ink)]">
          URL Ikon (opsional)
        </label>
        <p className="mt-0.5 text-xs text-[var(--mute)]">
          Kosongkan untuk menggunakan ikon bawaan otomatis atau tampilan teks bersih.
        </p>

        {iconUrl && (
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--bg)] p-1.5">
              <SafeImage
                src={iconUrl}
                alt={name || 'Ikon keahlian'}
                className="h-full w-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIconUrl('');
                markDirty();
              }}
              className="text-xs font-medium text-[var(--acc)] hover:underline"
            >
              Hapus ikon kustom
            </button>
          </div>
        )}

        <input
          id="skill-icon-url"
          type="url"
          value={iconUrl}
          onChange={(e) => {
            setIconUrl(e.target.value);
            markDirty();
          }}
          placeholder="https://..."
          className="mt-2 min-h-[40px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
        />

        <div className="mt-2.5">
          <ImageUploader
            currentUrl={iconUrl}
            onUploaded={(url) => {
              setIconUrl(url);
              markDirty();
            }}
            buttonLabel="Atau Unggah Ikon ke Drive"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-[var(--ink)]">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => {
            setVisible(e.target.checked);
            markDirty();
          }}
          className="h-4 w-4 accent-[var(--teal)]"
        />
        <span>Tampilkan di halaman publik</span>
      </label>

      <div className="pt-2">
        <SaveBar
          formId="skill-form"
          status={status}
          savedAt={savedAt}
          errorMessage={errorMsg}
          isDirty={dirty}
          saveLabel="Simpan Keahlian"
        />
      </div>
    </form>
  );
}
