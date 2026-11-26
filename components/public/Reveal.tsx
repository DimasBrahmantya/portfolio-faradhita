'use client';

import React, { useEffect, useRef, useState } from 'react';

export type RevealVariant =
  | 'fade-up'
  | 'fade-in'
  | 'fade-left'
  | 'fade-right'
  | 'scale-in';

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  once?: boolean;
  className?: string;
}

const HIDDEN_CLASSES: Record<RevealVariant, string> = {
  'fade-up': 'opacity-0 translate-y-6',
  'fade-in': 'opacity-0',
  'fade-left': 'opacity-0 -translate-x-6',
  'fade-right': 'opacity-0 translate-x-6',
  'scale-in': 'opacity-0 scale-[0.96]',
};

const VISIBLE_CLASSES = 'opacity-100 translate-y-0 translate-x-0 scale-100';

export function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  once = false,
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -36px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] ${
        visible ? VISIBLE_CLASSES : HIDDEN_CLASSES[variant]
      } ${className}`}
    >
      {children}
    </div>
  );
}
