'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';
import { apiUpdateProfile } from '@/components/admin/api';
import {
  CustomSectionForm,
  PLACEMENT_OPTIONS,
  type CustomSectionFormPayload,
} from '@/components/admin/CustomSectionForm';
import { ItemList } from '@/components/admin/ItemList';
import type { CustomSection } from '@/types/content';

const PLACEMENT_LABEL = Object.fromEntries(
  PLACEMENT_OPTIONS.map((o) => [o.value, o.label])
);

export function CustomSectionsSection() {
  const { content, setContent, setIsDirty, confirmDiscardIfDirty } = useAdminContext();
  const sections = content?.custom_sections ?? [];

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => () => setIsDirty(false), [setIsDirty]);

  const editingSection =
    mode === 'edit' ? sections.find((item) => item.id === editingId) ?? null : null;

  const handleDirtyChange = useCallback(
    (dirty: boolean) => setIsDirty(dirty),
    [setIsDirty]
  );

  const persistSections = async (next: CustomSection[]) => {
    const normalized = next.map((item, idx) => ({ ...item, order: idx + 1 }));
    await apiUpdateProfile({ custom_sections: JSON.stringify(normalized) });
    setContent((prev) => (prev ? { ...prev, custom_sections: normalized } : prev));
    return normalized;
  };

  const handleSave = async (payload: CustomSectionFormPayload) => {
    if (mode === 'create' || !editingSection) {
      const id = `sec-${Date.now().toString(36)}`;
      const created: CustomSection = {
        id,
        order: sections.length + 1,
        ...payload,
      };
      await persistSections([...sections, created]);
      setEditingId(id);
      setMode('edit');
      return;
    }

    const updated = sections.map((item) =>
      item.id === editingSection.id ? { ...item, ...payload } : item
    );
    await persistSections(updated);
  };

  const handleToggleVisible = async (item: CustomSection, nextVisible: boolean) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      const next = sections.map((s) =>
        s.id === item.id ? { ...s, visible: nextVisible } : s
      );
      await persistSections(next);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengubah status tampil.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: CustomSection) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      const next = sections.filter((s) => s.id !== item.id);
      await persistSections(next);
      if (editingId === item.id) {
        setEditingId(null);
        setMode('list');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus section.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sections.length) return;

    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(swapIdx, 0, moved);

    setReordering(true);
    setErrorMsg(null);
    try {
      await persistSections(next);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan urutan.');
    } finally {
      setReordering(false);
    }
  };

  if (mode === 'create' || mode === 'edit') {
    return (
      <CustomSectionForm
        section={editingSection}
        onSave={handleSave}
        onBack={() => {
          if (!confirmDiscardIfDirty()) return;
          setMode('list');
          setEditingId(null);
        }}
        onDirtyChange={handleDirtyChange}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            Section Kustom ({sections.length})
          </h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Tambahkan section baru di halaman publik (mis. Prestasi, Organisasi, Layanan, Testimoni).
            Otomatis muncul di halaman dan menu navigasi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setMode('create');
          }}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--acc-btn-hover)]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tambah Section</span>
        </button>
      </div>

      {errorMsg && (
        <p
          role="alert"
          className="rounded-[var(--radius-control)] border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-2.5 text-sm text-[var(--acc)]"
        >
          {errorMsg}
        </p>
      )}

      <ItemList
        items={sections}
        getTitle={(item) => item.heading}
        getSubtitle={(item) => {
          const pos = PLACEMENT_LABEL[item.placement] || item.placement;
          const nav = item.show_in_nav ? `Nav: ${item.nav_label || item.heading}` : 'Tanpa menu nav';
          return `${pos} · ${nav} · ${item.items.length} kartu · ${item.images.length} gambar`;
        }}
        getThumbnail={(item) => item.images[0]?.url ?? ''}
        onSelect={(item) => {
          setEditingId(item.id);
          setMode('edit');
        }}
        onToggleVisible={handleToggleVisible}
        onDelete={handleDelete}
        onMove={handleMove}
        busyId={busyId}
        reordering={reordering}
        emptyMessage="Belum ada section kustom. Klik 'Tambah Section' untuk menambahkan bagian baru di halaman publik."
      />
    </div>
  );
}
