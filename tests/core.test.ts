import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanIsoDates } from '@/lib/date';
import {
  clearLoginFailures,
  getRateLimitStatus,
  recordLoginFailure,
} from '@/lib/rate-limit';
import { normalizeSiteText } from '@/lib/site-text';
import {
  extractDriveFileId,
  getDriveImageCandidates,
  isValidHttpUrl,
  isValidSafeUrl,
  safeHref,
  safeImageUrl,
} from '@/lib/url';
import {
  profileUpdateSchema,
  resolveUniqueSlug,
  serializeItemForSheet,
} from '@/lib/validation';

test('url sanitization blocks javascript:, data:, and protocol-relative URLs', () => {
  assert.equal(isValidSafeUrl('https://example.com'), true);
  assert.equal(isValidSafeUrl('mailto:fara@example.com'), true);
  assert.equal(isValidSafeUrl('/admin'), true);
  assert.equal(isValidSafeUrl('//evil.com'), false);
  assert.equal(isValidSafeUrl('javascript:alert(1)'), false);
  assert.equal(isValidHttpUrl('mailto:fara@example.com'), false);
  assert.equal(safeHref('fara@example.com'), 'mailto:fara@example.com');
  assert.equal(safeHref('javascript:alert(1)'), null);
  assert.equal(safeImageUrl('data:image/png;base64,abc'), '');
});

test('Google Drive URL helpers extract file IDs and return fallback candidates', () => {
  assert.equal(
    extractDriveFileId('https://lh3.googleusercontent.com/d/abc123XYZ'),
    'abc123XYZ'
  );
  assert.equal(
    extractDriveFileId('https://drive.google.com/file/d/abc123XYZ/view?usp=sharing'),
    'abc123XYZ'
  );
  assert.equal(
    getDriveImageCandidates('https://lh3.googleusercontent.com/d/abc123XYZ').length,
    3
  );
});

test('resolveUniqueSlug avoids duplicates and reserved built-in section IDs', () => {
  assert.equal(resolveUniqueSlug('Prestasi', []), 'prestasi');
  assert.equal(resolveUniqueSlug('Prestasi', ['prestasi']), 'prestasi-2');
  assert.equal(resolveUniqueSlug('Prestasi', ['prestasi', 'prestasi-2']), 'prestasi-3');
  assert.equal(resolveUniqueSlug('project', []), 'project-2');
  assert.equal(resolveUniqueSlug('kontak', ['kontak-2']), 'kontak-3');
  assert.equal(resolveUniqueSlug('!!!', []), 'section');
});

test('validation schemas serialize items and enforce profile rules', () => {
  assert.deepEqual(serializeItemForSheet('Projects', { visible: false }, true), {
    visible: false,
  });

  const project = serializeItemForSheet('Projects', {
    title: 'Analisis RFM',
    tags: ['Python', 'SQL'],
    description: 'Segmentasi pelanggan.',
  });
  assert.equal(project.slug, 'analisis-rfm');
  assert.equal(project.tags, 'Python, SQL');

  assert.equal(profileUpdateSchema.safeParse({}).success, false);
  assert.equal(profileUpdateSchema.safeParse({ full_name_1: '' }).success, false);
  assert.equal(profileUpdateSchema.safeParse({ full_name_1: 'Faradhita' }).success, true);
  assert.equal(profileUpdateSchema.safeParse({ unknown_key: 'x' }).success, false);
});

test('rate-limit blocks after 5 failed attempts and resets on clear', () => {
  const ip = '203.0.113.42';
  clearLoginFailures(ip);

  assert.equal(getRateLimitStatus(ip).blocked, false);
  for (let i = 0; i < 4; i += 1) {
    assert.equal(recordLoginFailure(ip).blocked, false);
  }
  const fifth = recordLoginFailure(ip);
  assert.equal(fifth.blocked, true);
  assert.equal(fifth.remaining, 0);

  clearLoginFailures(ip);
  assert.equal(getRateLimitStatus(ip).blocked, false);
});

test('cleanIsoDates and normalizeSiteText handle Sheets edge cases', () => {
  assert.equal(cleanIsoDates('2025-03-31T17:00:00.000Z'), 'April 2025');
  assert.equal(cleanIsoDates('Polos tanpa tanggal'), 'Polos tanpa tanggal');

  const text = normalizeSiteText({ nav_about: '  Profil  ', nav_projects: '' });
  assert.equal(text.nav_about, 'Profil');
  assert.equal(text.nav_projects, 'Project');
});
