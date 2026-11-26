import React from 'react';

export default function PublicLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat portofolio"
      className="flex min-h-screen flex-col bg-[var(--bg)]"
    >
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surf)]/80 px-4 sm:px-6">
          <div className="h-6 w-14 animate-pulse rounded-md bg-[var(--line)]" />
          <div className="hidden items-center gap-3 md:flex">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-7 w-20 animate-pulse rounded-full bg-[var(--line)]/80"
              />
            ))}
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
      </div>

      {/* Hero skeleton */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 lg:gap-14">
          <div className="order-1 flex justify-center md:order-2 md:col-span-5 md:justify-end">
            <div className="aspect-[4/5] w-full max-w-[280px] animate-pulse rounded-t-full rounded-b-2xl border border-[var(--line)] bg-[var(--soft)] sm:max-w-[320px] lg:max-w-[360px]" />
          </div>

          <div className="order-2 space-y-5 md:order-1 md:col-span-7">
            <div className="h-4 w-48 animate-pulse rounded bg-[var(--soft)]" />
            <div className="space-y-3">
              <div className="h-12 w-3/4 animate-pulse rounded-lg bg-[var(--line)]" />
              <div className="h-12 w-2/3 animate-pulse rounded-lg bg-[var(--line)]" />
            </div>
            <div className="h-5 w-full max-w-md animate-pulse rounded bg-[var(--line)]/70" />
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <div className="h-11 w-40 animate-pulse rounded-lg bg-[var(--line)]" />
              <div className="h-11 w-40 animate-pulse rounded-lg bg-[var(--line)]/70" />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-7 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-8 w-16 animate-pulse rounded bg-[var(--soft)]" />
                  <div className="h-4 w-28 animate-pulse rounded bg-[var(--line)]/70" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section skeleton */}
        <div className="mt-20 space-y-6 rounded-2xl border border-[var(--line)] bg-[var(--surf)] p-6 sm:p-8">
          <div className="h-4 w-40 animate-pulse rounded bg-[var(--soft)]" />
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[var(--line)]" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="aspect-[16/10] w-full animate-pulse rounded-xl bg-[var(--bg)]" />
            <div className="aspect-[16/10] w-full animate-pulse rounded-xl bg-[var(--bg)]" />
          </div>
        </div>
      </main>
    </div>
  );
}
