# PRD — Portfolio Faradhita Eka Septiana v2

Versi 1.0 · Stack: Next.js (App Router) + Google Apps Script + Google Sheets (+ Google Drive untuk gambar)

---

## 1. Ringkasan

Portfolio saat ini = 1 file HTML statis (Data Analyst / Data Science). Isi di-hardcode, gambar base64 di dalam HTML. Ubah teks atau tambah sertifikat/project = edit kode.

V2: desain ulang lewat Figcraft, isi pindah ke Google Sheets, ada 2 halaman:

| Halaman | Route | Fungsi |
|---|---|---|
| Tampilan publik | `/` | Menampilkan portfolio untuk rekruter/pengunjung |
| Editor | `/admin` | Owner login, tambah/ubah/hapus project, sertifikat, pengalaman, keahlian, teks profil |

Backend = Google Apps Script (Web App) yang membaca/menulis Google Sheets. Gambar disimpan di Google Drive.

## 2. Tujuan & Non-tujuan

**Tujuan**
1. Owner ubah semua isi portfolio tanpa menyentuh kode.
2. Tampilan publik cepat, rapi di mobile, SEO dasar baik.
3. Biaya Rp0 (Vercel hobby + Google gratis).
4. Desain baru mengikuti hasil Figcraft.

**Non-tujuan (v1 rilis ini)**
- Multi-user / multi-role.
- Blog, komentar, analytics kustom.
- Database selain Google Sheets.
- Multi-bahasa (konten Bahasa Indonesia saja; struktur boleh disiapkan).

## 3. Pengguna

| Peran | Kebutuhan |
|---|---|
| Visitor (rekruter, dosen, HRD) | Lihat siapa Faradhita, project, sertifikat, pengalaman; hubungi cepat via WhatsApp/LinkedIn/Email |
| Owner (Faradhita) | Login admin, edit konten, upload gambar, atur urutan, sembunyikan item tanpa menghapus |

## 4. Arsitektur

```
Browser (Visitor) ──► Next.js (Vercel)
                         │  Server Component fetch (ISR, tag "content")
                         ▼
                 Google Apps Script Web App  ◄── Next.js API routes (/api/admin/*)
                         │                           ▲
                         ▼                           │ session cookie
               Google Sheets (data)            Browser (Owner, /admin)
               Google Drive (gambar)
```

Aturan penting:
- Browser **tidak pernah** memanggil Apps Script langsung. Semua lewat Next.js (server) supaya `GAS_SECRET` tidak bocor dan tidak kena CORS.
- Halaman publik: fetch di server, cache dengan `next: { tags: ['content'], revalidate: 300 }`.
- Setelah admin simpan: API route memanggil `revalidateTag('content')` → halaman publik langsung update.

## 5. Inventaris konten existing

Semua konten ini harus ikut dimigrasi ke Sheets (seed data ada di Lampiran A).

1. **Nav**: Tentang, Project, Sertifikat, Pengalaman, Keahlian, Kontak. Logo teks "FES".
2. **Hero**: nama (Faradhita / Eka Septiana), role "Data Analyst & Data Science · Lulusan Teknik Informatika", 2 tombol (Lihat project, Hubungi saya), foto portrait.
3. **Tentang**: foto, paragraf bio, 3 fakta angka (IPK 3,88 · 3 project data bersertifikat · 1 publikasi jurnal).
4. **Project** (3): Retail Transaction Dashboard, Analisis Sentimen Tweet (NLP), Segmentasi Pelanggan dengan RFM. Tiap project: judul, tags, deskripsi, poin-poin (boleh bold label), galeri gambar + caption.
5. **Pengalaman & pendidikan** (4 item timeline) + 1 kartu publikasi jurnal (judul, keterangan, link DOI).
6. **Sertifikat** (6): gambar + judul, klik untuk zoom (lightbox).
7. **Keahlian**: 7 tools berupa ikon (Python, Google Colab, VS Code, Looker Studio, Excel, Word, PowerPoint).
8. **Kontak**: WhatsApp, LinkedIn, Email + teks ajakan. Footer: lokasi.
9. Fitur existing yang dipertahankan: dark mode otomatis (prefers-color-scheme), lightbox zoom gambar, smooth scroll, sticky nav, responsif.

## 6. Data model (Google Sheets)

Satu spreadsheet, beberapa tab. Baris 1 = header. Kolom wajib di semua tab list: `id`, `order`, `visible`.

