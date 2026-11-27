'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAdminContext } from '@/components/admin/AdminContext';
import {
  apiCreateItem,
  apiUpdateItem,
  apiUpdateProfile,
} from '@/components/admin/api';
import { FactForm } from '@/components/admin/FactForm';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ItemList } from '@/components/admin/ItemList';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { useSheetListActions } from '@/components/admin/useSheetListActions';
import { SafeImage } from '@/components/public/SafeImage';
import { formatZodError, profileAboutSchema } from '@/lib/validation';
import type { Fact } from '@/types/content';

export function AboutFactsSection() {
  const { content, setContent, setIsDirty, confirmDiscardIfDirty } = useAdminContext();
  const profile = content?.profile;
  const facts = content?.facts ?? [];

  const [aboutText, setAboutText] = useState(profile?.about_text ?? '');
  const [aboutPhotoUrl, setAboutPhotoUrl] = useState(profile?.about_photo_url ?? '');
  const [aboutDirty, setAboutDirty] = useState(false);
  const [factDirty, setFactDirty] = useState(false);

  const [aboutStatus, setAboutStatus] = useState<SaveStatus>('idle');
  const [aboutSavedAt, setAboutSavedAt] = useState<string | null>(null);
  const [aboutError, setAboutError] = useState<string | null>(null);

  const [selectedFactId, setSelectedFactId] = useState<string | null>(
    facts[0]?.id ?? null
  );
  const [creatingFact, setCreatingFact] = useState(false);
  const {
    busyId,
    reordering,
    errorMsg: listError,
    setErrorMsg: setListError,
    handleToggleVisible,
    handleDelete: handleDeleteFact,
    handleMove: handleMoveFact,
  } = useSheetListActions('Facts', 'facts', (deletedId) => {
    if (selectedFactId === deletedId) setSelectedFactId(null);
  });

  useEffect(() => {
    setIsDirty(aboutDirty || factDirty);
  }, [aboutDirty, factDirty, setIsDirty]);

  useEffect(() => {
    return () => setIsDirty(false);
  }, [setIsDirty]);

  const handleAboutSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAboutError(null);

    const parsed = profileAboutSchema.safeParse({
      about_text: aboutText,
      about_photo_url: aboutPhotoUrl,
    });
    if (!parsed.success) {
      setAboutStatus('error');
      setAboutError(formatZodError(parsed.error));
      return;
    }

    setAboutStatus('saving');
    try {
      await apiUpdateProfile(parsed.data);
      setContent((prev) =>
        prev ? { ...prev, profile: { ...prev.profile, ...parsed.data } } : prev
      );
      setAboutDirty(false);
      setAboutStatus('saved');
      setAboutSavedAt(formatTimeWib());
    } catch (err) {
      setAboutStatus('error');
      setAboutError(
        err instanceof Error ? err.message : 'Gagal menyimpan bagian Tentang.'
      );
    }
  };

  const selectedFact = creatingFact
    ? null
    : facts.find((item) => item.id === selectedFactId) ?? null;

  const handleSelectFact = (item: Fact) => {
    if (factDirty && !confirmDiscardIfDirty()) return;
    setCreatingFact(false);
    setSelectedFactId(item.id);
  };

  const handleSaveFact = async (payload: {
    value: string;
    label: string;
    visible: boolean;
  }) => {
    setListError(null);
    if (creatingFact || !selectedFact) {
      const id = await apiCreateItem('Facts', payload);
      const nextOrder = facts.reduce((m, x) => Math.max(m, x.order), 0) + 1;
      const created: Fact = {
        id: id || `fact-${Date.now()}`,
        order: nextOrder,
        ...payload,
      };
      setContent((prev) =>
        prev ? { ...prev, facts: [...prev.facts, created] } : prev
      );
      setCreatingFact(false);
      setSelectedFactId(created.id);
      return;
    }

    await apiUpdateItem('Facts', selectedFact.id, payload);
    setContent((prev) =>
      prev
        ? {
            ...prev,
            facts: prev.facts.map((f) =>
              f.id === selectedFact.id ? { ...f, ...payload } : f
            ),
          }
        : prev
    );
  };

  const handleFactDirtyChange = useCallback((dirty: boolean) => {
    setFactDirty(dirty);
  }, []);

  return (
    <div className="space-y-8">
      {/* Bagian 1: Bio & Foto Tentang */}
      <form id="about-profile-form" onSubmit={handleAboutSubmit} className="space-y-5" noValidate>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
              Tentang &amp; Fakta
            </h1>
            <p className="mt-1 text-sm text-[var(--mute)]">
              Edit paragraf bio, foto bagian Tentang, serta angka-angka fakta singkat.
            </p>
          </div>
          <SaveBar
            formId="about-profile-form"
            status={aboutStatus}
            savedAt={aboutSavedAt}
            errorMessage={aboutError}
            isDirty={aboutDirty}
            saveLabel="Simpan Tentang"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
            <label
              htmlFor="about_text"
              className="block text-sm font-medium text-[var(--ink)]"
            >
              Paragraf Bio <span className="font-mono text-xs text-[var(--mute)]">(about_text)</span>
            </label>
            <textarea
              id="about_text"
              rows={8}
              value={aboutText}
              onChange={(e) => {
                setAboutText(e.target.value);
                setAboutDirty(true);
                if (aboutStatus === 'error') setAboutStatus('idle');
              }}
              placeholder="Ceritakan latar belakang, keahlian utama, dan pengalaman Anda…"
              className="mt-2 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3.5 text-sm leading-relaxed text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-[var(--mute)]">
              {aboutText.length} / 4000 karakter
            </p>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">
              Foto Tentang
            </h2>
            <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--soft)]">
              <SafeImage
                src={aboutPhotoUrl}
                alt="Foto bagian Tentang"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="mt-3">
              <ImageUploader
                currentUrl={aboutPhotoUrl}
                onUploaded={(url) => {
                  setAboutPhotoUrl(url);
                  setAboutDirty(true);
                }}
                buttonLabel="Ganti Foto Tentang"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Bagian 2: CRUD Fakta Angka */}
      <section className="space-y-4 border-t border-[var(--line)] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
              Fakta Angka ({facts.length})
            </h2>
            <p className="text-sm text-[var(--mute)]">
              Statistik singkat yang tampil di bagian Tentang (mis. IPK, jumlah project, publikasi).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (factDirty && !confirmDiscardIfDirty()) return;
              setCreatingFact(true);
              setSelectedFactId(null);
            }}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--acc-btn)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--acc-btn-hover)]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Tambah Fakta</span>
          </button>
        </div>

        {listError && (
          <p
            role="alert"
            className="rounded-[var(--radius-control)] border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-2.5 text-sm text-[var(--acc)]"
          >
            {listError}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <ItemList
            items={facts}
            selectedId={creatingFact ? null : selectedFact?.id}
            getTitle={(item) => `${item.value} — ${item.label}`}
            onSelect={handleSelectFact}
            onToggleVisible={handleToggleVisible}
            onDelete={handleDeleteFact}
            onMove={handleMoveFact}
            busyId={busyId}
            reordering={reordering}
          />

          <FactForm
            fact={selectedFact}
            onSave={handleSaveFact}
            onDirtyChange={handleFactDirtyChange}
            onCancelNew={
              creatingFact
                ? () => {
                    setCreatingFact(false);
                    setSelectedFactId(facts[0]?.id ?? null);
                  }
                : undefined
            }
          />
        </div>
      </section>
    </div>
  );
}
