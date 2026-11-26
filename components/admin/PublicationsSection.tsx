'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';
import {
  apiCreateItem,
  apiDeleteItem,
  apiReorderItems,
  apiUpdateItem,
} from '@/components/admin/api';
import { ItemList } from '@/components/admin/ItemList';
import {
  PublicationForm,
  type PublicationFormPayload,
} from '@/components/admin/PublicationForm';
import type { Publication } from '@/types/content';

export function PublicationsSection() {
  const { content, setContent, setIsDirty, confirmDiscardIfDirty } = useAdminContext();
  const publications = content?.publications ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(
    publications[0]?.id ?? null
  );
  const [creating, setCreating] = useState(publications.length === 0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => setIsDirty(false);
  }, [setIsDirty]);

  const selectedItem = creating
    ? null
    : publications.find((item) => item.id === selectedId) ?? null;

  const handleDirtyChange = useCallback(
    (dirty: boolean) => setIsDirty(dirty),
    [setIsDirty]
  );

  const handleSave = async (payload: PublicationFormPayload) => {
    setErrorMsg(null);
    if (creating || !selectedItem) {
      const id = await apiCreateItem('Publications', { ...payload });
      const nextOrder = publications.reduce((m, x) => Math.max(m, x.order), 0) + 1;
      const created: Publication = {
        id: id || `pub-${Date.now()}`,
        order: nextOrder,
        ...payload,
      };
      setContent((prev) =>
        prev ? { ...prev, publications: [...prev.publications, created] } : prev
      );
      setCreating(false);
      setSelectedId(created.id);
      return;
    }

    await apiUpdateItem('Publications', selectedItem.id, { ...payload });
    setContent((prev) =>
      prev
        ? {
            ...prev,
            publications: prev.publications.map((p) =>
              p.id === selectedItem.id ? { ...p, ...payload } : p
            ),
          }
        : prev
    );
  };

  const handleToggleVisible = async (item: Publication, nextVisible: boolean) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiUpdateItem('Publications', item.id, { visible: nextVisible });
      setContent((prev) =>
        prev
          ? {
              ...prev,
              publications: prev.publications.map((p) =>
                p.id === item.id ? { ...p, visible: nextVisible } : p
              ),
            }
          : prev
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengubah status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: Publication) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiDeleteItem('Publications', item.id);
      setContent((prev) =>
        prev
          ? {
              ...prev,
              publications: prev.publications.filter((p) => p.id !== item.id),
            }
          : prev
      );
      if (selectedId === item.id) {
        setSelectedId(null);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus publikasi.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= publications.length) return;

    const next = [...publications];
    const [moved] = next.splice(index, 1);
    next.splice(swapIdx, 0, moved);
    const reindexed = next.map((item, idx) => ({ ...item, order: idx + 1 }));

    setReordering(true);
    setErrorMsg(null);
    try {
      await apiReorderItems(
        'Publications',
        reindexed.map((item) => item.id)
      );
      setContent((prev) => (prev ? { ...prev, publications: reindexed } : prev));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan urutan.');
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            Manajemen Publikasi ({publications.length})
          </h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Kelola artikel jurnal ilmiah, prosiding, dan tautan DOI.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!confirmDiscardIfDirty()) return;
            setCreating(true);
            setSelectedId(null);
          }}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--acc-btn-hover)]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tambah Publikasi</span>
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

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <ItemList
          items={publications}
          selectedId={creating ? null : selectedItem?.id}
          getTitle={(item) => item.title}
          getSubtitle={(item) =>
            [item.venue, item.date].filter(Boolean).join(' · ')
          }
          onSelect={(item) => {
            if (!confirmDiscardIfDirty()) return;
            setCreating(false);
            setSelectedId(item.id);
          }}
          onToggleVisible={handleToggleVisible}
          onDelete={handleDelete}
          onMove={handleMove}
          busyId={busyId}
          reordering={reordering}
        />

        <PublicationForm
          publication={selectedItem}
          onSave={handleSave}
          onDirtyChange={handleDirtyChange}
          onCancelNew={
            creating && publications.length > 0
              ? () => {
                  setCreating(false);
                  setSelectedId(publications[0]?.id ?? null);
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
