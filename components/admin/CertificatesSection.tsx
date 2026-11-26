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
  CertificateForm,
  type CertificateFormPayload,
} from '@/components/admin/CertificateForm';
import { ItemList } from '@/components/admin/ItemList';
import type { Certificate } from '@/types/content';

export function CertificatesSection() {
  const { content, setContent, setIsDirty, confirmDiscardIfDirty } = useAdminContext();
  const certificates = content?.certificates ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(
    certificates[0]?.id ?? null
  );
  const [creating, setCreating] = useState(certificates.length === 0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => setIsDirty(false);
  }, [setIsDirty]);

  const selectedIndex = creating
    ? -1
    : certificates.findIndex((item) => item.id === selectedId);
  const selectedItem = selectedIndex >= 0 ? certificates[selectedIndex] : null;

  const handleDirtyChange = useCallback(
    (dirty: boolean) => setIsDirty(dirty),
    [setIsDirty]
  );

  const handleSave = async (payload: CertificateFormPayload) => {
    setErrorMsg(null);
    if (creating || !selectedItem) {
      const id = await apiCreateItem('Certificates', { ...payload });
      const nextOrder = certificates.reduce((m, x) => Math.max(m, x.order), 0) + 1;
      const created: Certificate = {
        id: id || `cert-${Date.now()}`,
        order: nextOrder,
        ...payload,
      };
      setContent((prev) =>
        prev ? { ...prev, certificates: [...prev.certificates, created] } : prev
      );
      setCreating(false);
      setSelectedId(created.id);
      return;
    }

    await apiUpdateItem('Certificates', selectedItem.id, { ...payload });
    setContent((prev) =>
      prev
        ? {
            ...prev,
            certificates: prev.certificates.map((c) =>
              c.id === selectedItem.id ? { ...c, ...payload } : c
            ),
          }
        : prev
    );
  };

  const handleToggleVisible = async (item: Certificate, nextVisible: boolean) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiUpdateItem('Certificates', item.id, { visible: nextVisible });
      setContent((prev) =>
        prev
          ? {
              ...prev,
              certificates: prev.certificates.map((c) =>
                c.id === item.id ? { ...c, visible: nextVisible } : c
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

  const handleDelete = async (item: Certificate) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiDeleteItem('Certificates', item.id);
      setContent((prev) =>
        prev
          ? {
              ...prev,
              certificates: prev.certificates.filter((c) => c.id !== item.id),
            }
          : prev
      );
      if (selectedId === item.id) {
        setSelectedId(null);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus sertifikat.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= certificates.length) return;

    const next = [...certificates];
    const [moved] = next.splice(index, 1);
    next.splice(swapIdx, 0, moved);
    const reindexed = next.map((item, idx) => ({ ...item, order: idx + 1 }));

    setReordering(true);
    setErrorMsg(null);
    try {
      await apiReorderItems(
        'Certificates',
        reindexed.map((item) => item.id)
      );
      setContent((prev) => (prev ? { ...prev, certificates: reindexed } : prev));
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
            Manajemen Sertifikat ({certificates.length})
          </h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Unggah gambar sertifikat, atur urutan tampil, dan kelola tautan kredensial.
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
          <span>Tambah Sertifikat</span>
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

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ItemList
          items={certificates}
          selectedId={creating ? null : selectedItem?.id}
          getTitle={(item) => item.title}
          getSubtitle={(item) =>
            [item.issuer, item.issued_at].filter(Boolean).join(' · ')
          }
          getThumbnail={(item) => item.image_url}
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

        <CertificateForm
          certificate={selectedItem}
          orderNumber={selectedIndex >= 0 ? selectedIndex + 1 : undefined}
          onSave={handleSave}
          onDirtyChange={handleDirtyChange}
          onCancelNew={
            creating && certificates.length > 0
              ? () => {
                  setCreating(false);
                  setSelectedId(certificates[0]?.id ?? null);
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
