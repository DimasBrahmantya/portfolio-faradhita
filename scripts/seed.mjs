import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env.local');
const SEED_PATH = path.join(ROOT_DIR, 'seed', 'seed.json');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

const FORCE = process.argv.includes('--force');

function loadEnvLocal() {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('❌ File .env.local tidak ditemukan. Salin .env.example ke .env.local dan isi GAS_URL & GAS_SECRET.');
    process.exit(1);
  }
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.webp') return 'image/webp';
  if (ext === '.png') return 'image/png';
  return 'image/jpeg';
}

async function parseJson(res) {
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`GAS_NON_JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!json.ok) {
    throw new Error(json.error || 'GAS_ERROR');
  }
  return json;
}

async function gasGetAll(gasUrl, gasSecret) {
  const url = `${gasUrl}?action=getAll&secret=${encodeURIComponent(gasSecret)}`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  return parseJson(res);
}

async function gasPost(gasUrl, gasSecret, action, payload = {}) {
  const res = await fetch(gasUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ secret: gasSecret, action, ...payload }),
    redirect: 'follow',
  });
  return parseJson(res);
}

function collectNeededAssetFilenames(seed, tabsToSeed) {
  const files = new Set();
  const maybeAdd = (val) => {
    if (typeof val === 'string' && val.trim() && !val.startsWith('http')) {
      files.add(val.trim());
    }
  };

  if (tabsToSeed.Profile) {
    maybeAdd(seed.profile?.hero_photo_url);
    maybeAdd(seed.profile?.about_photo_url);
    maybeAdd(seed.profile?.og_image_url);
  }
  if (tabsToSeed.Projects) {
    for (const project of seed.projects || []) {
      for (const img of project.images || []) {
        maybeAdd(img.url);
      }
    }
  }
  if (tabsToSeed.Certificates) {
    for (const cert of seed.certificates || []) {
      maybeAdd(cert.image_url);
    }
  }
  if (tabsToSeed.Experience) {
    for (const exp of seed.experience || []) {
      for (const img of exp.images || []) {
        maybeAdd(img.url);
      }
    }
  }
  if (tabsToSeed.Skills) {
    for (const skill of seed.skills || []) {
      maybeAdd(skill.icon_url);
    }
  }
  return [...files];
}

function resolveUrl(value, uploadedMap) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return uploadedMap.get(trimmed) || '';
}

function sortByOrder(items) {
  return [...(items || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
}

async function main() {
  loadEnvLocal();

  const gasUrl = process.env.GAS_URL?.trim();
  const gasSecret = process.env.GAS_SECRET?.trim();

  if (!gasUrl || !gasSecret || gasUrl.includes('XXXX')) {
    console.error('❌ GAS_URL atau GAS_SECRET di .env.local belum valid.');
    process.exit(1);
  }

  if (!fs.existsSync(SEED_PATH)) {
    console.error('❌ File seed/seed.json tidak ditemukan.');
    process.exit(1);
  }

  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  console.log('🔎 Memeriksa isi Google Sheets saat ini...');
  const { data: existing } = await gasGetAll(gasUrl, gasSecret);

  const tabsToSeed = {
    Profile: Object.keys(existing.profile || {}).length === 0 || FORCE,
    Facts: (existing.facts || []).length === 0 || FORCE,
    Projects: (existing.projects || []).length === 0 || FORCE,
    Certificates: (existing.certificates || []).length === 0 || FORCE,
    Experience: (existing.experience || []).length === 0 || FORCE,
    Publications: (existing.publications || []).length === 0 || FORCE,
    Skills: (existing.skills || []).length === 0 || FORCE,
  };

  const anyTabNeedsSeeding = Object.values(tabsToSeed).some(Boolean);
  if (!anyTabNeedsSeeding) {
    console.log('✅ Semua tab sudah berisi data. Lewati seeding (gunakan --force untuk menimpa).');
    return;
  }

  const assetFiles = collectNeededAssetFilenames(seed, tabsToSeed);
  const uploadedMap = new Map();

  if (assetFiles.length > 0) {
    console.log(`📤 Mengunggah ${assetFiles.length} gambar dari /assets ke Google Drive...`);
    for (const filename of assetFiles) {
      const filePath = path.join(ASSETS_DIR, ...filename.split('/'));
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File aset tidak ditemukan: ${filename}`);
        continue;
      }
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      const mimeType = getMimeType(filename);
      const result = await gasPost(gasUrl, gasSecret, 'uploadImage', {
        filename: path.basename(filename),
        mimeType,
        base64,
      });
      uploadedMap.set(filename, result.url);
      console.log(`   ✔ ${filename} → ${result.url}`);
    }
  }

  const summary = {
    uploadedImages: uploadedMap.size,
    seededTabs: [],
    skippedTabs: [],
  };

  if (tabsToSeed.Profile) {
    console.log('📝 Menulis tab Profile...');
    const profileValues = {
      ...seed.profile,
      hero_photo_url: resolveUrl(seed.profile.hero_photo_url, uploadedMap),
      about_photo_url: resolveUrl(seed.profile.about_photo_url, uploadedMap),
      og_image_url: resolveUrl(seed.profile.og_image_url, uploadedMap),
    };
    await gasPost(gasUrl, gasSecret, 'updateProfile', { values: profileValues });
    summary.seededTabs.push(`Profile (${Object.keys(profileValues).length} key)`);
  } else {
    summary.skippedTabs.push('Profile');
  }

  const seedListTab = async (sheetName, items, transform) => {
    if (!tabsToSeed[sheetName]) {
      summary.skippedTabs.push(sheetName);
      return;
    }
    const existingRows = existing[sheetName.toLowerCase()];
    if (FORCE && Array.isArray(existingRows) && existingRows.length > 0) {
      console.log(`🗑️  Menghapus ${existingRows.length} baris lama di ${sheetName} (--force)...`);
      for (const oldItem of existingRows) {
        if (oldItem?.id) {
          await gasPost(gasUrl, gasSecret, 'deleteItem', { sheet: sheetName, id: oldItem.id });
        }
      }
    }
    const ordered = sortByOrder(items);
    console.log(`📝 Menulis tab ${sheetName} (${ordered.length} baris)...`);
    for (const item of ordered) {
      const payload = transform(item);
      await gasPost(gasUrl, gasSecret, 'createItem', { sheet: sheetName, item: payload });
    }
    summary.seededTabs.push(`${sheetName} (${ordered.length} baris)`);
  };

  await seedListTab('Facts', seed.facts, (item) => ({
    visible: item.visible !== false,
    value: item.value,
    label: item.label,
  }));

  await seedListTab('Projects', seed.projects, (item) => ({
    visible: item.visible !== false,
    title: item.title,
    slug: item.slug || '',
    tags: item.tags || '',
    description: item.description || '',
    points: JSON.stringify(item.points || []),
    images: JSON.stringify(
      (item.images || []).map((img) => ({
        url: resolveUrl(img.url, uploadedMap),
        caption: img.caption || '',
        wide: Boolean(img.wide),
      }))
    ),
  }));

  await seedListTab('Certificates', seed.certificates, (item) => ({
    visible: item.visible !== false,
    title: item.title,
    image_url: resolveUrl(item.image_url, uploadedMap),
    issuer: item.issuer || '',
    issued_at: item.issued_at || '',
    credential_url: item.credential_url || '',
  }));

  await seedListTab('Experience', seed.experience, (item) => ({
    visible: item.visible !== false,
    type: item.type || 'work',
    period: item.period || '',
    title: item.title || '',
    subtitle: item.subtitle || '',
    points: JSON.stringify(item.points || []),
    images: JSON.stringify(
      (item.images || []).map((img) => ({
        url: resolveUrl(img.url, uploadedMap),
        caption: img.caption || '',
        wide: Boolean(img.wide),
      }))
    ),
  }));

  await seedListTab('Publications', seed.publications, (item) => ({
    visible: item.visible !== false,
    title: item.title || '',
    venue: item.venue || '',
    date: item.date || '',
    url: item.url || '',
  }));

  await seedListTab('Skills', seed.skills, (item) => ({
    visible: item.visible !== false,
    name: item.name || '',
    icon_url: resolveUrl(item.icon_url, uploadedMap),
  }));

  console.log('\n🎉 Ringkasan Seed:');
  console.log(`   - Gambar terunggah ke Drive: ${summary.uploadedImages}`);
  console.log(`   - Tab diisi: ${summary.seededTabs.join(', ') || '-'}`);
  console.log(`   - Tab dilewati (sudah ada isi): ${summary.skippedTabs.join(', ') || '-'}`);
}

main().catch((err) => {
  console.error('❌ Seed gagal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
