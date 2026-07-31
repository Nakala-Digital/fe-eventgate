# Technical Documentation: EVG-50 [FE2] Event Listing, Detail, and Registration Flow

---

## Document Metadata

| Attribute | Details |
| :--- | :--- |
| **Project** | EventGate - Event Management System |
| **Task Code** | EVG-50 (Sprint 2) |
| **Feature** | Event Listing, Detail, and Registration Flow (Peserta) |
| **Tech Stack** | Svelte 5, SvelteKit 2, TypeScript, TailwindCSS 4 |
| **Author** | Frontend Development Team |
| **Design Reference** | Tidak ada wireframe/high-fidelity (EVG-56) tersedia saat task ini dikerjakan — dibangun mengikuti pola UI `EventForm.svelte`/`event-management` (EVG-44) untuk konsistensi visual |
| **Status** | Completed — sisi baca (event & form pertanyaan) terhubung backend asli; submit registrasi masih mock, pending EVG-49 |

---

## 1. Executive Summary

Task **EVG-50** mengimplementasikan alur peserta dari katalog event publik, detail event, hingga pengisian form pendaftaran dinamis dan melihat status pendaftaran. Menggantikan placeholder EVG-39 di `/events` dan `/events/[id]`, serta menambah route baru `/events/[id]/register`.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   └── services/
│   │       └── registrationApi.ts    # Submit pendaftaran (mock, swappable ke API asli)
│   └── routes/
│       └── events/
│           ├── +page.svelte          # Katalog event (hanya status published)
│           ├── [id]/
│           │   ├── +page.svelte      # Detail event + tombol Daftar Sekarang
│           │   └── register/
│           │       └── +page.svelte  # Form dinamis + status setelah submit
```

---

## 3. Core Components

### A. Registration Service (`src/lib/services/registrationApi.ts`)
Pola sama seperti `eventApi.ts`/`formApi.ts` (real fetch + fallback mock + helper `unwrap()`). `submitRegistration(eventId, data, isPaidEvent)` mengembalikan `Registration` dengan `registration_code` unik dan `status` awal: `confirmed` (event gratis) atau `pending_payment` (event berbayar) — mengikuti field `ticket_type` yang sudah ada di `ManagedEvent` (EVG-44), sesuai konvensi `Status Registration Awal` pada skema DB asli (EVG-40).

### B. Katalog Event (`events/+page.svelte`)
Grid kartu event, hanya menampilkan `status === 'published'` dari `eventApi.listEvents()`. Pencarian nama/lokasi + filter kategori, loading/empty/error state (pola sama seperti `event-management`).

### C. Detail Event (`events/[id]/+page.svelte`)
Banner, deskripsi, kategori, penyelenggara, jadwal, lokasi, harga tiket, tombol "Daftar Sekarang". Event yang belum `published` dianggap "tidak ditemukan" (peserta tidak boleh melihat draft/pending/rejected).

### D. Form Registrasi (`events/[id]/register/+page.svelte`)
- Field tetap: Nama Lengkap, Email (terpisah dari pertanyaan dinamis — sesuai skema DB asli di mana `participants` terpisah dari `form_responses`).
- Field dinamis diambil dari **`formApi.listQuestions(eventId)` (EVG-48)** — reuse langsung, bukan duplikasi service.
- Render per tipe: text/number/date, textarea, select, radio, checkbox (multi-pilih via array), file_upload (input file, lihat Known Gap).
- Validasi wajib untuk field bertanda `wajib`, termasuk checkbox (minimal satu tercentang).
- Setelah submit sukses: tampilan status in-place (bukan halaman terpisah) — ikon centang + kode registrasi jika `confirmed`, ikon jam + pesan menunggu pembayaran jika `pending_payment`.

---

## 4. Behavior Summary

| Aksi | Hasil |
| :--- | :--- |
| Buka `/events` | Hanya event published yang tampil, dengan pencarian & filter kategori |
| Buka detail event yang belum published | Tampil "Event tidak ditemukan" |
| Submit form tanpa isi field wajib | Ditolak validasi frontend per-field |
| Submit form event gratis | Status `confirmed`, kode registrasi tampil |
| Submit form event berbayar | Status `pending_payment`, pesan menunggu pembayaran tampil |
| Centang beberapa opsi checkbox | Tersimpan sebagai jawaban gabungan (dipisah koma) |

---

## 5. Local Setup & Execution Guide

1. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```
2. **Akses sebagai publik (tanpa login)**: buka `/events` → pilih event → "Daftar Sekarang" → isi form → submit.
3. **Verifikasi Build**:
   ```bash
   npm run check
   npm run build
   ```

---

## 6. Known Gap — Backend & Skema Data

0. **Update:** backend EVG-47 (Dynamic Form Schema API) sudah rilis dan `formApi.ts` sudah disambungkan penuh (lihat dokumentasi EVG-48) — artinya sisi **baca** form registrasi di halaman ini (`formApi.listQuestions`) sekarang otomatis ikut memakai data pertanyaan asli, bukan mock, tanpa perubahan kode di halaman ini. Yang masih mock murni hanya langkah **submit**-nya (poin 1 di bawah), karena itu memang domain EVG-49, bukan EVG-47.
1. **Backend EVG-49 (Participant Registration API) belum ada** — tidak ada dokumen/commit terkait di repo `be-eventgate` (dicek ulang, hanya EVG-45 dan EVG-47 yang sudah rilis). `registrationApi.ts` sengaja mock, pola sama seperti service lain, tinggal disambungkan begitu backend siap.
2. **Tipe field `file_upload`** pada form pendaftaran mengikuti keterbatasan yang sama seperti dicatat di EVG-48: tidak ada penyimpanan file sungguhan (input hanya UI, jawabannya tidak ikut terkirim ke `registrationApi` saat ini).
3. **Tidak ada halaman lookup status berdasarkan kode registrasi** (mis. "cek status pendaftaran saya" di kunjungan berikutnya) — di luar scope literal EVG-50 ("Menampilkan status pendaftaran" dipenuhi sebagai tampilan langsung setelah submit, bukan sebagai fitur pencarian ulang). Bisa ditambahkan sebagai tiket terpisah bila dibutuhkan.
4. Mock data `eventApi.ts` saat ini tidak punya kombinasi event **published + berbayar**, sehingga jalur `pending_payment` diverifikasi lewat pembacaan kode (logika ternary sederhana berdasarkan `ticket_type`), bukan klik langsung di browser — dicatat agar tim QA (EVG-51) tahu untuk menambah data uji kombinasi tersebut.
