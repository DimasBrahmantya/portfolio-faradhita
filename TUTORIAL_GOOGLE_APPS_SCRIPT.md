# Tutorial — Hubungkan Next.js ↔ Google Apps Script ↔ Google Sheets

Waktu: ± 20 menit. Semua gratis.

Alur data:
```
Next.js (server) ──POST/GET──► Apps Script Web App ──► Google Sheets (data)
                                                  └──► Google Drive (gambar)
```

---

## Langkah 1 — Buat Google Sheet

1. Buka https://sheets.new → beri nama **Portfolio Fara**.
2. Biarkan kosong. Tab dan header dibuat otomatis oleh fungsi `setup()` di langkah 4.

## Langkah 2 — Buat folder Drive untuk gambar

1. Buka https://drive.google.com → Baru → Folder baru → nama **portfolio-**.
2. Buka folder itu. Lihat URL: `https://drive.google.com/drive/folders/`**`1AbCdEfGhIjK...`**
3. Salin bagian tebal = **DRIVE_FOLDER_ID**.

## Langkah 3 — Pasang Apps Script

1. Di Google Sheet: menu **Extensions → Apps Script**. (Harus lewat sini supaya script terikat ke sheet.)
2. Hapus isi `Code.gs` bawaan, tempel **seluruh kode di bagian "Code.gs"** di bawah. Simpan (Ctrl+S).
3. Klik ikon roda gigi **Project Settings** → bagian **Script Properties** → **Add script property**, tambah dua:

| Property | Value |
|---|---|
| `GAS_SECRET` | string acak panjang (lihat cara buat di bawah) |
| `DRIVE_FOLDER_ID` | ID folder dari langkah 2 |

Buat secret acak, pilih salah satu:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
# atau
openssl rand -hex 24
```
Simpan secret itu. Nanti dipakai lagi di `.env.local` Next.js. **Jangan** taruh secret di dalam kode.

## Langkah 4 — Jalankan setup & beri izin

1. Di editor, pilih fungsi **`setup`** di dropdown atas → **Run**.
2. Muncul "Authorization required" → **Review permissions** → pilih akun Google kamu.
3. Muncul "Google hasn't verified this app" → **Advanced** → **Go to (nama proyek) (unsafe)** → **Allow**. Ini aman: script milikmu sendiri.
4. Setelah selesai, cek Sheet: ada tab `Profile, Facts, Projects, Certificates, Experience, Publications, Skills` dengan header di baris 1. (Tab bawaan `Sheet1`/`Lembar1` boleh dihapus.)
5. Pilih fungsi **`authorizeDrive`** → **Run** (supaya izin Drive juga disetujui). Log harus menulis nama folder.

## Langkah 5 — Deploy sebagai Web App

1. Klik **Deploy → New deployment**.
2. Klik ikon roda gigi di samping "Select type" → **Web app**.
3. Isi:
   - Description: `v1`
   - **Execute as: Me**
   - **Who has access: Anyone**
4. **Deploy** → salin **Web app URL**, bentuknya `https://script.google.com/macros/s/AKfy.../exec`.

> "Anyone" wajib supaya server Next.js bisa memanggil tanpa login Google. Pengaman = `GAS_SECRET`. Jadi URL + secret harus dirahasiakan.

## Langkah 6 — Tes dari browser & terminal

**Tes GET** (ganti URL dan SECRET), tempel di browser:
```
https://script.google.com/macros/s/XXXX/exec?action=getAll&secret=SECRET_KAMU
```
Harus muncul: `{"ok":true,"data":{"profile":{}, "facts":[], ...}}`.

Dengan secret salah → `{"ok":false,"error":"unauthorized"}`. Itu benar.

**Tes POST** (tulis ke Sheet):
```bash
curl -L -X POST "https://script.google.com/macros/s/XXXX/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"secret":"SECRET_KAMU","action":"updateProfile","values":{"role":"Data Analyst"}}'
```
Harus `{"ok":true}` dan tab `Profile` terisi baris `role`.

`-L` penting: Apps Script membalas dengan redirect 302.

## Langkah 7 — Sambungkan ke Next.js

`.env.local`:
```
GAS_URL=https://script.google.com/macros/s/XXXX/exec
GAS_SECRET=SECRET_KAMU
ADMIN_PASSWORD=password-owner-yang-panjang
SESSION_SECRET=string-acak-minimal-32-karakter
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Pastikan `.env.local` ada di `.gitignore`.

`lib/gas.ts` (referensi; agent Antigravity akan membuat yang setara):
```ts
import 'server-only';

const GAS_URL = process.env.GAS_URL!;
const GAS_SECRET = process.env.GAS_SECRET!;

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('GAS_NON_JSON: ' + text.slice(0, 200));
  }
  if (!json.ok) throw new Error(json.error || 'GAS_ERROR');
  return json as T;
}

export async function gasGet<T>(action: string, next?: NextFetchRequestConfig): Promise<T> {
  const url = `${GAS_URL}?action=${encodeURIComponent(action)}&secret=${encodeURIComponent(GAS_SECRET)}`;
  return parse<T>(await fetch(url, { next }));
}

