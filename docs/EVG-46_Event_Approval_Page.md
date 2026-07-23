# Technical Documentation: EVG-46 [FE2] Event Approval Page for Super Admin

---

## Document Metadata

| Attribute | Details |
| :--- | :--- |
| **Project** | EventGate - Event Management System |
| **Task Code** | EVG-46 (Sprint 2) |
| **Feature** | Event Approval Page for Super Admin |
| **Tech Stack** | Svelte 5, SvelteKit 2, TypeScript, TailwindCSS 4 |
| **Author** | Frontend Development Team |
| **Status** | Completed (Mock API) — Pending Backend Integration (EVG-45) |

---

## 1. Executive Summary

Task **EVG-46** mengimplementasikan halaman approval event untuk Super Admin: daftar event berstatus menunggu approval, detail review per event, serta aksi approve dan reject (dengan alasan wajib). Halaman ini menggantikan placeholder EVG-39 di route `/dashboard/super-admin/event-validation` dan hanya bisa diakses oleh role Super Admin.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   └── services/
│   │       └── approvalApi.ts        # Data + aksi approval event (mock, swappable ke API asli)
│   └── routes/
│       └── dashboard/super-admin/
│           └── event-validation/
│               └── +page.svelte      # Halaman list pending + detail review + approve/reject
```

---

## 3. Core Components

### A. Approval Service (`src/lib/services/approvalApi.ts`)
Menyediakan data event mock dan fungsi:
- `listPendingEvents()` — daftar event berstatus `pending_approval`.
- `getEventDetail(eventId)` — detail satu event untuk panel review.
- `approveEvent(eventId)` — mengubah status menjadi `approved`.
- `rejectEvent(eventId, reason)` — mengubah status menjadi `rejected` dan menyimpan alasan.

Diarsitektur sebagai satu service terpisah (pola sama seperti `authApi.ts` pada EVG-42) agar mudah diganti dengan pemanggilan API backend nyata begitu EVG-45 tersedia.

### B. Halaman Validasi Event (`event-validation/+page.svelte`)
- **Role guard**: `onMount` mengecek `authStore`; jika role bukan `super-admin`, redirect ke dashboard sesuai role user (bukan Admin Panitia/Staf Lapangan yang mencoba akses langsung via URL).
- **Layout master-detail**: kolom kiri daftar event pending (klik untuk pilih), kolom kanan detail review (judul, deskripsi, organizer, jadwal, lokasi, status tiket berbayar/gratis, kuota).
- **Approve**: satu klik, langsung mengubah status dan me-refresh daftar.
- **Reject**: membuka form alasan penolakan; tombol "Kirim Penolakan" divalidasi wajib isi sebelum submit.
- **Feedback**: pesan sukses/gagal ditampilkan di atas daftar setelah setiap aksi; daftar otomatis menghilangkan event yang sudah diproses dan menampilkan empty state bila semua sudah selesai.

---

## 4. Behavior Summary

| Aksi | Hasil |
| :--- | :--- |
| Akses halaman sebagai non-Super Admin | Redirect otomatis ke dashboard sesuai role, tidak bisa membuka halaman |
| Approve event | Status berubah `approved`, hilang dari daftar pending, feedback sukses tampil |
| Reject tanpa alasan | Ditolak oleh validasi frontend, pesan error tampil, form tetap terbuka |
| Reject dengan alasan | Status berubah `rejected` beserta alasan tersimpan, hilang dari daftar pending |
| Semua event sudah diproses | Daftar menampilkan empty state "Tidak ada event yang menunggu approval" |

---

## 5. Local Setup & Execution Guide

### Quickstart Execution

1. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```
2. **Login sebagai Super Admin** (`superadmin@eventgate.id` / `password123`, lihat EVG-42), buka `/dashboard/super-admin/event-validation`.
3. **Verifikasi Build**:
   ```bash
   npm run check
   npm run build
   ```

---

## 6. Known Gap — Belum Terhubung ke Backend

Scope item **"Menghubungkan UI dengan API approval"** belum terpenuhi sepenuhnya per tanggal dokumen ini dibuat. Konfirmasi ke tim: EVG-45 (Event Approval Workflow API, PIC Hanif) **belum ada konfirmasi selesai**, sehingga `approvalApi.ts` sengaja dibuat mock (in-memory, 2 event contoh) agar UI, role guard, dan alur approve/reject tetap bisa diverifikasi tanpa menunggu backend.

**Tindak lanjut**: begitu EVG-45 rilis, ganti isi fungsi di `approvalApi.ts` dengan `fetch` ke endpoint backend (`GET /events?status=pending_approval`, `POST /events/{id}/approve`, `POST /events/{id}/reject`, dsb.) — tidak perlu mengubah halaman `event-validation/+page.svelte`.

## 7. Catatan Scope

- Tiket ini secara eksplisit hanya meminta aksi **Approve** dan **Reject**. Aksi **Request Revision** disebut pada dokumen requirement EVG-29 dan Role & Permission Matrix EVG-27, namun tidak ada di Scope Pekerjaan/Acceptance Criteria EVG-46 — sengaja tidak diimplementasikan agar tidak keluar dari scope tiket. Bisa ditambahkan sebagai tiket terpisah bila dibutuhkan.
- Preview form pendaftaran dinamis pada detail review (disebut di EVG-29 sebagai bahan pertimbangan Super Admin) juga di luar scope EVG-46 — itu bagian dari EVG-48 (Dynamic Form Builder).
