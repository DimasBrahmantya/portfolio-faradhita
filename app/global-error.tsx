'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#f6f3ee',
          color: '#121d26',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <main
          role="alert"
          style={{
            width: '100%',
            maxWidth: '520px',
            borderRadius: '16px',
            border: '1px solid #d98292',
            backgroundColor: '#ffffff',
            padding: '28px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#a61d35',
            }}
          >
            Gangguan Aplikasi
          </p>
          <h1 style={{ margin: '12px 0 0', fontSize: '24px', lineHeight: 1.25 }}>
            Aplikasi tidak dapat dimuat saat ini
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: '15px', lineHeight: 1.6, color: '#4c5b66' }}>
            Terjadi kesalahan tak terduga pada sistem. Silakan muat ulang halaman beberapa saat
            lagi.
          </p>
          {error.digest && (
            <p
              style={{
                margin: '14px 0 0',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#f6f3ee',
                fontSize: '12px',
                color: '#4c5b66',
                fontFamily: 'monospace',
              }}
            >
              Kode referensi: {error.digest}
            </p>
          )}
          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                minHeight: '44px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#a61d35',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Muat Ulang
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
