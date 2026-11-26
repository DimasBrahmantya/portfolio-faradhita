'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SafeImage } from './SafeImage';

export interface LightboxItem {
  url: string;
  caption: string;
  alt: string;
}

interface LightboxState {
  items: LightboxItem[];
  index: number;
  contextLabel: string;
}

interface LightboxContextValue {
  openLightbox: (items: LightboxItem[], startIndex: number, contextLabel?: string) => void;
  closeLightbox: () => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error('useLightbox harus digunakan di dalam LightboxProvider.');
  }
  return ctx;
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const openLightbox = useCallback(
    (items: LightboxItem[], startIndex: number, contextLabel = 'PRATINJAU') => {
      if (items.length === 0) return;
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const safeIndex = Math.max(0, Math.min(startIndex, items.length - 1));
      setState({ items, index: safeIndex, contextLabel });
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setState(null);
    window.setTimeout(() => {
      previousFocusRef.current?.focus();
    }, 0);
  }, []);

  const goPrev = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.items.length <= 1) return prev;
      return {
        ...prev,
        index: (prev.index - 1 + prev.items.length) % prev.items.length,
      };
    });
  }, []);

  const goNext = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.items.length <= 1) return prev;
      return {
        ...prev,
        index: (prev.index + 1) % prev.items.length,
      };
    });
  }, []);

  useEffect(() => {
    if (!state) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, closeLightbox, goPrev, goNext]);

  const currentItem = state ? state.items[state.index] : null;
  const hasMultiple = Boolean(state && state.items.length > 1);

  return (
    <LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}

      {state && currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentItem.caption || currentItem.alt || 'Pratinjau gambar'}
          className="fixed inset-0 z-50 flex flex-col bg-[#0e171e]/95 p-4 text-[#edf2f5] backdrop-blur-sm sm:p-6"
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div
            className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-xs uppercase tracking-wider text-[#58c9d1]">
              {state.contextLabel} {state.index + 1} / {state.items.length}
              <span className="hidden sm:inline">
                {' '}
                · TEKAN ESC UNTUK TUTUP
                {hasMultiple ? ' · PANAH ← → PINDAH' : ''}
              </span>
            </p>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeLightbox}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#58c9d1]/50 bg-[#16232d] px-4 py-2 text-sm font-medium text-[#edf2f5] transition-colors hover:border-[#58c9d1] hover:bg-[#1e3140]"
            >
              <span>Tutup (Esc)</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Image Stage */}
          <div
            className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center gap-3 sm:gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {hasMultiple && (
              <button
                type="button"
                onClick={goPrev}
                aria-label="Gambar sebelumnya"
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-[#253744] bg-[#16232d] text-[#edf2f5] transition-colors hover:border-[#58c9d1] hover:text-[#58c9d1]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <figure className="flex max-h-full min-w-0 flex-1 flex-col items-center justify-center overflow-hidden">
              <div className="flex max-h-[76vh] w-full items-center justify-center overflow-auto rounded-xl border border-[#253744] bg-[#16232d] p-2 sm:p-3">
                <SafeImage
                  src={currentItem.url}
                  alt={currentItem.alt}
                  loading="eager"
                  className="max-h-[72vh] w-auto max-w-full rounded-lg object-contain"
                />
              </div>
              {currentItem.caption && (
                <figcaption className="mt-3 max-w-3xl text-center text-sm text-[#a4b5c2]">
                  {currentItem.caption}
                </figcaption>
              )}
            </figure>

            {hasMultiple && (
              <button
                type="button"
                onClick={goNext}
                aria-label="Gambar berikutnya"
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-[#253744] bg-[#16232d] text-[#edf2f5] transition-colors hover:border-[#58c9d1] hover:text-[#58c9d1]"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
