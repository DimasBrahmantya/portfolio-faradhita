'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { compressImageFile } from '@/lib/image';
import { apiUploadImage } from '@/components/admin/api';
import { SafeImage } from '@/components/public/SafeImage';

interface ImageUploaderProps {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  variant?: 'button' | 'dropzone';
  buttonLabel?: string;
  helperText?: string;
  showPreview?: boolean;
  previewClassName?: string;
  previewAlt?: string;
  multiple?: boolean;
}

export function ImageUploader({
  currentUrl,
  onUploaded,
  variant = 'button',
  buttonLabel = 'Unggah Gambar',
  helperText = 'Maks 1600px · Kualitas 0,82 (WebP/JPEG) · Batas 5 MB',
  showPreview = false,
  previewClassName = 'h-48 w-full rounded-[var(--radius-card)] object-cover',
  previewAlt = 'Pratinjau gambar',
  multiple = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [stage, setStage] = useState<'idle' | 'compressing' | 'uploading' | 'done' | 'error'>('idle');
  const [statusText, setStatusText] = useState<string>('');
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const targets = multiple ? list : [list[0]];
    setStage('compressing');
    setStatusText('');

    try {
      for (let i = 0; i < targets.length; i++) {
        const file = targets[i];
        const prefix = targets.length > 1 ? `(${i + 1}/${targets.length}) ` : '';

        setStage('compressing');
        setStatusText(`${prefix}Mengompres gambar…`);
        const compressed = await compressImageFile(file);

        if (!multiple) {
          setLocalPreview(compressed.previewDataUrl);
        }

        setStage('uploading');
        const kb = Math.round(compressed.sizeBytes / 1024);
        setStatusText(`${prefix}Mengunggah ke Google Drive (${kb} KB)…`);

        const { url } = await apiUploadImage({
          filename: compressed.filename,
          mimeType: compressed.mimeType,
          base64: compressed.base64,
        });

        onUploaded(url);
      }

      setStage('done');
      setStatusText(
        targets.length > 1
          ? `${targets.length} gambar berhasil diunggah.`
          : 'Gambar berhasil diunggah ke Drive.'
      );
      setLocalPreview(null);
    } catch (err) {
      setStage('error');
      setStatusText(
        err instanceof Error ? err.message : 'Gagal mengunggah gambar.'
      );
      setLocalPreview(null);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      void processFiles(event.target.files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length) {
      void processFiles(event.dataTransfer.files);
    }
  };

  const busy = stage === 'compressing' || stage === 'uploading';
  const previewSrc = localPreview || currentUrl || '';

  return (
    <div className="space-y-3">
      {showPreview && previewSrc && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg)]">
          {localPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localPreview}
              alt={previewAlt}
              className={previewClassName}
            />
          ) : (
            <SafeImage
              src={previewSrc}
              alt={previewAlt}
              className={previewClassName}
            />
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={handleFileChange}
        className="sr-only"
        aria-label={buttonLabel}
      />

      {variant === 'dropzone' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-[var(--radius-card)] border-2 border-dashed p-5 text-center transition-colors ${
            isDragging
              ? 'border-[var(--teal)] bg-[var(--soft)]'
              : 'border-[var(--teal)]/60 bg-[var(--soft)]/50 hover:border-[var(--teal)] hover:bg-[var(--soft)]'
          }`}
        >
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-1.5 text-center disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--teal)]" aria-hidden="true" />
            ) : (
              <Upload className="h-5 w-5 text-[var(--teal)]" aria-hidden="true" />
            )}
            <span className="text-sm font-semibold text-[var(--teal)]">
              {busy ? statusText : buttonLabel}
            </span>
            <span className="text-xs text-[var(--mute)]">{helperText}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-[var(--mute)]">
            {helperText}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--teal)] bg-[var(--surf)] px-4 py-2 text-sm font-semibold text-[var(--teal)] transition-colors hover:bg-[var(--soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>{statusText}</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span>{buttonLabel}</span>
              </>
            )}
          </button>
        </div>
      )}

      {stage === 'done' && statusText && (
        <p
          role="status"
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--teal)]"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{statusText}</span>
        </p>
      )}

      {stage === 'error' && statusText && (
        <p
          role="alert"
          className="flex items-start gap-1.5 rounded-[var(--radius-control)] border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-xs text-[var(--acc)]"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{statusText}</span>
        </p>
      )}
    </div>
  );
}
