'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, EyeOff, Loader2, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  secondaryLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onSecondary?: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Hapus Permanen',
  secondaryLabel,
  busy = false,
  onConfirm,
  onSecondary,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6"
    >
      <div className="w-full max-w-md rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-dialog">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--error-bg)] text-[var(--acc)]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="confirm-dialog-title"
              className="font-display text-lg font-bold text-[var(--ink)]"
            >
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--mute)]">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex min-h-[40px] items-center justify-center rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] disabled:opacity-60"
          >
            Batal
          </button>

          {secondaryLabel && onSecondary && (
            <button
              type="button"
              disabled={busy}
              onClick={onSecondary}
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--teal)] bg-[var(--soft)] px-4 py-2 text-sm font-semibold text-[var(--teal)] hover:bg-[var(--teal)]/15 disabled:opacity-60"
            >
              <EyeOff className="h-4 w-4" aria-hidden="true" />
              <span>{secondaryLabel}</span>
            </button>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--acc-btn-hover)] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
