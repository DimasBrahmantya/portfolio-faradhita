'use client';

import React, { useEffect, useState } from 'react';
import { formatZodError, factInputSchema } from '@/lib/validation';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import type { Fact } from '@/types/content';

interface FactFormProps {
  fact: Fact | null;
  onSave: (payload: { value: string; label: string; visible: boolean }) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  onCancelNew?: () => void;
}

export function FactForm({
  fact,
  onSave,
  onDirtyChange,
  onCancelNew,
}: FactFormProps) {
  const [value, setValue] = useState(fact?.value ?? '');
  const [label, setLabel] = useState(fact?.label ?? '');
  const [visible, setVisible] = useState(fact?.visible ?? true);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setValue(fact?.value ?? '');
    setLabel(fact?.label ?? '');
    setVisible(fact?.visible ?? true);
    setDirty(false);
    setStatus('idle');
    setErrorMsg(null);
    onDirtyChange(false);
  }, [fact, onDirtyChange]);

  const markDirty = () => {
    setDirty(true);
    onDirtyChange(true);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = factInputSchema.safeParse({ value, label, visible });
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
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan fakta.');
    }
  };

  return (
    <form
      id="fact-form"
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-5 shadow-card"
      noValidate
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-[var(--ink)]">
          {fact ? 'Edit Fakta Angka' : 'Tambah Fakta Baru'}
        </h3>
        {!fact && onCancelNew && (
          <button
            type="button"
            onClick={onCancelNew}
            className="text-xs font-medium text-[var(--mute)] hover:text-[var(--ink)]"
          >
            Batal
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="fact-value" className="block text-sm font-medium text-[var(--ink)]">
            Angka / Nilai
          </label>
          <input
            id="fact-value"
            type="text"
            required
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              markDirty();
            }}
            placeholder="Contoh: 3,88"
            className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="fact-label" className="block text-sm font-medium text-[var(--ink)]">
            Keterangan / Label
          </label>
          <input
            id="fact-label"
            type="text"
            required
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              markDirty();
            }}
            placeholder="Contoh: IPK dari 4,00"
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
            formId="fact-form"
            status={status}
            savedAt={savedAt}
            errorMessage={errorMsg}
            isDirty={dirty}
            saveLabel={fact ? 'Simpan Fakta' : 'Tambah Fakta'}
          />
        </div>
      </div>
    </form>
  );
}