export async function gasPost<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ secret: GAS_SECRET, action, ...payload }),
    redirect: 'follow',
    cache: 'no-store',
  });
  return parse<T>(res);
}
```

Pemakaian di halaman publik:
```ts
const { data } = await gasGet<{ data: ContentBundle }>('getAll', { tags: ['content'], revalidate: 300 });
```

Pemakaian di route admin (contoh simpan profil):
```ts
import { revalidateTag } from 'next/cache';
await gasPost('updateProfile', { values });
revalidateTag('content');
```

## Langkah 8 — Isi data awal (seed)

Setelah `.env.local` terisi, jalankan skrip seed dari Tahap 2 di prompt:
```bash
node scripts/seed.mjs
```
Skrip itu mengunggah 15 gambar ke Drive dan mengisi semua tab dengan konten portfolio lama.

## Langkah 9 — Deploy ke Vercel

1. Push ke GitHub → Import di https://vercel.com/new.
2. **Settings → Environment Variables**: isi `GAS_URL`, `GAS_SECRET`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` (pakai domain Vercel).
3. Deploy. Buka `/admin/login`, tes edit satu teks, cek halaman publik berubah.

## Kalau ubah Code.gs di kemudian hari

Menyimpan kode **tidak** memperbarui Web App. Harus buat versi baru:
**Deploy → Manage deployments → ikon pensil → Version: New version → Deploy**. URL tetap sama.

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| Respons berupa HTML (halaman login Google) | Akses bukan "Anyone" | Deploy ulang dengan Who has access = Anyone |
| `unauthorized` | `GAS_SECRET` di Next.js ≠ Script Property | Samakan keduanya, tanpa spasi/kutip |
| `GAS_NON_JSON` | URL salah atau berakhiran `/dev` | Pakai URL `/exec` dari New deployment |
| Perubahan kode tidak berpengaruh | Belum deploy versi baru | Manage deployments → New version |
| `Exception: You do not have permission to call DriveApp.getFolderById` | Izin Drive belum disetujui | Jalankan `authorizeDrive`, klik Allow |
| `Exception: No item with the given ID` | `DRIVE_FOLDER_ID` salah | Salin ulang ID dari URL folder |
| Teks seperti "Juli 2025" jadi tanggal | Kolom bukan plain text | Jalankan ulang `setup()` (mengatur format teks) |
| Gambar tidak tampil di situs | File Drive tidak publik | Pastikan `setSharing` berhasil; buka URL gambar di tab incognito |
| `POST` dari Next.js gagal 302/405 | Tidak mengikuti redirect | Pakai `redirect: 'follow'` dan header `text/plain` |
| `Service invoked too many times` | Kuota harian Apps Script | Pastikan cache `revalidate` aktif; kurangi fetch |

---

## Code.gs

Tempel utuh ke `apps-script/Code.gs` (dan ke editor Apps Script).

