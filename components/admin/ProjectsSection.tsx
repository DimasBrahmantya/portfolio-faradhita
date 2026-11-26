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
  ProjectForm,
  type ProjectFormPayload,
} from '@/components/admin/ProjectForm';
import type { Project } from '@/types/content';

export function ProjectsSection() {
  const { content, setContent, setIsDirty, confirmDiscardIfDirty } = useAdminContext();
  const projects = content?.projects ?? [];

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => setIsDirty(false);
  }, [setIsDirty]);

  const editingProject =
    mode === 'edit'
      ? projects.find((item) => item.id === editingId) ?? null
      : null;

  const handleDirtyChange = useCallback(
    (dirty: boolean) => {
      setIsDirty(dirty);
    },
    [setIsDirty]
  );

  const handleSave = async (payload: ProjectFormPayload) => {
    if (mode === 'create' || !editingProject) {
      const id = await apiCreateItem('Projects', { ...payload });
      const nextOrder = projects.reduce((m, x) => Math.max(m, x.order), 0) + 1;
      const created: Project = {
        id: id || `project-${Date.now()}`,
        order: nextOrder,
        ...payload,
      };
      setContent((prev) =>
        prev ? { ...prev, projects: [...prev.projects, created] } : prev
      );
      setEditingId(created.id);
      setMode('edit');
      return;
    }

    await apiUpdateItem('Projects', editingProject.id, { ...payload });
    setContent((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.map((item) =>
              item.id === editingProject.id ? { ...item, ...payload } : item
            ),
          }
        : prev
    );
  };

  const handleToggleVisible = async (item: Project, nextVisible: boolean) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiUpdateItem('Projects', item.id, { visible: nextVisible });
      setContent((prev) =>
        prev
          ? {
              ...prev,
              projects: prev.projects.map((p) =>
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

  const handleDelete = async (item: Project) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiDeleteItem('Projects', item.id);
      setContent((prev) =>
        prev
          ? { ...prev, projects: prev.projects.filter((p) => p.id !== item.id) }
          : prev
      );
      if (editingId === item.id) {
        setEditingId(null);
        setMode('list');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus project.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= projects.length) return;

    const next = [...projects];
    const [moved] = next.splice(index, 1);
    next.splice(swapIdx, 0, moved);
    const reindexed = next.map((item, idx) => ({ ...item, order: idx + 1 }));

    setReordering(true);
    setErrorMsg(null);
    try {
      await apiReorderItems(
        'Projects',
        reindexed.map((item) => item.id)
      );
      setContent((prev) => (prev ? { ...prev, projects: reindexed } : prev));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan urutan.');
    } finally {
      setReordering(false);
    }
  };

  if (mode === 'create' || mode === 'edit') {
    return (
      <ProjectForm
        project={editingProject}
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
            Manajemen Project ({projects.length})
          </h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Kelola studi kasus data, tags perangkat, poin hasil, dan galeri gambar.
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
          <span>Tambah Project</span>
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
        items={projects}
        getTitle={(item) => item.title}
        getSubtitle={(item) =>
          `${item.tags.slice(0, 3).join(', ') || 'Tanpa tag'} · ${item.images.length} gambar · ${item.points.length} poin`
        }
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
      />
    </div>
  );
}
