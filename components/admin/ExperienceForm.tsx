'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { SafeImage } from '@/components/public/SafeImage';
import { experienceInputSchema, formatZodError } from '@/lib/validation';
import type { Experience, ExperienceType, ProjectImage } from '@/types/content';

export interface ExperienceFormPayload {
  type: ExperienceType;
  period: string;
  title: string;
  subtitle: string;
  points: string[];
  images: ProjectImage[];
  visible: boolean;
}

interface ExperienceFormProps {
  experience: Experience | null;
  onSave: (payload: ExperienceFormPayload) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  onCancelNew?: () => void;
}

export function ExperienceForm({
  experience,
  onSave,
  onDirtyChange,
  onCancelNew,
}: ExperienceFormProps) {
  const [type, setType] = useState<ExperienceType>(experience?.type ?? 'work');
  const [period, setPeriod] = useState(experience?.period ?? '');
  const [title, setTitle] = useState(experience?.title ?? '');
  const [subtitle, setSubtitle] = useState(experience?.subtitle ?? '');
  const [points, setPoints] = useState<string[]>(
    experience?.points.length ? experience.points : ['']
  );
  const [images, setImages] = useState<ProjectImage[]>(experience?.images ?? []);
  const [visible, setVisible] = useState(experience?.visible ?? true);

  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setType(experience?.type ?? 'work');
    setPeriod(experience?.period ?? '');
    setTitle(experience?.title ?? '');
    setSubtitle(experience?.subtitle ?? '');
    setPoints(experience?.points.length ? experience.points : ['']);
    setImages(experience?.images ?? []);
    setVisible(experience?.visible ?? true);
    setDirty(false);
    setStatus('idle');
    setErrorMsg(null);
    onDirtyChange(false);
  }, [experience, onDirtyChange]);

  const markDirty = () => {
    setDirty(true);
    onDirtyChange(true);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const cleanedPoints = points.map((p) => p.trim()).filter(Boolean);
    const parsed = experienceInputSchema.safeParse({
      type,
      period,
      title,
      subtitle,
      points: cleanedPoints,
      images,
      visible,
    });

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
        err instanceof Error ? err.message : 'Gagal menyimpan pengalaman.'
      );
    }
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

  return (
    <form
      id="experience-form"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card"
      noValidate
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-[var(--ink)]">
          {experience ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
        </h2>
        {!experience && onCancelNew && (
          <button
            type="button"
            onClick={onCancelNew}
            className="text-xs font-medium text-[var(--mute)] hover:text-[var(--ink)]"
          >
            Batal
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="exp-type" className="block text-sm font-medium text-[var(--ink)]">
            Kategori
          </label>
          <select
            id="exp-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as ExperienceType);
              markDirty();
            }}
            className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
          >
            <option value="work">Pekerjaan / Magang (work)</option>
            <option value="education">Pendidikan (education)</option>
            <option value="training">Pelatihan (training)</option>
          </select>
        </div>

        <div>
          <label htmlFor="exp-period" className="block text-sm font-medium text-[var(--ink)]">
            Periode
          </label>
          <input
            id="exp-period"
            type="text"
            required
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              markDirty();
            }}
            placeholder="Contoh: April – Agustus 2026"
            className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="exp-title" className="block text-sm font-medium text-[var(--ink)]">
          Judul / Posisi / Institusi
        </label>
        <input
          id="exp-title"
          type="text"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          placeholder="Contoh: Magang, Diskominfo Kabupaten Jombang"
          className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="exp-subtitle" className="block text-sm font-medium text-[var(--ink)]">
          Subjudul / Keterangan Tambahan (opsional)
        </label>
        <textarea
          id="exp-subtitle"
          rows={2}
          value={subtitle}
          onChange={(e) => {
            setSubtitle(e.target.value);
            markDirty();
          }}
          placeholder="Contoh: IPK 3,88/4,00. Skripsi: ..."
          className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-[var(--ink)]">
          Poin Tanggung Jawab / Pencapaian
        </span>
        <div className="mt-2 space-y-2">
          {points.map((pt, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <textarea
                rows={2}
                value={pt}
                onChange={(e) => {
                  setPoints((prev) =>
                    prev.map((item, i) => (i === idx ? e.target.value : item))
                  );
                  markDirty();
                }}
                placeholder={`Poin ${idx + 1}…`}
                aria-label={`Poin pengalaman ${idx + 1}`}
                className="flex-1 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setPoints((prev) => prev.filter((_, i) => i !== idx));
                  markDirty();
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--line)] text-[var(--acc)] hover:bg-[var(--error-bg)]"
                aria-label={`Hapus poin ${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setPoints((prev) => [...prev, '']);
            markDirty();
          }}
          className="mt-2.5 inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--teal)] px-3 py-1.5 text-xs font-semibold text-[var(--teal)] hover:bg-[var(--soft)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Tambah Poin</span>
        </button>
      </div>

      {/* Dokumentasi foto opsional */}
      <div className="border-t border-[var(--line)] pt-4">
        <span className="block text-sm font-medium text-[var(--ink)]">
          Dokumentasi Foto (opsional, {images.length})
        </span>
        {images.length > 0 && (
          <div className="mt-2.5 space-y-2">
            {images.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)]/60 p-2.5"
              >
                <div className="h-14 w-16 shrink-0 overflow-hidden rounded border border-[var(--line)]">
                  <SafeImage
                    src={img.url}
                    alt={img.caption || `Foto ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => {
                    setImages((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, caption: e.target.value } : item
                      )
                    );
                    markDirty();
                  }}
                  placeholder="Caption foto…"
                  className="min-h-[36px] flex-1 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surf)] px-2.5 py-1 text-xs text-[var(--ink)]"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveImage(idx, 'up')}
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] bg-[var(--surf)] disabled:opacity-40"
                    aria-label="Naikkan foto"
                  >
                    <ArrowUp className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => moveImage(idx, 'down')}
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] bg-[var(--surf)] disabled:opacity-40"
                    aria-label="Turunkan foto"
                  >
                    <ArrowDown className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImages((prev) => prev.filter((_, i) => i !== idx));
                      markDirty();
                    }}
                    className="px-2 text-xs font-medium text-[var(--acc)]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2.5">
          <ImageUploader
            variant="dropzone"
            multiple
            onUploaded={(url) => {
              setImages((prev) => [...prev, { url, caption: '', wide: false }]);
              markDirty();
            }}
            buttonLabel="+ Unggah Foto Dokumentasi"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-[var(--ink)]">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => {
            setVisible(e.target.checked);
            markDirty();
          }}
          className="h-4 w-4 accent-[var(--teal)]"
        />
        <span>Tampilkan di timeline publik</span>
      </label>

      <div className="pt-2">
        <SaveBar
          formId="experience-form"
          status={status}
          savedAt={savedAt}
          errorMessage={errorMsg}
          isDirty={dirty}
          saveLabel="Simpan Pengalaman"
        />
      </div>
    </form>
  );
}