```javascript
/**
 * Portfolio v2 — Backend Google Apps Script
 * Script Properties wajib: GAS_SECRET, DRIVE_FOLDER_ID
 * Script harus terikat ke Spreadsheet (Extensions > Apps Script).
 */

const SHEETS = {
  Profile:      ['key', 'value'],
  Facts:        ['id', 'order', 'visible', 'value', 'label'],
  Projects:     ['id', 'order', 'visible', 'title', 'tags', 'description', 'points', 'images', 'slug'],
  Certificates: ['id', 'order', 'visible', 'title', 'image_url', 'issuer', 'issued_at', 'credential_url'],
  Experience:   ['id', 'order', 'visible', 'type', 'period', 'title', 'subtitle', 'points'],
  Publications: ['id', 'order', 'visible', 'title', 'venue', 'date', 'url'],
  Skills:       ['id', 'order', 'visible', 'name', 'icon_url'],
};
const LIST_SHEETS = ['Facts', 'Projects', 'Certificates', 'Experience', 'Publications', 'Skills'];
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BASE64_LENGTH = 7000000; // ± 5 MB file

/* ---------- Setup (jalankan manual sekali) ---------- */

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(function (name) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    const cols = SHEETS[name].length;
    sh.getRange(1, 1, sh.getMaxRows(), cols).setNumberFormat('@'); // plain text, cegah auto-konversi angka/tanggal
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, cols).setValues([SHEETS[name]]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  });
}

function authorizeDrive() {
  const folder = DriveApp.getFolderById(prop_('DRIVE_FOLDER_ID'));
  Logger.log('Folder OK: ' + folder.getName());
}

/* ---------- Entry points ---------- */

function doGet(e) {
  return handle_(function () {
    const p = (e && e.parameter) || {};
    auth_(p.secret);
    if (p.action === 'getAll') return { data: getAll_() };
    throw new Error('unknown_action');
  });
}

function doPost(e) {
  return handle_(function () {
    const body = JSON.parse(e.postData.contents);
    auth_(body.secret);
    return route_(body);
  });
}

function route_(b) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (b.action) {
      case 'updateProfile': return updateProfile_(b.values || {});
      case 'createItem':    return createItem_(b.sheet, b.item || {});
      case 'updateItem':    return updateItem_(b.sheet, b.id, b.item || {});
      case 'deleteItem':    return deleteItem_(b.sheet, b.id);
      case 'reorder':       return reorder_(b.sheet, b.ids || []);
      case 'uploadImage':   return uploadImage_(b);
      default: throw new Error('unknown_action');
    }
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Helpers ---------- */

function prop_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function auth_(secret) {
  const real = prop_('GAS_SECRET');
  if (!real || secret !== real) throw new Error('unauthorized');
}

function handle_(fn) {
  try {
    return json_(Object.assign({ ok: true }, fn()));
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  if (LIST_SHEETS.indexOf(name) === -1) throw new Error('invalid_sheet');
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('sheet_not_found: ' + name);
  return sh;
}

function toCell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function findRow_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(1, 1, last, 1).getValues().map(function (r) { return String(r[0]); });
  const idx = ids.indexOf(String(id));
  return idx < 1 ? -1 : idx + 1; // idx 0 = header
}

function headers_(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}

/* ---------- Read ---------- */

function getAll_() {
  return {
    profile: readProfile_(),
    facts: readList_('Facts'),
    projects: readList_('Projects'),
    certificates: readList_('Certificates'),
    experience: readList_('Experience'),
    publications: readList_('Publications'),
    skills: readList_('Skills'),
  };
}

function readProfile_() {
  const sh = SpreadsheetApp.getActive().getSheetByName('Profile');
  const out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (r[0] !== '') out[String(r[0])] = r[1] === null ? '' : String(r[1]);
  });
  return out;
}

function readList_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getDataRange().getValues();
  const head = vals[0];
  return vals.slice(1)
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      const o = {};
      head.forEach(function (h, i) { o[h] = r[i] === null ? '' : r[i]; });
      o.order = Number(o.order) || 0;
      o.visible = String(o.visible).toUpperCase() !== 'FALSE';
      return o;
    })
    .sort(function (a, b) { return a.order - b.order; });
}

/* ---------- Write ---------- */

function updateProfile_(values) {
  const sh = SpreadsheetApp.getActive().getSheetByName('Profile');
  if (!sh) throw new Error('sheet_not_found: Profile');
  const last = sh.getLastRow();
  const keys = last >= 2
    ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); })
    : [];
  Object.keys(values).forEach(function (k) {
    const i = keys.indexOf(k);
    if (i >= 0) {
      sh.getRange(i + 2, 2).setValue(toCell_(values[k]));
    } else {
      sh.appendRow([k, toCell_(values[k])]);
      keys.push(k);
    }
  });
  return {};
}

function createItem_(name, item) {
  const sh = sheet_(name);
  const head = headers_(sh);
  const existing = readList_(name);
  const nextOrder = existing.reduce(function (m, x) { return Math.max(m, x.order); }, 0) + 1;
  const id = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
  const row = head.map(function (h) {
    if (h === 'id') return id;
    if (h === 'order') return nextOrder;
    if (h === 'visible') return item.visible === false ? 'FALSE' : 'TRUE';
    return toCell_(item[h]);
  });
  sh.appendRow(row);
  return { id: id };
}

function updateItem_(name, id, item) {
  const sh = sheet_(name);
  const row = findRow_(sh, id);
  if (row < 0) throw new Error('not_found');
  const head = headers_(sh);
  head.forEach(function (h, i) {
    if (h === 'id' || h === 'order') return;
    if (Object.prototype.hasOwnProperty.call(item, h)) {
      const v = h === 'visible' ? (item[h] === false || item[h] === 'FALSE' ? 'FALSE' : 'TRUE') : toCell_(item[h]);
      sh.getRange(row, i + 1).setValue(v);
    }
  });
  return {};
}

function deleteItem_(name, id) {
  const sh = sheet_(name);
  const row = findRow_(sh, id);
  if (row < 0) throw new Error('not_found');
  sh.deleteRow(row);
  return {};
}

function reorder_(name, ids) {
  const sh = sheet_(name);
  const orderCol = headers_(sh).indexOf('order') + 1;
  if (orderCol < 1) throw new Error('no_order_column');
  ids.forEach(function (id, i) {
    const row = findRow_(sh, id);
    if (row > 0) sh.getRange(row, orderCol).setValue(String(i + 1));
  });
  return {};
}

/* ---------- Upload gambar ---------- */

function uploadImage_(b) {
  if (!b.base64 || !b.filename) throw new Error('missing_file');
  if (ALLOWED_MIME.indexOf(b.mimeType) === -1) throw new Error('invalid_mime');
  if (b.base64.length > MAX_BASE64_LENGTH) throw new Error('file_too_large');
  const safe = String(b.filename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  const name = Date.now() + '-' + safe;
  const blob = Utilities.newBlob(Utilities.base64Decode(b.base64), b.mimeType, name);
  const folder = DriveApp.getFolderById(prop_('DRIVE_FOLDER_ID'));
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return {
    url: 'https://lh3.googleusercontent.com/d/' + file.getId(),
    fileId: file.getId(),
  };
}
```
