'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { ChipInput } from '@/components/admin/ChipInput';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { SafeImage } from '@/components/public/SafeImage';
import { formatZodError, projectInputSchema, slugify } from '@/lib/validation';
import type { Project, ProjectImage, ProjectPoint } from '@/types/content';

export interface ProjectFormPayload {
  title: string;
  slug: string;
  tags: string[];
  description: string;
  points: ProjectPoint[];
  images: ProjectImage[];
  visible: boolean;
}

interface ProjectFormProps {
  project: Project | null;
  onSave: (payload: ProjectFormPayload) => Promise<void>;
  onBack: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function ProjectForm({
  project,
  onSave,
  onBack,
  onDirtyChange,
}: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [slug, setSlug] = useState(project?.slug ?? '');
  const [tags, setTags] = useState<string[]>(project?.tags ?? []);
  const [description, setDescription] = useState(project?.description ?? '');
  const [points, setPoints] = useState<ProjectPoint[]>(
    project?.points.length ? project.points : [{ label: '', text: '' }]
  );
  const [images, setImages] = useState<ProjectImage[]>(project?.images ?? []);
  const [visible, setVisible] = useState(project?.visible ?? true);

  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setTitle(project?.title ?? '');
    setSlug(project?.slug ?? '');
    setTags(project?.tags ?? []);
    setDescription(project?.description ?? '');
    setPoints(project?.points.length ? project.points : [{ label: '', text: '' }]);
    setImages(project?.images ?? []);
    setVisible(project?.visible ?? true);
    setDirty(false);
    setStatus('idle');
    setErrorMsg(null);
    onDirtyChange(false);
  }, [project, onDirtyChange]);

  const markDirty = () => {
    setDirty(true);
    onDirtyChange(true);
    if (status === 'error') setStatus('idle');
  };

  const handlePointChange = (
    idx: number,
    field: 'label' | 'text',
    value: string
  ) => {
    setPoints((prev) =>
      prev.map((pt, i) => (i === idx ? { ...pt, [field]: value } : pt))
    );
    markDirty();
  };

  const addPoint = () => {
    setPoints((prev) => [...prev, { label: '', text: '' }]);
    markDirty();
  };

  const removePoint = (idx: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const handleAddImage = (url: string) => {
    setImages((prev) => [...prev, { url, caption: '', wide: false }]);
    markDirty();
  };

  const updateImage = (
    idx: number,
    patch: Partial<ProjectImage>
  ) => {
    setImages((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, ...patch } : img))
    );
    markDirty();
  };

  const moveImage = (idx: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return next;
    });
    markDirty();
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const cleanedPoints = points
      .map((p) => ({ label: p.label.trim(), text: p.text.trim() }))
      .filter((p) => p.text.length > 0);

    const payload: ProjectFormPayload = {
      title: title.trim(),
      slug: (slug.trim() || slugify(title.trim())).toLowerCase(),
      tags,
      description: description.trim(),
      points: cleanedPoints,
      images,
      visible,
    };

    const parsed = projectInputSchema.safeParse(payload);
    if (!parsed.success) {
      setStatus('error');
      setErrorMsg(formatZodError(parsed.error));
      return;
    }

    setStatus('saving');
    try {
      await onSave(parsed.data);
      setDirty(false);
      onDirtyChange(false);
      setStatus('saved');
      setSavedAt(formatTimeWib());
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menyimpan project.'
      );
    }
  };

  return (
    <form id="project-editor-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--teal)] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Kembali ke Daftar Project</span>
          </button>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            {project ? `Edit Project: ${project.title}` : 'Tambah Project Baru'}
          </h1>
          <p className="mt-1 text-xs text-[var(--mute)]">
            {dirty
              ? 'Perubahan belum disimpan · Peringatan aktif jika meninggalkan halaman'
              : 'Lengkapi detail studi kasus, poin hasil, dan galeri gambar.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setVisible((prev) => !prev);
              markDirty();
            }}
            className={`inline-flex min-h-[42px] items-center rounded-[var(--radius-control)] border px-3.5 py-2 text-xs font-semibold transition-colors ${
              visible
                ? 'border-[var(--teal)] bg-[var(--soft)] text-[var(--teal)]'
                : 'border-[var(--line)] bg-[var(--surf)] text-[var(--mute)]'
            }`}
          >
            Status: {visible ? 'Tampil di Publik' : 'Tersembunyi'}
          </button>

          <SaveBar
            formId="project-editor-form"
            status={status}
            savedAt={savedAt}
            errorMessage={errorMsg}
            isDirty={dirty}
            saveLabel="Simpan Project"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Kiri: Detail Project */}
        <div className="space-y-5 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
          <div>
            <label htmlFor="project-title" className="block text-sm font-medium text-[var(--ink)]">
              Judul Project
            </label>
            <input
              id="project-title"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!project && !slug) {
                  // Keep slug empty so it auto-generates on save
                }
                markDirty();
              }}
              placeholder="Contoh: Retail Transaction Dashboard"
              className="mt-1.5 min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="project-slug" className="block text-sm font-medium text-[var(--ink)]">
              Slug URL <span className="font-mono text-xs text-[var(--mute)]">(opsional, otomatis dari judul)</span>
            </label>
            <input
              id="project-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                markDirty();
              }}
              placeholder={slugify(title) || 'retail-transaction-dashboard'}
              className="mt-1.5 min-h-[40px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 font-mono text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="project-tags" className="block text-sm font-medium text-[var(--ink)]">
              Tags / Perangkat (Chip Input)
            </label>
            <div className="mt-1.5">
              <ChipInput
                id="project-tags"
                values={tags}
                onChange={(next) => {
                  setTags(next);
                  markDirty();
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-desc" className="block text-sm font-medium text-[var(--ink)]">
              Deskripsi Singkat
            </label>
            <textarea
              id="project-desc"
              rows={4}
              required
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markDirty();
              }}
              placeholder="Jelaskan konteks masalah, metode, dan tujuan project…"
              className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3.5 text-sm leading-relaxed text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          {/* Repeater Poin */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--ink)]">
                Daftar Poin &amp; Hasil (Repeater)
              </span>
              <span className="text-xs text-[var(--mute)]">
                Label opsional (tampil tebal di depan poin)
              </span>
            </div>

            <div className="mt-2.5 space-y-2.5">
              {points.map((pt, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)]/70 p-3 sm:grid-cols-[160px_1fr_auto]"
                >
                  <input
                    type="text"
                    value={pt.label}
                    onChange={(e) => handlePointChange(idx, 'label', e.target.value)}
                    placeholder="(Tanpa label)"
                    aria-label={`Label poin ${idx + 1}`}
                    className="min-h-[40px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-3 py-1.5 text-xs font-medium text-[var(--teal)] placeholder:text-[var(--mute)]/70 focus:border-[var(--teal)] focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={pt.text}
                    onChange={(e) => handlePointChange(idx, 'text', e.target.value)}
                    placeholder="Isi poin temuan, proses, atau hasil…"
                    aria-label={`Teks poin ${idx + 1}`}
                    className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-3 py-1.5 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removePoint(idx)}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-[var(--radius-control)] px-2.5 text-xs font-medium text-[var(--acc)] hover:bg-[var(--error-bg)]"
                    aria-label={`Hapus poin ${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4 sm:mr-1" aria-hidden="true" />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addPoint}
              className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--teal)] bg-[var(--surf)] px-3.5 py-2 text-xs font-semibold text-[var(--teal)] hover:bg-[var(--soft)]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tambah Poin Baru</span>
            </button>
          </div>
        </div>

        {/* Kanan: Galeri Gambar */}
        <div className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            Galeri Gambar Project ({images.length})
          </h2>

          {images.length > 0 && (
            <div className="space-y-3">
              {images.map((img, idx) => (
                <div
                  key={`${img.url}-${idx}`}
                  className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)]/60 p-3"
                >
                  <div className="flex gap-3">
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)]">
                      <SafeImage
                        src={img.url}
                        alt={img.caption || `Gambar ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) =>
                          updateImage(idx, { caption: e.target.value })
                        }
                        placeholder="Caption / keterangan gambar…"
                        aria-label={`Caption gambar ${idx + 1}`}
                        className="min-h-[36px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-2.5 py-1 text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <label className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                          <input
                            type="checkbox"
                            checked={img.wide}
                            onChange={(e) =>
                              updateImage(idx, { wide: e.target.checked })
                            }
                            className="h-3.5 w-3.5 accent-[var(--teal)]"
                          />
                          <span>Lebar penuh (wide)</span>
                        </label>

                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[11px] text-[var(--mute)]">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveImage(idx, 'up')}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] bg-[var(--surf)] text-[var(--ink)] hover:border-[var(--teal)] disabled:opacity-40"
                            aria-label={`Naikkan gambar ${idx + 1}`}
                          >
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === images.length - 1}
                            onClick={() => moveImage(idx, 'down')}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] bg-[var(--surf)] text-[var(--ink)] hover:border-[var(--teal)] disabled:opacity-40"
                            aria-label={`Turunkan gambar ${idx + 1}`}
                          >
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="inline-flex h-7 items-center rounded px-2 font-medium text-[var(--acc)] hover:bg-[var(--error-bg)]"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ImageUploader
            variant="dropzone"
            multiple
            onUploaded={handleAddImage}
            buttonLabel="+ Unggah Gambar Tambahan ke Google Drive"
            helperText="Maks 1600px · Kualitas 0,82 (WebP/JPEG) · Batas 5 MB"
          />
        </div>
      </div>
    </form>
  );
}