### Tab `Profile` (key–value)
| key | value |
|---|---|
| `full_name_1` | Faradhita |
| `full_name_2` | Eka Septiana |
| `logo_text` | FES |
| `role` | Data Analyst & Data Science · Lulusan Teknik Informatika |
| `hero_cta_primary` / `hero_cta_secondary` | label tombol |
| `hero_photo_url` | URL gambar |
| `about_photo_url` | URL gambar |
| `about_text` | paragraf bio |
| `contact_intro` | teks ajakan |
| `whatsapp_url`, `linkedin_url`, `email` | kontak |
| `location` | Jombang, Jawa Timur |
| `meta_title`, `meta_description`, `og_image_url` | SEO |

### Tab `Facts`
`id | order | visible | value | label`

### Tab `Projects`
`id | order | visible | title | tags | description | points | images | slug`
- `tags`: dipisah koma.
- `points`: JSON array string, tiap elemen `{ "label": "Hasil", "text": "..." }` (label boleh kosong).
- `images`: JSON array string, tiap elemen `{ "url": "...", "caption": "...", "wide": true|false }`.

### Tab `Certificates`
`id | order | visible | title | image_url | issuer | issued_at | credential_url`

### Tab `Experience`
`id | order | visible | type | period | title | subtitle | points`
- `type`: `work` | `education` | `training`.
- `points`: JSON array string berisi teks.

### Tab `Publications`
`id | order | visible | title | venue | date | url`

### Tab `Skills`
`id | order | visible | name | icon_url`
(`icon_url` boleh kosong → tampil teks; atau pilih dari library ikon bawaan.)

## 7. Halaman & fitur

### 7.1 Halaman publik `/`

FR-P1. Render semua section dari data Sheets; item `visible=FALSE` tidak tampil; urut by `order`.
FR-P2. Section kosong disembunyikan otomatis (beserta link nav-nya).
FR-P3. Lightbox untuk gambar project dan sertifikat (keyboard: Esc tutup, panah kiri/kanan pindah).
FR-P4. Dark mode otomatis + toggle manual (simpan di localStorage).
FR-P5. Responsif: 360px, 768px, 1280px.
FR-P6. SEO: `<title>`, meta description, Open Graph dari tab Profile. Semantic HTML.
FR-P7. Gambar: `next/image` atau `<img loading="lazy">` dengan ukuran tetap supaya tidak layout shift.
FR-P8. State loading/error: jika Apps Script gagal, tampilkan data cache terakhir; jika tidak ada, tampilkan pesan ramah.
FR-P9. Tidak ada link ke `/admin` di UI publik.

### 7.2 Halaman editor `/admin`

FR-A1. **Login**: satu password owner (env `ADMIN_PASSWORD`). Sukses → set cookie httpOnly, secure, sameSite=lax, kedaluwarsa 7 hari (JWT/HMAC pakai `SESSION_SECRET`). Rate limit sederhana: 5 gagal / 10 menit per IP.
FR-A2. **Layout**: sidebar/tab per section — Profil & Hero, Tentang & Fakta, Project, Sertifikat, Pengalaman, Publikasi, Keahlian, Kontak & SEO.
FR-A3. **Edit teks**: form untuk tiap field di tab Profile (input/textarea). Tombol Simpan per section, indikator "Tersimpan" / error.
FR-A4. **CRUD list** (Project, Sertifikat, Pengalaman, Publikasi, Keahlian, Fakta):
- Daftar item dengan thumbnail/judul, toggle `visible`, tombol Edit, Hapus (konfirmasi dialog).
- Tombol "Tambah" membuka form kosong.
- Ubah urutan: tombol naik/turun (drag-and-drop = opsional).
FR-A5. **Form Project**: judul, tags (input chip), deskripsi, daftar poin (tambah/hapus baris, label opsional), galeri gambar (upload banyak, caption, centang "lebar penuh", hapus, urut).
FR-A6. **Form Sertifikat**: judul, upload gambar, penerbit, tanggal, link kredensial (opsional).
FR-A7. **Upload gambar**: pilih file → kompres di browser (maks sisi panjang 1600px, kualitas ~0,82, jpeg/webp) → kirim ke `/api/admin/upload` → Apps Script simpan ke folder Drive → balik URL publik. Batas 5 MB setelah kompres. Tampilkan preview.
FR-A8. **Pratinjau**: tombol "Lihat situs" (tab baru) dan "Pratinjau perubahan" (opsional).
FR-A9. **Safety**: peringatan sebelum keluar halaman jika ada perubahan belum disimpan. Hapus = soft-delete (set `visible=FALSE` + opsi hapus permanen).
FR-A10. Logout.
FR-A11. Semua halaman `/admin` dan `/api/admin/*` diproteksi middleware; `noindex` di meta + `robots.txt` disallow `/admin`.

## 8. Kontrak API

