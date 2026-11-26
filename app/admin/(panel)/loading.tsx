import React from 'react';

export default function AdminPanelLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat editor admin" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3.5 w-32 animate-pulse rounded bg-[var(--soft)]" />
          <div className="h-8 w-64 animate-pulse rounded-lg bg-[var(--line)]" />
        </div>
        <div className="h-11 w-36 animate-pulse rounded-[var(--radius-control)] bg-[var(--line)]" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-3 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-5 xl:col-span-5">
          <div className="h-3.5 w-44 animate-pulse rounded bg-[var(--soft)]" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-20 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--bg)]"
            />
          ))}
        </div>

        <div className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surf)] p-6 xl:col-span-7">
          <div className="h-6 w-48 animate-pulse rounded bg-[var(--line)]" />
          <div className="h-11 w-full animate-pulse rounded-[var(--radius-control)] bg-[var(--bg)]" />
          <div className="h-28 w-full animate-pulse rounded-[var(--radius-control)] bg-[var(--bg)]" />
          <div className="h-11 w-40 animate-pulse rounded-[var(--radius-control)] bg-[var(--soft)]" />
        </div>
      </div>
    </div>
  );
}
