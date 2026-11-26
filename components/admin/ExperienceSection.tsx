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
import {
  ExperienceForm,
  type ExperienceFormPayload,
} from '@/components/admin/ExperienceForm';
import { ItemList } from '@/components/admin/ItemList';
import type { Experience, ExperienceType } from '@/types/content';

const TYPE_LABEL: Record<ExperienceType, string> = {
  work: 'Pekerjaan',
  education: 'Pendidikan',
  training: 'Pelatihan',
};

export function ExperienceSection() {
  const { content, setContent, setIsDirty, confirmDiscardIfDirty } = useAdminContext();
  const experiences = content?.experience ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(
    experiences[0]?.id ?? null
  );
  const [creating, setCreating] = useState(experiences.length === 0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => setIsDirty(false);
  }, [setIsDirty]);

  const selectedItem = creating
    ? null
    : experiences.find((item) => item.id === selectedId) ?? null;

  const handleDirtyChange = useCallback(
    (dirty: boolean) => setIsDirty(dirty),
    [setIsDirty]
  );

  const handleSave = async (payload: ExperienceFormPayload) => {
    setErrorMsg(null);
    if (creating || !selectedItem) {
      const id = await apiCreateItem('Experience', { ...payload });
      const nextOrder = experiences.reduce((m, x) => Math.max(m, x.order), 0) + 1;
      const created: Experience = {
        id: id || `exp-${Date.now()}`,
        order: nextOrder,
        ...payload,
      };
      setContent((prev) =>
        prev ? { ...prev, experience: [...prev.experience, created] } : prev
      );
      setCreating(false);
      setSelectedId(created.id);
      return;
    }

    await apiUpdateItem('Experience', selectedItem.id, { ...payload });
    setContent((prev) =>
      prev
        ? {
            ...prev,
            experience: prev.experience.map((e) =>
              e.id === selectedItem.id ? { ...e, ...payload } : e
            ),
          }
        : prev
    );
  };

  const handleToggleVisible = async (item: Experience, nextVisible: boolean) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiUpdateItem('Experience', item.id, { visible: nextVisible });
      setContent((prev) =>
        prev
          ? {
              ...prev,
              experience: prev.experience.map((e) =>
                e.id === item.id ? { ...e, visible: nextVisible } : e
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

  const handleDelete = async (item: Experience) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiDeleteItem('Experience', item.id);
      setContent((prev) =>
        prev
          ? {
              ...prev,
              experience: prev.experience.filter((e) => e.id !== item.id),
            }
          : prev
      );
      if (selectedId === item.id) {
        setSelectedId(null);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus pengalaman.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= experiences.length) return;

    const next = [...experiences];
    const [moved] = next.splice(index, 1);
    next.splice(swapIdx, 0, moved);
    const reindexed = next.map((item, idx) => ({ ...item, order: idx + 1 }));

    setReordering(true);
    setErrorMsg(null);
    try {
      await apiReorderItems(
        'Experience',
        reindexed.map((item) => item.id)
      );
      setContent((prev) => (prev ? { ...prev, experience: reindexed } : prev));
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
            Manajemen Pengalaman ({experiences.length})
          </h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Kelola riwayat pekerjaan, magang, pendidikan, dan pelatihan pada timeline.
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
          <span>Tambah Pengalaman</span>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <ItemList
          items={experiences}
          selectedId={creating ? null : selectedItem?.id}
          getTitle={(item) => item.title}
          getSubtitle={(item) => `${TYPE_LABEL[item.type]} · ${item.period}`}
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

        <ExperienceForm
          experience={selectedItem}
          onSave={handleSave}
          onDirtyChange={handleDirtyChange}
          onCancelNew={
            creating && experiences.length > 0
              ? () => {
                  setCreating(false);
                  setSelectedId(experiences[0]?.id ?? null);
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
