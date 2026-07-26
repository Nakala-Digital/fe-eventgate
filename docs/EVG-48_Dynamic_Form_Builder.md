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
| **Design Reference** | Tidak ada wireframe/high-fidelity (EVG-55) yang tersedia — dibangun mengikuti pola UI `EventForm.svelte` (EVG-44) untuk konsistensi visual |
| **Status** | **Completed — fully connected to real backend** (EVG-47 Dynamic Form Schema API), verified end-to-end against `be-eventgate` running locally |

---

## 1. Executive Summary

Task **EVG-48** mengimplementasikan halaman Form Builder bagi Admin Panitia untuk membuat, mengedit, menghapus, dan mengatur urutan pertanyaan pendaftaran dinamis per event, lengkap dengan preview form sederhana secara real-time. Backend EVG-47 (Dynamic Registration Form API, branch `feature/dynamic-form-schema` di `be-eventgate`) sudah tersedia dan halaman ini sudah disambungkan penuh.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   └── services/
│   │       └── formApi.ts            # + mapBackendQuestion(), toBackendQuestionPayload()
│   └── routes/
│       └── dashboard/panitia/event-management/
│           ├── +page.svelte          # Tombol "Form Builder" per baris event
│           └── [id]/form-builder/
│               └── +page.svelte      # Halaman form builder (list + form + preview)
```

---

## 3. Core Components

### A. Form Service (`src/lib/services/formApi.ts`)

Backend EVG-47 memakai nama field dan endpoint yang berbeda dari asumsi mock awal — diselesaikan dengan **adapter di boundary**, bukan mengubah shape internal `DynamicQuestion` (jadi UI form-builder & registration form/EVG-50 tidak perlu berubah):

| Internal (`DynamicQuestion`) | Backend asli (`QuestionRequest`/`QuestionResponse`) |
| :--- | :--- |
| `label` | `question_text` |
| `type` (termasuk `'select'`) | `question_type` (termasuk `'dropdown'`) |
| `requirement` | `requirement_type` |
| `order` | `display_order` |
| `options[].label` | `options[].option_label` + `option_value` |

- `mapBackendQuestion(raw)` — response → internal shape.
- `toBackendQuestionPayload(data, displayOrder?)` — internal form data → request body asli.
- Endpoint asli dipakai: `GET/POST /api/events/{id}/questions`, `PUT/DELETE /api/events/{id}/questions/{questionID}`.
- **Reorder** (`reorderQuestion`) kini menerima `currentList` dan melakukan 2× `PUT` (Replace-All strategy backend mensyaratkan body pertanyaan lengkap, bukan cuma `display_order`).
- `requirement_type: 'kondisional'` (didukung penuh oleh backend, termasuk `depends_on_question_id`/`depends_on_value`) **sengaja tetap tidak diimplementasikan** di sisi UI — bukan bagian dari Scope Pekerjaan/Acceptance Criteria EVG-48; pertanyaan kondisional dari klien lain akan tampil sebagai `opsional` di halaman ini.

### B. Halaman Form Builder (`event-management/[id]/form-builder/+page.svelte`)
Tidak berubah secara struktural dari revisi sebelumnya (role guard, daftar pertanyaan, form tambah/edit, option builder, preview real-time) — hanya pemanggilan `reorderQuestion` disesuaikan untuk mengirim daftar pertanyaan saat ini.

---

## 4. Verifikasi End-to-End Terhadap Backend Asli

Dijalankan melawan `be-eventgate` (branch `feature/dynamic-form-schema`) di lokal, login sebagai `panitia@eventgate.com` (pemilik event):

| Skenario | Hasil |
| :--- | :--- |
| Tambah pertanyaan tipe Dropdown + 2 opsi | ✅ Tersimpan — dikonfirmasi via query `dynamic_questions`/`question_options`: `question_type='dropdown'`, `option_label`/`option_value` benar |
| Tambah pertanyaan kedua (Teks Singkat, opsional) | ✅ |
| Naikkan urutan pertanyaan kedua | ✅ `display_order` kedua pertanyaan tertukar di database (ter-PUT ulang keduanya) |
| Hapus pertanyaan | ✅ **Logical deletion** terverifikasi — row tetap ada di database dengan `is_active = false`, bukan terhapus fisik (sesuai desain backend) |
| Preview form real-time | ✅ Mengikuti urutan & tipe field terbaru |

---

## 5. Known Gap — Sisa Setelah Integrasi Penuh

1. **Tipe field `file_upload`** — backend EVG-47 mendukung `question_type = file_upload` di skema (mengikuti Task Brief/ERD, bukan enum lama EVG-40), tapi **tidak ada mekanisme upload/storage file** di backend manapun. Field ini tetap ada di UI (sesuai instruksi eksplisit sebelumnya) tapi jawabannya tidak akan pernah benar-benar tersimpan sebagai file.
2. **Conditional Question** (`kondisional`, `depends_on_question_id`, `depends_on_value`) didukung penuh oleh backend tapi sengaja tidak dibangun di UI — di luar scope literal EVG-48. Bisa jadi tiket terpisah bila dibutuhkan.

## 6. Catatan Scope & Desain
- Reorder pertanyaan tetap pakai tombol naik/turun (bukan drag-and-drop) untuk menghindari dependency baru.
- Desain masih mengikuti pola `EventForm.svelte` (EVG-44) karena EVG-55 (high-fidelity Form Builder) belum tersedia.
