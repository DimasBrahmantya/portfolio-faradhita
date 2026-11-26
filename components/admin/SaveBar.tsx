'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveBarProps {
  status: SaveStatus;
  savedAt?: string | null;
  errorMessage?: string | null;
  isDirty?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  formId?: string;
  disabled?: boolean;
}

export function SaveBar({
  status,
  savedAt,
  errorMessage,
  isDirty = false,
  onSave,
  saveLabel = 'Simpan Perubahan',
  formId,
  disabled = false,
}: SaveBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === 'saving' && (
        <span
          role="status"
          aria-live="polite"
          className="inline-flex min-h-[38px] items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-3.5 py-1.5 text-xs font-medium text-[var(--mute)]"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--teal)]" aria-hidden="true" />
          <span>Menyimpan…</span>
        </span>
      )}

      {status === 'saved' && !isDirty && (
        <span
          role="status"
          aria-live="polite"
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--success-border)]/30 bg-[var(--success-bg)] px-3.5 py-1.5 text-xs font-medium text-[var(--teal)]"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{savedAt ? `Tersimpan · ${savedAt}` : 'Tersimpan'}</span>
        </span>
      )}

      {status === 'error' && (
        <span
          role="alert"
          className="inline-flex min-h-[38px] max-w-xs items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--error-border)] bg-[var(--error-bg)] px-3.5 py-1.5 text-xs font-medium text-[var(--acc)]"
          title={errorMessage || 'Gagal menyimpan'}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{errorMessage || 'Gagal menyimpan'}</span>
        </span>
      )}

      {isDirty && status !== 'saving' && (
        <span className="inline-flex min-h-[38px] items-center rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-3 py-1.5 text-xs font-medium text-[var(--mute)]">
          Belum disimpan
        </span>
      )}

      <button
        type={formId ? 'submit' : 'button'}
        form={formId}
        onClick={formId ? undefined : onSave}
        disabled={disabled || status === 'saving'}
        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--acc-btn-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'saving' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Menyimpan…</span>
          </>
        ) : (
          saveLabel
        )}
      </button>
    </div>
  );
}

export function formatTimeWib(date = new Date()): string {
  try {
    const formatted = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
    return `${formatted} WIB`;
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}
