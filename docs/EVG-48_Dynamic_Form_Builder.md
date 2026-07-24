# Technical Documentation: EVG-48 [FE2] Dynamic Form Builder Implementation

---

## Document Metadata

| Attribute | Details |
| :--- | :--- |
| **Project** | EventGate - Event Management System |
| **Task Code** | EVG-48 (Sprint 2) |
| **Feature** | Dynamic Form Builder Implementation |
| **Tech Stack** | Svelte 5, SvelteKit 2, TypeScript, TailwindCSS 4 |
| **Author** | Frontend Development Team |
| **Design Reference** | Tidak ada wireframe/high-fidelity (EVG-55) yang tersedia saat task ini dikerjakan — dibangun mengikuti pola UI yang sudah ada di `EventForm.svelte` (EVG-44) untuk konsistensi visual |
| **Status** | Completed (Mock API) — Pending Backend Integration (EVG-47) |

---

## 1. Executive Summary

Task **EVG-48** mengimplementasikan halaman Form Builder bagi Admin Panitia untuk membuat, mengedit, menghapus, dan mengatur urutan pertanyaan pendaftaran dinamis per event, lengkap dengan preview form sederhana secara real-time.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   └── services/
│   │       └── formApi.ts            # Data + CRUD pertanyaan dinamis (mock, swappable ke API asli)
│   └── routes/
│       └── dashboard/panitia/event-management/
│           ├── +page.svelte          # Ditambah tombol "Form Builder" per baris event
│           └── [id]/form-builder/
│               └── +page.svelte      # Halaman form builder (list + form + preview)
```

---

## 3. Core Components

### A. Form Service (`src/lib/services/formApi.ts`)
Pola sama persis dengan `eventApi.ts` (real fetch + fallback mock in-memory + helper `unwrap()`):
- `DynamicQuestion { id, event_id, label, type, requirement, options, order }`
- Tipe field: `text, textarea, number, date, select, radio, checkbox, file_upload`
- `requirement`: `wajib` | `opsional`
- Fungsi: `listQuestions(eventId)`, `createQuestion`, `updateQuestion`, `deleteQuestion`, `reorderQuestion(eventId, questionId, 'up'|'down')`

### B. Halaman Form Builder (`event-management/[id]/form-builder/+page.svelte`)
- **Role guard**: hanya `panitia` dan `super-admin` (pola sama seperti halaman Event Management EVG-44), role lain redirect ke dashboard masing-masing.
- **Daftar pertanyaan**: kartu per pertanyaan dengan badge tipe field & wajib/opsional, tombol naik/turun urutan, edit, hapus (via `ConfirmActionModal`).
- **Form tambah/edit**: label, dropdown tipe field, toggle wajib/opsional, dan **option builder** dinamis (muncul otomatis untuk tipe `select`/`radio`/`checkbox`, validasi minimal 2 pilihan).
- **Preview real-time**: merender ulang seluruh pertanyaan sebagai pratinjau form pendaftaran (field disabled), otomatis mengikuti urutan dan tipe field terbaru.
- Tombol "Form Builder" (ikon hijau) ditambahkan di tabel Event Management (`event-management/+page.svelte`) di antara Edit dan Hapus.

---

## 4. Behavior Summary

| Aksi | Hasil |
| :--- | :--- |
| Tambah pertanyaan tipe `select`/`radio`/`checkbox` tanpa ≥2 pilihan | Ditolak validasi frontend, pesan error tampil |
| Tambah/edit pertanyaan valid | Tersimpan, muncul di daftar & preview |
| Naik/turunkan urutan | Urutan daftar & preview berubah langsung |
| Hapus pertanyaan | Modal konfirmasi → terhapus dari daftar & preview |
| Akses halaman sebagai role selain panitia/super-admin | Redirect ke dashboard sesuai role |

---

## 5. Local Setup & Execution Guide

1. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```
2. **Login sebagai Admin Panitia** (`panitia@eventgate.com` / `Rahasia123!`), buka Event Management → klik ikon hijau (Form Builder) pada salah satu event.
3. **Verifikasi Build**:
   ```bash
   npm run check
   npm run build
   ```

---

## 6. Known Gap — Backend & Skema Data

1. **Backend EVG-47 (Dynamic Form Schema API) belum ada** — tidak ada dokumen maupun commit terkait di repo `be-eventgate` per tanggal dokumen ini dibuat. `formApi.ts` sengaja mock, mengikuti pola `eventApi.ts` (real fetch dulu, fallback mock) agar tinggal disambungkan begitu backend siap, tanpa mengubah halaman.
2. **Tipe field `file_upload` tidak punya dukungan di skema database asli** — skema `dynamic_questions` pada `EVG-40_Database_Migration_Setup.md` hanya mendefinisikan enum tipe: `text, textarea, number, date, select, radio, checkbox` (tidak ada `file_upload`). Field ini tetap diimplementasikan di UI sesuai instruksi eksplisit (mengikuti scope literal tiket EVG-47/48), tapi backend perlu menambah kolom/strategi penyimpanan file sebelum ini bisa benar-benar berfungsi tersimpan.
3. Field `kondisional` (conditional requirement) dan `depends_on_question_id` ada di skema DB tapi **sengaja tidak diimplementasikan** karena tidak disebut di Scope Pekerjaan/Acceptance Criteria EVG-48.
4. Reorder pertanyaan diimplementasikan dengan tombol naik/turun (bukan drag-and-drop) untuk menghindari dependency baru — cukup untuk memenuhi acceptance criteria "urutan pertanyaan dapat disimpan".
