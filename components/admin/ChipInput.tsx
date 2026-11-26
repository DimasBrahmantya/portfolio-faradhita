'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ChipInputProps {
  id?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  maxItems?: number;
}

export function ChipInput({
  id,
  values,
  onChange,
  placeholder = '+ Ketik tag lalu Enter…',
  maxItems = 20,
}: ChipInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const cleaned = raw.trim();
    if (!cleaned) return;
    if (values.length >= maxItems) return;
    const exists = values.some(
      (item) => item.toLowerCase() === cleaned.toLowerCase()
    );
    if (!exists) {
      onChange([...values, cleaned]);
    }
    setDraft('');
  };

  const removeTag = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      removeTag(values.length - 1);
    }
  };

  return (
    <div className="flex min-h-[44px] flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--input-bg)] px-3 py-2 focus-within:border-[var(--teal)]">
      {values.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 rounded-[var(--radius-chip)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--teal)]"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(idx)}
            aria-label={`Hapus tag ${tag}`}
            className="inline-flex h-4 w-4 items-center justify-center rounded-sm hover:bg-[var(--teal)]/15"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
        placeholder={placeholder}
        className="min-w-[140px] flex-1 bg-transparent py-0.5 text-sm text-[var(--ink)] placeholder:text-[var(--mute)]/70 focus:outline-none"
      />
    </div>
  );
}
