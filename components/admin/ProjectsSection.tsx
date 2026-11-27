'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';
import {
  apiCreateItem,
  apiUpdateItem,
} from '@/components/admin/api';
import { ItemList } from '@/components/admin/ItemList';
import {
  ProjectForm,
  type ProjectFormPayload,
} from '@/components/admin/ProjectForm';
import { useSheetListActions } from '@/components/admin/useSheetListActions';
import type { Project } from '@/types/content';

export function ProjectsSection() {
  const { content, setContent, setIsDirty, confirmDiscardIfDirty } = useAdminContext();
  const projects = content?.projects ?? [];

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const {
    busyId,
    reordering,
    errorMsg,
    handleToggleVisible,
    handleDelete,
    handleMove,
  } = useSheetListActions('Projects', 'projects', (deletedId) => {
    if (editingId === deletedId) {
      setEditingId(null);
      setMode('list');
    }
  });

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