### 8.1 Apps Script (Web App, deploy "Anyone")

Semua request bawa `secret` (= `GAS_SECRET`). Tanpa secret yang cocok → `{ ok:false, error:"unauthorized" }`.

**GET** `?action=getAll&secret=...` →
```json
{
  "ok": true,
  "data": {
    "profile": { "key": "value" },
    "facts": [], "projects": [], "certificates": [],
    "experience": [], "publications": [], "skills": []
  }
}
```

**POST** (body JSON, `Content-Type: text/plain;charset=utf-8` agar tanpa preflight):
| action | payload | hasil |
|---|---|---|
| `updateProfile` | `{ values: { key: value, ... } }` | `{ ok:true }` |
| `createItem` | `{ sheet, item }` | `{ ok:true, id }` |
| `updateItem` | `{ sheet, id, item }` | `{ ok:true }` |
| `deleteItem` | `{ sheet, id }` | `{ ok:true }` |
| `reorder` | `{ sheet, ids: [..] }` | `{ ok:true }` |
| `uploadImage` | `{ filename, mimeType, base64 }` | `{ ok:true, url, fileId }` |

`sheet` ∈ `Facts | Projects | Certificates | Experience | Publications | Skills`.

### 8.2 Next.js API routes

| Route | Method | Fungsi |
|---|---|---|
| `/api/admin/login` | POST | cek password, set cookie |
| `/api/admin/logout` | POST | hapus cookie |
| `/api/admin/content` | GET | data lengkap termasuk item hidden |
| `/api/admin/profile` | PUT | `updateProfile` |
| `/api/admin/items` | POST / PUT / DELETE | create / update / delete item |
| `/api/admin/reorder` | POST | reorder |
| `/api/admin/upload` | POST | `uploadImage` |

Semua route admin: cek cookie → panggil GAS → `revalidateTag('content')` → balas JSON `{ ok, ... }`.

## 9. Non-fungsional

- **Performa**: LCP < 2,5 s di 4G; gambar lazy; font via `next/font`.
- **Aksesibilitas**: kontras AA, fokus terlihat, alt text dari caption/judul, lightbox bisa dioperasikan keyboard, hormati `prefers-reduced-motion`.
- **Keamanan**: secret hanya di server; validasi & sanitasi input (panjang maks, tipe); jangan render HTML mentah dari Sheets (tanpa `dangerouslySetInnerHTML`); URL hanya `http(s)`/`mailto`/`tel`.
- **Batas Apps Script**: kuota harian terbatas → cache di Next.js wajib; admin tidak polling.
- **Reliabilitas**: gagal simpan → tampilkan error, data form tidak hilang.
- **Kompatibilitas**: Chrome, Safari, Firefox, Edge terbaru; iOS Safari.

## 10. Arahan desain (untuk Figcraft)

**Dipertahankan dari desain lama (opsional, boleh diubah)**
- Palet: merah anggur `#b0243b` (aksen), teal `#0d6b72`, latar `#f2f5f7`, tinta `#12202b`; dark: `#0f1a22`.
- Font: Bricolage Grotesque (judul), IBM Plex Sans (isi).
- Hero dengan foto bentuk lengkung atas.

**Yang di-redesign**
1. Hero lebih kuat: nama besar, role, 2 CTA, statistik singkat.
2. Kartu project: thumbnail besar, tags, hasil utama; halaman/panel detail untuk galeri lengkap.
3. Sertifikat: grid kartu dengan hover + lightbox.
4. Timeline pengalaman lebih visual (garis + titik).
5. Keahlian: kelompokkan ikon (Bahasa, Visualisasi, Office).
6. Admin: tampilan dashboard bersih — sidebar kiri, area kerja tengah, form bersih, status simpan jelas.

**Deliverable dari Figcraft**: frame desktop (1440), tablet (768), mobile (390) untuk: Home publik (semua section), Admin Login, Admin Dashboard, Admin form Project, Admin form Sertifikat. Light + dark untuk Home.

## 11. Struktur folder yang diharapkan

```
/app
  /(public)/page.tsx
  /admin/layout.tsx
  /admin/login/page.tsx
  /admin/page.tsx
  /admin/[section]/page.tsx
  /api/admin/login/route.ts
  /api/admin/logout/route.ts
  /api/admin/content/route.ts
  /api/admin/profile/route.ts
  /api/admin/items/route.ts
  /api/admin/reorder/route.ts
  /api/admin/upload/route.ts
/components
  /public/*   (Hero, About, Projects, Certificates, Timeline, Skills, Contact, Lightbox)
  /admin/*    (Sidebar, ItemList, ProjectForm, CertificateForm, ImageUploader, ChipInput, SaveBar)
/lib
  gas.ts          (client server-side ke Apps Script)
  session.ts      (sign/verify cookie)
  content.ts      (getContent + tipe)
  image.ts        (kompres di browser)
/types/content.ts
/middleware.ts
/apps-script/Code.gs
/docs/PRD_PORTFOLIO_V2.md
```

