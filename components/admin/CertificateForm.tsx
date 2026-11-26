'use client';

import React, { useEffect, useState } from 'react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { formatTimeWib, SaveBar, type SaveStatus } from '@/components/admin/SaveBar';
import { certificateInputSchema, formatZodError } from '@/lib/validation';
import type { Certificate } from '@/types/content';

export interface CertificateFormPayload {
  title: string;
  image_url: string;
  issuer: string;
  issued_at: string;
  credential_url: string;
  visible: boolean;
}

interface CertificateFormProps {
  certificate: Certificate | null;
  orderNumber?: number;
  onSave: (payload: CertificateFormPayload) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  onCancelNew?: () => void;
}

export function CertificateForm({
  certificate,
  orderNumber,
  onSave,
  onDirtyChange,
  onCancelNew,
}: CertificateFormProps) {
  const [title, setTitle] = useState(certificate?.title ?? '');
  const [imageUrl, setImageUrl] = useState(certificate?.image_url ?? '');
  const [issuer, setIssuer] = useState(certificate?.issuer ?? '');
  const [issuedAt, setIssuedAt] = useState(certificate?.issued_at ?? '');
  const [credentialUrl, setCredentialUrl] = useState(certificate?.credential_url ?? '');
  const [visible, setVisible] = useState(certificate?.visible ?? true);

  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setTitle(certificate?.title ?? '');
    setImageUrl(certificate?.image_url ?? '');
    setIssuer(certificate?.issuer ?? '');
    setIssuedAt(certificate?.issued_at ?? '');
    setCredentialUrl(certificate?.credential_url ?? '');
    setVisible(certificate?.visible ?? true);
    setDirty(false);
    setStatus('idle');
    setErrorMsg(null);
    onDirtyChange(false);
  }, [certificate, onDirtyChange]);

  const markDirty = () => {
    setDirty(true);
    onDirtyChange(true);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = certificateInputSchema.safeParse({
      title,
      image_url: imageUrl,
      issuer,
      issued_at: issuedAt,
      credential_url: credentialUrl,
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
        err instanceof Error ? err.message : 'Gagal menyimpan sertifikat.'
      );
    }
  };

  return (
    <form
      id="certificate-form"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 shadow-card"
      noValidate
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-[var(--ink)]">
          {certificate
            ? `Detail Sertifikat ${orderNumber ? `#${orderNumber}` : ''}`
            : 'Tambah Sertifikat Baru'}
        </h2>
        {!certificate && onCancelNew && (
          <button
            type="button"
            onClick={onCancelNew}
            className="text-xs font-medium text-[var(--mute)] hover:text-[var(--ink)]"
          >
            Batal
          </button>
        )}
      </div>

      <ImageUploader
        currentUrl={imageUrl}
        onUploaded={(url) => {
          setImageUrl(url);
          markDirty();
        }}
        showPreview
        previewAlt={title || 'Pratinjau sertifikat'}
        previewClassName="aspect-[16/11] w-full object-contain bg-[var(--bg)]"
        buttonLabel={imageUrl ? 'Ganti Gambar Sertifikat' : 'Unggah Gambar Sertifikat'}
      />

      <div>
        <label htmlFor="cert-title" className="block text-sm font-medium text-[var(--ink)]">
          Judul Sertifikat
        </label>
        <input
          id="cert-title"
          type="text"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          placeholder="Contoh: Python for Data Science"
          className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cert-issuer" className="block text-sm font-medium text-[var(--ink)]">
            Penerbit
          </label>
          <input
            id="cert-issuer"
            type="text"
            value={issuer}
            onChange={(e) => {
              setIssuer(e.target.value);
              markDirty();
            }}
            placeholder="MySkill"
            className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="cert-date" className="block text-sm font-medium text-[var(--ink)]">
            Tanggal Terbit
          </label>
          <input
            id="cert-date"
            type="text"
            value={issuedAt}
            onChange={(e) => {
              setIssuedAt(e.target.value);
              markDirty();
            }}
            placeholder="April 2025"
            className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cert-url" className="block text-sm font-medium text-[var(--ink)]">
          Link Kredensial (opsional)
        </label>
        <input
          id="cert-url"
          type="url"
          value={credentialUrl}
          onChange={(e) => {
            setCredentialUrl(e.target.value);
            markDirty();
          }}
          placeholder="https://myskill.id/credential/..."
          className="mt-1.5 min-h-[42px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--teal)] focus:outline-none"
        />
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
        <span>Tampilkan di grid publik</span>
      </label>

      <div className="pt-2">
        <SaveBar
          formId="certificate-form"
          status={status}
          savedAt={savedAt}
          errorMessage={errorMsg}
          isDirty={dirty}
          saveLabel="Simpan Sertifikat"
        />
      </div>
    </form>
  );
}
