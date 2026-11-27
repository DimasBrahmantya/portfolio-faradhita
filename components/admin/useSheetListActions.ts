'use client';

import { useState } from 'react';
import { useAdminContext } from '@/components/admin/AdminContext';
import {
  apiDeleteItem,
  apiReorderItems,
  apiUpdateItem,
} from '@/components/admin/api';
import type { ContentBundle, ListItemBase, SheetName } from '@/types/content';

type SheetContentKey =
  | 'facts'
  | 'projects'
  | 'certificates'
  | 'experience'
  | 'publications'
  | 'skills';

export function useSheetListActions<K extends SheetContentKey>(
  sheet: SheetName,
  contentKey: K,
  onAfterDelete?: (id: string) => void
) {
  type Item = ContentBundle[K][number] & ListItemBase;

  const { content, setContent } = useAdminContext();
  const items = (content?.[contentKey] ?? []) as Item[];

  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleVisible = async (item: Item, nextVisible: boolean) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiUpdateItem(sheet, item.id, { visible: nextVisible });
      setContent((prev) =>
        prev
          ? {
              ...prev,
              [contentKey]: (prev[contentKey] as Item[]).map((entry) =>
                entry.id === item.id ? { ...entry, visible: nextVisible } : entry
              ),
            }
          : prev
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengubah status tampil.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: Item) => {
    setBusyId(item.id);
    setErrorMsg(null);
    try {
      await apiDeleteItem(sheet, item.id);
      setContent((prev) =>
        prev
          ? {
              ...prev,
              [contentKey]: (prev[contentKey] as Item[]).filter(
                (entry) => entry.id !== item.id
              ),
            }
          : prev
      );
      onAfterDelete?.(item.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus item.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(swapIdx, 0, moved);
    const reindexed = next.map((item, idx) => ({ ...item, order: idx + 1 }));

    setReordering(true);
    setErrorMsg(null);
    try {
      await apiReorderItems(
        sheet,
        reindexed.map((item) => item.id)
      );
      setContent((prev) => (prev ? { ...prev, [contentKey]: reindexed } : prev));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan urutan.');
    } finally {
      setReordering(false);
    }
  };

  return {
    busyId,
    reordering,
    errorMsg,
    setErrorMsg,
    handleToggleVisible,
    handleDelete,
    handleMove,
  };
}