## 12. Environment variables

```
GAS_URL=https://script.google.com/macros/s/XXXX/exec
GAS_SECRET=string-acak-panjang
ADMIN_PASSWORD=password-owner
SESSION_SECRET=string-acak-minimal-32-karakter
NEXT_PUBLIC_SITE_URL=https://domain-kamu.vercel.app
```

## 13. Milestone

| # | Hasil | Perkiraan |
|---|---|---|
| M1 | Desain Figcraft (publik + admin) | 1–2 hari |
| M2 | Sheets + Apps Script + seed data, tes via URL | 0,5 hari |
| M3 | Halaman publik dari data Sheets | 1–2 hari |
| M4 | Login + admin CRUD + upload gambar | 2–3 hari |
| M5 | Polish, a11y, SEO, deploy Vercel, tes | 1 hari |

## 14. Kriteria penerimaan

1. Ubah `about_text` di `/admin` → simpan → `/` menampilkan teks baru ≤ 5 detik setelah refresh.
2. Tambah sertifikat baru (upload gambar + judul) → muncul di grid publik, bisa di-zoom.
3. Tambah project baru dengan 3 gambar + 4 poin → tampil benar, urutan gambar sesuai.
4. Toggle `visible` off → item hilang dari publik, tetap ada di admin.
5. Akses `/admin` tanpa login → redirect ke `/admin/login`. Panggil `/api/admin/*` tanpa cookie → 401.
6. `GAS_SECRET` tidak muncul di bundle client maupun Network tab browser.
7. Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95.
8. Tampilan konsisten di 390 / 768 / 1440 px, light dan dark.

## 15. Risiko

| Risiko | Mitigasi |
|---|---|
| Kuota/latensi Apps Script | ISR + tag cache; admin hanya fetch saat dibuka |
| Gambar besar memperlambat upload | Kompres di browser sebelum upload |
| Password admin tunggal lemah | Password panjang, rate limit, cookie httpOnly; opsi lanjut: Google OAuth |
| Sheets diedit manual → format rusak | Validasi + fallback default saat parse JSON gagal |
| URL Drive berubah kebijakan | Gunakan format `https://lh3.googleusercontent.com/d/<fileId>`; fallback `drive.google.com/uc?id=` |

---

## Lampiran A — Seed data (konten existing)

### Profile
- `full_name_1`: Faradhita
- `full_name_2`: Eka Septiana
- `logo_text`: FES
- `role`: Data Analyst & Data Science · Lulusan Teknik Informatika
- `about_text`: Lulusan S1 Teknik Informatika dengan penjurusan Data Science dengan minat yang kuat pada bidang analisis dan visualisasi data. Memiliki pengalaman dalam mengolah data dan membuat grafik untuk portal Satu Data Jombang di Diskominfo, serta menyusun laporan berbasis data stok sebagai admin di SPPG Mangunan. Terbiasa menggunakan Python dan Microsoft Excel, serta berpengalaman dalam analisis teks (NLP) melalui penelitian yang dipublikasikan di jurnal ilmiah.
- `contact_intro`: Terbuka untuk peran Data Analyst atau Data Science, termasuk magang atau posisi pemula.
- `whatsapp_url`: https://wa.me/6281335438577
- `linkedin_url`: https://linkedin.com/in/faradhita-eka-septiana
- `email`: fradhita27@gmail.com
- `location`: Jombang, Jawa Timur
- `meta_title`: Faradhita Eka Septiana – Portofolio Data

### Facts
| value | label |
|---|---|
| 3,88 | IPK dari 4,00 |
| 3 | project data bersertifikat |
| 1 | publikasi jurnal ilmiah |

### Projects

**1. Retail Transaction Dashboard**
- tags: Google Looker Studio, Figma, Dashboard
- description: Studi kasus sebuah perusahaan ritel yang baru punya aplikasi pencatatan transaksi. Product manager meminta dashboard untuk menganalisis performa penjualan.
- points (label "Kebutuhan dashboard"):
  - Performa transaksi secara keseluruhan dan tren penjualan.
  - Performa tiap metode pembayaran dan produk yang paling laku.
  - Besar pengeluaran untuk diskon.
  - Ringkasan transaksi untuk setiap produk dan pelanggan.
