'use client';

import React, { useEffect, useState } from 'react';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { formatZodError, publicationInputSchema } from '@/lib/validation';
import type { Publication } from '@/types/content';

export interface PublicationFormPayload {
  title: string;
  venue: string;
  date: string;
  url: string;
  visible: boolean;
}

interface PublicationFormProps {
  publication: Publication | null;
  onSave: (payload: PublicationFormPayload) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  onCancelNew?: () => void;
}

export function PublicationForm({
  publication,
  onSave,
  onDirtyChange,
  onCancelNew,
}: PublicationFormProps) {
  const [title, setTitle] = useState(publication?.title ?? '');
  const [venue, setVenue] = useState(publication?.venue ?? '');
  const [date, setDate] = useState(publication?.date ?? '');
  const [url, setUrl] = useState(publication?.url ?? '');
  const [visible, setVisible] = useState(publication?.visible ?? true);

  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setTitle(publication?.title ?? '');
    setVenue(publication?.venue ?? '');
    setDate(publication?.date ?? '');
    setUrl(publication?.url ?? '');
    setVisible(publication?.visible ?? true);
    setDirty(false);
    setStatus('idle');
    setErrorMsg(null);
    onDirtyChange(false);
  }, [publication, onDirtyChange]);

  const markDirty = () => {
    setDirty(true);
    onDirtyChange(true);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = publicationInputSchema.safeParse({
      title,
      venue,
      date,
      url,
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
        err instanceof Error ? err.message : 'Gagal menyimpan publikasi.'
      );
    }
  };

  return (
    <form
      id="publication-form"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card"
      noValidate
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-[var(--ink)]">
          {publication ? 'Edit Publikasi Ilmiah' : 'Tambah Publikasi Baru'}
        </h2>
        {!publication && onCancelNew && (
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
        <label htmlFor="pub-title" className="block text-sm font-medium text-[var(--ink)]">
          Judul Publikasi
        </label>
        <textarea
          id="pub-title"
          rows={3}
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          placeholder="Judul artikel jurnal atau konferensi…"
          className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pub-venue" className="block text-sm font-medium text-[var(--ink)]">
            Jurnal / Penerbit
          </label>
          <input
            id="pub-venue"
            type="text"
            required
            value={venue}
            onChange={(e) => {
              setVenue(e.target.value);
              markDirty();
            }}
            placeholder="Contoh: JITK Vol. 11 No. 4"
            className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="pub-date" className="block text-sm font-medium text-[var(--ink)]">
            Tanggal Terbit
          </label>
          <input
            id="pub-date"
            type="text"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              markDirty();
            }}
            placeholder="Contoh: Mei 2026"
            className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pub-url" className="block text-sm font-medium text-[var(--ink)]">
          Tautan DOI / Artikel
        </label>
        <input
          id="pub-url"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            markDirty();
          }}
          placeholder="https://doi.org/..."
          className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
        />
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
          formId="publication-form"
          status={status}
          savedAt={savedAt}
          errorMessage={errorMsg}
          isDirty={dirty}
          saveLabel="Simpan Publikasi"
        />
      </div>
    </form>
  );
}
