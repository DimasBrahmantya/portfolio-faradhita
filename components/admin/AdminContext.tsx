'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ContentBundle } from '@/types/content';

interface AdminContextValue {
  content: ContentBundle | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  setContent: React.Dispatch<React.SetStateAction<ContentBundle | null>>;
  refreshContent: () => Promise<void>;
  confirmDiscardIfDirty: () => boolean;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({
  initialContent,
  initialError = null,
  children,
}: {
  initialContent: ContentBundle | null;
  initialError?: string | null;
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<ContentBundle | null>(initialContent);
  const [loading, setLoading] = useState(!initialContent && !initialError);
  const [error, setError] = useState<string | null>(initialError);
  const [isDirty, setIsDirty] = useState(false);

  const refreshContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/content', { cache: 'no-store' });
      const json = (await res.json()) as {
        ok: boolean;
        data?: ContentBundle;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error || 'Gagal memuat data konten.');
      }
      setContent(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data konten.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const confirmDiscardIfDirty = useCallback(() => {
    if (!isDirty) return true;
    const confirmed = window.confirm(
      'Ada perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?'
    );
    if (confirmed) {
      setIsDirty(false);
    }
    return confirmed;
  }, [isDirty]);

  const value = useMemo<AdminContextValue>(
    () => ({
      content,
      loading,
      error,
      isDirty,
      setIsDirty,
      setContent,
      refreshContent,
      confirmDiscardIfDirty,
    }),
    [content, loading, error, isDirty, refreshContent, confirmDiscardIfDirty]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdminContext harus digunakan di dalam AdminProvider.');
  }
  return ctx;
}