- images: `03-mockup-dashboard-di-figma.jpg` ("Mockup di Figma, dibuat sebelum dashboard direalisasikan."), `04-dashboard-retail-transaction-di-looker-studio.jpg` ("Hasil akhir dashboard.", gambar tinggi/scroll)

**2. Analisis Sentimen Tweet (NLP)**
- tags: Python, NLTK, scikit-learn, Seaborn
- description: Klasifikasi sentimen tweet ke empat kelas: positif, netral, negatif, dan tidak relevan.
- points:
  - Pembersihan data: 334 nilai kosong dan 1.266 duplikat dihapus. Outlier panjang tweet dibuang dengan metode IQR (batas atas 55,5 kata).
  - EDA: distribusi label, wordcloud per sentimen, dan frekuensi sentimen per entitas.
  - Model: Logistic Regression, KNN, Decision Tree, dan Random Forest.
  - Hasil: Random Forest terbaik dengan akurasi uji 66,2%. KNN dan Decision Tree overfitting (akurasi latih di atas 93%).
- images: `05` ("Wordcloud per kategori sentimen", wide), `06` ("Distribusi label setelah dibersihkan"), `07` ("Panjang tweet sebelum dan sesudah menghapus outlier"), `08` ("Frekuensi sentimen per entitas: NBA2K dominan negatif, Assassin's Creed dominan positif", wide)

**3. Segmentasi Pelanggan dengan RFM**
- tags: Python, Pandas, RFM Analysis
- description: Mengelompokkan 3.889 pelanggan toko online ke 10 segmen berdasarkan Recency, Frequency, dan Monetary.
- points:
  - Alur: impor data, pembersihan, agregasi per pelanggan, hitung hari sejak order terakhir, lalu beri skor 1 sampai 5 dengan persentil.
  - Segmen terbesar: Hibernating 27,3%, Champion 14,1%, Loyal Customers 14,0%.
  - Rekomendasi: dorong urgensi transaksi untuk Loyal Customers, tambah jumlah transaksi untuk Potential Loyalists, dan ajak Hibernating kembali bertransaksi.
- images: `09-ringkasan-segmen-rfm.jpg` ("Ringkasan tiap segmen: jumlah pelanggan, rata-rata recency, frekuensi, dan nilai belanja.")

### Experience
| type | period | title | subtitle | points |
|---|---|---|---|---|
| work | April – Agustus 2026 | Administrator, SPPG Mangunan | — | Mencatat barang masuk dan keluar, memeriksa jumlah, jenis, dan kondisinya. / Memperbarui data stok dan melakukan stock opname berkala agar stok fisik cocok dengan catatan. / Menata gudang dengan sistem FIFO untuk menekan risiko barang kedaluwarsa. / Menyusun laporan stok dan aktivitas gudang secara berkala. |
| work | Juli 2025 | Magang, Diskominfo Kabupaten Jombang | — | Mengelompokkan dan mengelola data secara rapi dan sistematis. / Membuat dan mempresentasikan grafik data di portal Satu Data Jombang. |
| education | September 2022 – Agustus 2026 | S1 Teknik Informatika, Universitas Muhammadiyah Malang | IPK 3,88/4,00. Skripsi: Analisis Perbandingan Model T5, mT5, dan Baseline Abstraktif untuk Peringkasan Putusan Pengadilan Tindak Pidana Perdagangan Orang di Indonesia. | — |
| training | April 2025 | Pelatihan MySkill | — | Certificate of Skill Specialization: Python for Data Science, Python for Data Analysis, dan Google Looker Studio. / Certificate of Course Completion: NLP Case Study: Sentiment Analysis, Project: User Segmentation, dan Project: Data Visualization in Looker Data Studio. |

### Publications
- title: Abstractive Summarization for Indonesian Human Trafficking Court Decisions Using Transformer Models
- venue: JITK Vol. 11 No. 4
- date: Mei 2026
- url: https://doi.org/10.33480/jitk.v11i4.8221

### Certificates (urut)
1. Python for Data Science — `10-...jpg`
2. Python for Data Analysis — `11-...jpg`
3. Google Looker Studio — `12-...jpg`
4. NLP Case Study: Sentiment Analysis — `13-...jpg`
5. Project: User Segmentation — `14-...jpg`
6. Project: Data Visualization in Looker Data Studio — `15-...jpg`

### Skills
Python · Google Colab · Visual Studio Code · Google Looker Studio · Microsoft Excel · Microsoft Word · Microsoft PowerPoint

### Gambar profil
- Hero: `01-foto-faradhita-eka-septiana.webp`
- Tentang: `02-faradhita-eka-septiana.webp`
