'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { SafeImage } from '@/components/public/SafeImage';
import {
  customSectionInputSchema,
  formatZodError,
  slugify,
} from '@/lib/validation';
import type {
  CustomSection,
  CustomSectionCard,
  CustomSectionPlacement,
  ProjectImage,
} from '@/types/content';

export const PLACEMENT_OPTIONS: { value: CustomSectionPlacement; label: string }[] = [
  { value: 'after-hero', label: 'Setelah Hero (paling atas)' },
  { value: 'after-about', label: 'Setelah Tentang' },
  { value: 'after-projects', label: 'Setelah Project' },
  { value: 'after-experience', label: 'Setelah Pengalaman & Publikasi' },
  { value: 'after-certificates', label: 'Setelah Sertifikat' },
  { value: 'after-skills', label: 'Setelah Keahlian (sebelum Kontak)' },
];

export interface CustomSectionFormPayload {
  slug: string;
  nav_label: string;
  show_in_nav: boolean;
  placement: CustomSectionPlacement;
  eyebrow: string;
  heading: string;
  description: string;
  items: CustomSectionCard[];
  images: ProjectImage[];
  visible: boolean;
}

interface CustomSectionFormProps {
  section: CustomSection | null;
  onSave: (payload: CustomSectionFormPayload) => Promise<void>;
  onBack: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function CustomSectionForm({
  section,
  onSave,
  onBack,
  onDirtyChange,
}: CustomSectionFormProps) {
  const [heading, setHeading] = useState(section?.heading ?? '');
  const [eyebrow, setEyebrow] = useState(section?.eyebrow ?? '');
  const [navLabel, setNavLabel] = useState(section?.nav_label ?? '');
  const [showInNav, setShowInNav] = useState(section?.show_in_nav ?? true);
  const [slug, setSlug] = useState(section?.slug ?? '');
  const [placement, setPlacement] = useState<CustomSectionPlacement>(
    section?.placement ?? 'after-skills'
  );
  const [description, setDescription] = useState(section?.description ?? '');
  const [items, setItems] = useState<CustomSectionCard[]>(section?.items ?? []);
  const [images, setImages] = useState<ProjectImage[]>(section?.images ?? []);
  const [visible, setVisible] = useState(section?.visible ?? true);

  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setHeading(section?.heading ?? '');
    setEyebrow(section?.eyebrow ?? '');
    setNavLabel(section?.nav_label ?? '');
    setShowInNav(section?.show_in_nav ?? true);
    setSlug(section?.slug ?? '');
    setPlacement(section?.placement ?? 'after-skills');
    setDescription(section?.description ?? '');
    setItems(section?.items ?? []);
    setImages(section?.images ?? []);
    setVisible(section?.visible ?? true);
    setDirty(false);
    setStatus('idle');
    setErrorMsg(null);
    onDirtyChange(false);
  }, [section, onDirtyChange]);

  const markDirty = () => {
    setDirty(true);
    onDirtyChange(true);
    if (status === 'error') setStatus('idle');
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { title: '', subtitle: '', description: '', url: '', url_label: '' },
    ]);
    markDirty();
  };

  const updateItem = (idx: number, patch: Partial<CustomSectionCard>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    markDirty();
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const moveItem = (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(target, 0, moved);
      return next;
    });
    markDirty();
  };

  const addUploadedImage = (url: string) => {
    setImages((prev) => [...prev, { url, caption: '', wide: false }]);
    markDirty();
  };

  const updateImage = (idx: number, patch: Partial<ProjectImage>) => {
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, ...patch } : img)));
    markDirty();
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const cleanedItems = items.filter((it) => it.title.trim().length > 0);
    const cleanedImages = images.filter((img) => img.url.trim().length > 0);
    const finalSlug = slug.trim() || slugify(navLabel || heading) || `section-${Date.now()}`;

    const parsed = customSectionInputSchema.safeParse({
      slug: finalSlug,
      nav_label: navLabel,
      show_in_nav: showInNav,
      placement,
      eyebrow,
      heading,
      description,
      items: cleanedItems,
      images: cleanedImages,
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
      setSlug(parsed.data.slug);
      setItems(parsed.data.items);
      setImages(parsed.data.images);
      setDirty(false);
      onDirtyChange(false);
      setStatus('saved');
      setSavedAt(formatTimeWib());
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan section.');
    }
  };

  return (
    <form id="custom-section-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--teal)] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Kembali ke Daftar Section</span>
          </button>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            {section ? 'Edit Section Kustom' : 'Tambah Section Baru'}
          </h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Section ini akan otomatis tampil di halaman publik sesuai posisi yang dipilih.
          </p>
        </div>

        <SaveBar
          formId="custom-section-form"
          status={status}
          savedAt={savedAt}
          errorMessage={errorMsg}
          isDirty={dirty}
          saveLabel="Simpan Section"
        />
      </div>

      {/* Informasi Utama */}
      <div className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-[var(--ink)]">
          Identitas &amp; Penempatan
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cs-eyebrow" className="block text-sm font-medium text-[var(--ink)]">
              Label Kecil (Eyebrow)
            </label>
            <input
              id="cs-eyebrow"
              type="text"
              value={eyebrow}
              onChange={(e) => {
                setEyebrow(e.target.value);
                markDirty();
              }}
              placeholder="Contoh: 06 / PRESTASI & ORGANISASI"
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cs-placement" className="block text-sm font-medium text-[var(--ink)]">
              Posisi di Halaman Publik
            </label>
            <select
              id="cs-placement"
              value={placement}
              onChange={(e) => {
                setPlacement(e.target.value as CustomSectionPlacement);
                markDirty();
              }}
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            >
              {PLACEMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cs-heading" className="block text-sm font-medium text-[var(--ink)]">
              Judul Section <span className="text-[var(--acc)]">*</span>
            </label>
            <input
              id="cs-heading"
              type="text"
              required
              value={heading}
              onChange={(e) => {
                setHeading(e.target.value);
                markDirty();
              }}
              placeholder="Contoh: Penghargaan & Aktivitas Organisasi"
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cs-nav-label" className="block text-sm font-medium text-[var(--ink)]">
              Nama di Menu Navigasi (Navbar)
            </label>
            <input
              id="cs-nav-label"
              type="text"
              value={navLabel}
              onChange={(e) => {
                setNavLabel(e.target.value);
                markDirty();
              }}
              placeholder="Contoh: Prestasi"
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--mute)]">
              Kosongkan untuk memakai judul section jika tampil di Navbar.
            </p>
          </div>

          <div>
            <label htmlFor="cs-slug" className="block text-sm font-medium text-[var(--ink)]">
              Slug Anchor (URL #bagian)
            </label>
            <input
              id="cs-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase());
                markDirty();
              }}
              placeholder="Otomatis dari nama menu / judul"
              className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 font-mono text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cs-desc" className="block text-sm font-medium text-[var(--ink)]">
              Paragraf Deskripsi (opsional)
            </label>
            <textarea
              id="cs-desc"
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markDirty();
              }}
              placeholder="Tulis pengantar atau penjelasan section ini (pisahkan paragraf dengan baris baru)…"
              className="mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3 text-sm leading-relaxed text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2.5 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              checked={showInNav}
              onChange={(e) => {
                setShowInNav(e.target.checked);
                markDirty();
              }}
              className="h-4 w-4 accent-[var(--teal)]"
            />
            <span>Tampilkan di menu navigasi (Navbar)</span>
          </label>

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
            <span>Tampilkan section di halaman publik</span>
          </label>
        </div>
      </div>

      {/* Daftar Item / Kartu */}
      <div className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">
              Daftar Kartu / Item ({items.length})
            </h2>
            <p className="text-xs text-[var(--mute)]">
              Opsional. Ditampilkan sebagai grid kartu rapi di dalam section.
            </p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--bg)] px-3.5 py-1.5 text-xs font-semibold text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tambah Kartu</span>
          </button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] p-4 text-center text-xs text-[var(--mute)]">
            Belum ada kartu. Klik &quot;Tambah Kartu&quot; jika ingin menambahkan poin/item terstruktur.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--teal)]">
                    KARTU #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 'up')}
                      disabled={idx === 0}
                      aria-label="Naikkan kartu"
                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] disabled:opacity-40"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 'down')}
                      disabled={idx === items.length - 1}
                      aria-label="Turunkan kartu"
                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] text-[var(--mute)] hover:text-[var(--ink)] disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      aria-label="Hapus kartu"
                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--line)] text-[var(--acc)] hover:bg-[var(--error-bg)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(idx, { title: e.target.value })}
                    placeholder="Judul item *"
                    className="min-h-[40px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-1.5 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={item.subtitle}
                    onChange={(e) => updateItem(idx, { subtitle: e.target.value })}
                    placeholder="Subjudul / Tahun / Instansi (opsional)"
                    className="min-h-[40px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-1.5 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                  />
                </div>

                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  placeholder="Deskripsi singkat (opsional)"
                  className="w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] p-3 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) => updateItem(idx, { url: e.target.value })}
                    placeholder="URL Tautan opsional (https://...)"
                    className="min-h-[38px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={item.url_label}
                    onChange={(e) => updateItem(idx, { url_label: e.target.value })}
                    placeholder="Teks tombol tautan (default: Lihat Selengkapnya)"
                    className="min-h-[38px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Galeri Gambar */}
      <div className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card">
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--ink)]">
            Galeri Gambar ({images.length})
          </h2>
          <p className="text-xs text-[var(--mute)]">
            Opsional. Gambar bisa diklik untuk diperbesar (Lightbox) di halaman publik.
          </p>
        </div>

        <ImageUploader
          currentUrl=""
          onUploaded={addUploadedImage}
          buttonLabel="Unggah Gambar ke Section"
        />

        {images.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="space-y-2.5 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)] p-3.5"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--soft)]">
                  <SafeImage
                    src={img.url}
                    alt={img.caption || `Gambar ${idx + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => updateImage(idx, { caption: e.target.value })}
                  placeholder="Keterangan gambar (opsional)"
                  className="min-h-[38px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs text-[var(--ink)]">
                    <input
                      type="checkbox"
                      checked={img.wide}
                      onChange={(e) => updateImage(idx, { wide: e.target.checked })}
                      className="h-3.5 w-3.5 accent-[var(--teal)]"
                    />
                    <span>Lebar penuh</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--acc)] hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
