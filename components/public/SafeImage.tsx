'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getDriveImageCandidates } from '@/lib/url';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number;
  height?: number;
}

export function SafeImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority,
  width,
  height,
}: SafeImageProps) {
  const candidates = useMemo(() => getDriveImageCandidates(src), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [src]);

  const currentSrc = candidates[candidateIndex] ?? '';

  if (!currentSrc) {
    return (
      <div
        role="img"
        aria-label={alt || 'Gambar tidak tersedia'}
        className={`flex flex-col items-center justify-center gap-2 bg-[var(--soft)] text-[var(--mute)] ${className}`}
      >
        <ImageOff className="h-6 w-6 opacity-60" aria-hidden="true" />
        <span className="px-3 text-center text-xs">Gambar tidak tersedia</span>
      </div>
    );
  }

  const handleError = () => {
    setCandidateIndex((prev) => prev + 1);
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
}
