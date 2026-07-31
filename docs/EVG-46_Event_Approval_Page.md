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
| **Design Reference** | Wireframe "Event Validation" pada `Super Admin.jpg` (export lokal Figma EventGate_Nakala, on-progress) |
| **Status** | **Completed — fully connected to real backend** (EVG-41 auth, EVG-45 approval workflow), verified end-to-end against `be-eventgate` running locally |

---

## 1. Executive Summary

Task **EVG-46** mengimplementasikan halaman approval event untuk Super Admin: daftar event dengan filter & stat ringkasan, halaman detail review terpisah per event, serta aksi approve dan reject (dengan alasan wajib) lewat modal konfirmasi. Backend EVG-45 (Event Approval Workflow API) telah tersedia (branch `feature/event-approval-workflow`/`feature/dynamic-form-schema` di `be-eventgate`) dan halaman ini sudah disambungkan penuh — approve/reject sekarang benar-benar mengubah status event di database, bukan lagi mock.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   ├── components/common/
│   │   │   └── ConfirmActionModal.svelte   # Modal reusable: konfirmasi approve / alasan reject
│   │   └── services/
│   │       └── eventApi.ts                 # + mapBackendEvent(), getApprovalLogs(), updateEventStatus per-action
│   └── routes/
│       └── dashboard/super-admin/
│           └── event-validation/
│               ├── +page.svelte            # List/table + stat card + filter + aksi inline
│               └── [id]/
│                   └── +page.svelte        # Detail review + fetch alasan reject dari approval log
```

---

## 3. Core Components

### A. Perubahan di Service Bersama (`src/lib/services/eventApi.ts`)

**`updateEventStatus(id, status, reason?)` dirombak total.** Backend EVG-45 **tidak** memakai satu endpoint generik `PATCH /events/{id}/status` (asumsi versi sebelumnya) — melainkan satu endpoint per aksi:

| Status tujuan | Endpoint asli |
| :--- | :--- |
| `pending_approval` | `POST /events/{id}/submit` |
| `approved` | `POST /events/{id}/approve` |
| `rejected` | `POST /events/{id}/reject` |
| `revision_requested` | `POST /events/{id}/request-revision` |
| `published` | `POST /events/{id}/publish` |
| `draft` (dari published) | `POST /events/{id}/unpublish` |

`reason` dikirim sebagai `{ notes: reason }` sesuai kontrak `ReviewRequest` backend. Peta status→endpoint ini dipakai bersama oleh EVG-44 (submit/publish) tanpa perlu mengubah halaman Event Management mereka.

**`mapBackendEvent()` (baru)** — menerjemahkan shape `Event` asli backend (`title/banner/start_time/end_time/is_paid`, nested `organizer`) ke `ManagedEvent` internal (`banner_url/start_date/end_date/ticket_type`), dipakai di `listEvents`, `getEventById`, `createEvent`, `updateEvent`, `updateEventStatus`. `category` di-default `'Umum'` (backend belum punya kolom ini).

**`getApprovalLogs(eventId)` (baru)** — `GET /events/{id}/approval-logs`. Backend menyimpan alasan reject/revisi di *log*, bukan di objek event itu sendiri; dipakai halaman detail untuk menampilkan alasan penolakan saat event dimuat ulang dari awal (bukan langsung setelah aksi reject dalam sesi yang sama).

`EventStatus` ditambah `'revision_requested'` (status resmi di backend, walau tidak dipakai aksi manapun di tiket ini).

### B. Halaman List (`event-validation/+page.svelte`)
Tidak berubah secara struktural — role guard, stat card, filter, tabel, dan aksi inline tetap sama; sekarang membaca/menulis data asli.

### C. Halaman Detail Review (`event-validation/[id]/+page.svelte`)
Ditambah: setelah `getEventById`, jika status `rejected` dan `reject_reason` kosong (kasus reload halaman), memanggil `getApprovalLogs()` dan mengambil catatan dari log `rejected` terakhir untuk ditampilkan.

### D. Modal Konfirmasi (`ConfirmActionModal.svelte`)
Tidak berubah.

---

## 4. Verifikasi End-to-End Terhadap Backend Asli

Dijalankan melawan `be-eventgate` (branch `feature/dynamic-form-schema`, migrasi 000001–000005) di lokal:

| Skenario | Hasil |
| :--- | :--- |
| Login super admin & panitia (akun seed asli) | ✅ |
| List event asli tampil di tabel dengan status benar | ✅ |
| Reject event via UI dengan alasan | ✅ Tersimpan permanen — dikonfirmasi langsung via query `event_approval_logs` di database, bukan hanya tampilan sukses di UI |
| Approve event via UI | ✅ Status berubah `approved` di database |
| Buka ulang halaman detail event yang sudah ditolak | ✅ Alasan penolakan berhasil diambil dari `GET /events/{id}/approval-logs` |
| Role guard tetap berlaku | ✅ (tidak berubah dari revisi sebelumnya) |

---

## 5. Bug/Gap Backend yang Ditemukan (untuk diteruskan ke tim BE)

1. **`organizer` selalu kosong** pada response `GET /events` dan `GET /events/{id}` — object `organizer`/`created_by_user` ada tapi seluruh field-nya nol/kosong (kemungkinan `Preload()` GORM belum dipasang di query event). Frontend sudah diberi fallback teks "Tidak diketahui" (`mapBackendEvent`), tapi sebaiknya diperbaiki di backend agar kolom Penyelenggara benar-benar informatif.
2. **Endpoint create event tidak memvalidasi/membuat `TicketType`** — EVG-45 mensyaratkan event punya minimal satu `TicketType` sebelum bisa di-*submit*, tapi tidak ada endpoint API untuk membuat `TicketType` sama sekali (hanya bisa lewat SQL langsung). Ini menyulitkan alur "Buat Event → Ajukan Approval" end-to-end dari UI EVG-44 tanpa akses database manual — perlu endpoint atau penyesuaian pada `POST /events`.
3. Field yang dikirim oleh `EventForm.svelte` (EVG-44) — `category`, `organizer_name`, `start_date`/`end_date`, `banner_url`, `ticket_type` — **tidak cocok** dengan field yang diterima backend (`title` tidak masalah, tapi tidak ada `category`/`organizer_name`; field waktu bernama `start_time`/`end_time`; `banner` bukan `banner_url`; `is_paid` boolean bukan `ticket_type` enum). Akibatnya create/update event dari UI EVG-44 kemungkinan besar selalu gagal ke backend asli dan diam-diam jatuh ke mock. **Di luar scope EVG-46** (ini form/request EVG-44), dicatat agar tim tahu.

## 6. Catatan Scope & Desain
- Tiket ini secara eksplisit hanya meminta aksi **Approve** dan **Reject**. Aksi **Request Revision** (yang ternyata sudah didukung penuh oleh backend EVG-45) tetap **sengaja tidak diimplementasikan** karena tidak ada di Scope Pekerjaan/Acceptance Criteria EVG-46.
- Desain acuan adalah wireframe (`Super Admin.jpg`), bukan high-fidelity final dari EVG-54 — perlu disesuaikan lagi begitu high-fidelity rilis.
