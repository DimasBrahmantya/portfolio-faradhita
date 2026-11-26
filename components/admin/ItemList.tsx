'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { ListItemBase } from '@/types/content';
import { SafeImage } from '@/components/public/SafeImage';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export interface ItemListProps<T extends ListItemBase> {
  items: T[];
  selectedId?: string | null;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getThumbnail?: (item: T) => string;
  onSelect: (item: T) => void;
  onToggleVisible: (item: T, nextVisible: boolean) => Promise<void>;
  onDelete: (item: T) => Promise<void>;
  onMove: (index: number, direction: 'up' | 'down') => Promise<void>;
  emptyMessage?: string;
  busyId?: string | null;
  reordering?: boolean;
}

export function ItemList<T extends ListItemBase>({
  items,
  selectedId,
  getTitle,
  getSubtitle,
  getThumbnail,
  onSelect,
  onToggleVisible,
  onDelete,
  onMove,
  emptyMessage = 'Belum ada item. Klik tombol Tambah untuk membuat baru.',
  busyId = null,
  reordering = false,
}: ItemListProps<T>) {
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleHideInstead = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onToggleVisible(deleteTarget, false);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-5 shadow-card">
      <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--teal)] uppercase">
        URUTAN TAMPILAN · KLIK UNTUK EDIT
      </p>

      {items.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-[var(--bg)] p-6 text-center text-sm text-[var(--mute)]">
          {emptyMessage}
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {items.map((item, idx) => {
            const isSelected = selectedId === item.id;
            const isBusy = busyId === item.id || reordering;
            const thumb = getThumbnail ? getThumbnail(item) : '';
            const title = getTitle(item) || '(Tanpa judul)';
            const subtitle = getSubtitle ? getSubtitle(item) : '';

            return (
              <li
                key={item.id}
                className={`rounded-[var(--radius-card)] border p-3 transition-colors ${
                  isSelected
                    ? 'border-[var(--acc)] bg-[var(--error-bg)]/50'
                    : 'border-[var(--line)] bg-[var(--bg)]/60 hover:border-[var(--teal)]/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getThumbnail && (
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="h-14 w-16 shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)]"
                      aria-label={`Edit ${title}`}
                    >
                      {thumb ? (
                        <SafeImage
                          src={thumb}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center font-mono text-[10px] text-[var(--mute)]">
                          No img
                        </span>
                      )}
                    </button>
                  )}

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="block w-full text-left"
                    >
                      <p
                        className={`truncate text-sm font-semibold ${
                          item.visible
                            ? 'text-[var(--ink)]'
                            : 'text-[var(--mute)] line-through'
                        }`}
                      >
                        {idx + 1}. {title}
                      </p>
                      {subtitle && (
                        <p className="mt-0.5 truncate text-xs text-[var(--mute)]">
                          {subtitle}
                        </p>
                      )}
                    </button>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void onToggleVisible(item, !item.visible)}
                        className={`inline-flex items-center gap-1 rounded-[var(--radius-chip)] border px-2 py-1 font-medium transition-colors disabled:opacity-50 ${
                          item.visible
                            ? 'border-[var(--teal)]/30 bg-[var(--soft)] text-[var(--teal)]'
                            : 'border-[var(--line)] bg-[var(--surf)] text-[var(--mute)]'
                        }`}
                        title={
                          item.visible
                            ? 'Tampil di publik (klik untuk sembunyikan)'
                            : 'Tersembunyi dari publik (klik untuk tampilkan)'
                        }
                      >
                        {item.visible ? (
                          <>
                            <Eye className="h-3 w-3" aria-hidden="true" />
                            <span>Tampil</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" aria-hidden="true" />
                            <span>Tersembunyi</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy || idx === 0}
                        onClick={() => void onMove(idx, 'up')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-chip)] border border-[var(--line)] bg-[var(--surf)] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)] disabled:opacity-40"
                        aria-label={`Naikkan urutan ${title}`}
                        title="Naikkan urutan"
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        disabled={isBusy || idx === items.length - 1}
                        onClick={() => void onMove(idx, 'down')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-chip)] border border-[var(--line)] bg-[var(--surf)] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)] disabled:opacity-40"
                        aria-label={`Turunkan urutan ${title}`}
                        title="Turunkan urutan"
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onSelect(item)}
                        className="inline-flex items-center gap-1 rounded-[var(--radius-chip)] border border-[var(--line)] bg-[var(--surf)] px-2 py-1 font-medium text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)] disabled:opacity-50"
                      >
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center gap-1 rounded-[var(--radius-chip)] border border-[var(--line)] bg-[var(--surf)] px-2 py-1 font-medium text-[var(--acc)] hover:border-[var(--acc)] hover:bg-[var(--error-bg)] disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus item ini?"
        description={
          deleteTarget
            ? `Item "${getTitle(deleteTarget)}" dapat disembunyikan sementara dari situs publik atau dihapus permanen dari Google Sheets.`
            : ''
        }
        confirmLabel="Hapus Permanen"
        secondaryLabel={deleteTarget?.visible ? 'Sembunyikan Saja' : undefined}
        busy={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onSecondary={deleteTarget?.visible ? () => void handleHideInstead() : undefined}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
