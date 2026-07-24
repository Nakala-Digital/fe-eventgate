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
| **Status** | Completed — read-side terhubung ke API asli (via `eventApi.ts`); approve/reject masih mock karena EVG-45 belum tersedia di backend |

---

## 1. Executive Summary

Task **EVG-46** mengimplementasikan halaman approval event untuk Super Admin: daftar event (menunggu/disetujui/ditolak) dengan filter & stat ringkasan, halaman detail review terpisah per event, serta aksi approve dan reject (dengan alasan wajib) lewat modal konfirmasi. Data event **dikonsolidasikan ke `eventApi.ts`** milik EVG-44 (bukan service terpisah lagi) agar satu sumber data dipakai bersama dengan halaman Event Management — service ini sudah diverifikasi benar-benar terhubung ke backend `be-eventgate` asli untuk operasi baca.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   ├── components/common/
│   │   │   └── ConfirmActionModal.svelte   # Modal reusable: konfirmasi approve / alasan reject
│   │   └── services/
│   │       └── eventApi.ts                 # Dipakai bersama EVG-44; ditambah `reason` param di updateEventStatus
│   └── routes/
│       └── dashboard/super-admin/
│           └── event-validation/
│               ├── +page.svelte            # List/table + stat card + filter + aksi inline
│               └── [id]/
│                   └── +page.svelte        # Detail review per event
```

`src/lib/services/approvalApi.ts` (mock terpisah dari revisi sebelumnya) **dihapus** — konsolidasi ke `eventApi.ts` supaya approve/reject di sini dan submit/publish di Event Management (EVG-44) sama-sama membaca/menulis array event yang sama, tidak lagi dua sumber data yang bisa tidak sinkron.

---

## 3. Core Components

### A. Perubahan di Service Bersama (`src/lib/services/eventApi.ts`)
- `listEvents()` dan `getEventById(id)` dipakai apa adanya (tidak diubah).
- `updateEventStatus(id, status, reason?)` — parameter `reason` baru ditambahkan (opsional, backward-compatible dengan pemanggilan EVG-44 yang sudah ada) khusus untuk kebutuhan reject EVG-46.
- **Bug envelope response diperbaiki**: sebelumnya kode mengecek `json.data` untuk unwrap response, padahal backend `be-eventgate` mengembalikan JSON polos (bukan `{data: ...}`) untuk `/events` — akibatnya request ke backend asli selalu diam-diam gagal dan jatuh ke mock walau responsnya sukses. Ditambahkan helper `unwrap()` yang menerima kedua bentuk. **Ini memperbaiki integrasi real API untuk EVG-44 juga**, bukan cuma EVG-46 — sudah diverifikasi: `GET /api/events` dari halaman ini benar-benar mengembalikan data asli dari database lokal, bukan mock, setelah perbaikan.

### B. Halaman List (`event-validation/+page.svelte`)
- **Role guard**: redirect ke dashboard sesuai role bila bukan Super Admin.
- **Stat card**: Total Pending / Total di Setujui / Total di Tolak.
- **Filter toolbar**: dropdown Organizer dan Status (client-side filter).
- **Tabel**: Nama Event, Penyelenggara, Tanggal Pengajuan (pakai `created_at`, `ManagedEvent` tidak punya field submitted-at terpisah), Status (badge warna), Aksi.
- Hanya menampilkan event berstatus `pending_approval` / `approved` / `rejected` — status `draft`/`published`/`ended` disembunyikan dari halaman ini (itu domain Event Management, EVG-44), supaya fokus sesuai scope ticket ("melihat daftar event yang menunggu approval").
- **Aksi inline per baris**: ikon "Lihat" selalu tersedia; ikon Approve/Reject hanya untuk baris `pending_approval`.

### C. Halaman Detail Review (`event-validation/[id]/+page.svelte`)
Card **Detail Acara** (deskripsi + kategori), **Tempat & Waktu**, **Tipe Tiket** (data `ManagedEvent` hanya mendukung satu `ticket_type`/`price`/`quota` per event — ditampilkan sebagai 1 baris tabel, bukan multi-tipe seperti revisi sebelumnya), **Media & Banner**. Tombol Approve/Reject tampil bila status pending.

### D. Modal Konfirmasi (`ConfirmActionModal.svelte`)
Tidak berubah dari revisi sebelumnya.

---

## 4. Verifikasi Terhadap Backend Asli

Diuji dengan menjalankan `be-eventgate` secara lokal (migrasi + seed + `go run main.go`):

| Langkah | Hasil |
| :--- | :--- |
| `GET /api/events` dari halaman list | ✅ Mengembalikan event asli dari database (dibuat manual via `POST /api/events` sebagai `admin_panitia` untuk keperluan tes) |
| Filter organizer/status | ✅ Berfungsi di atas data asli |
| Approve/Reject event asli | ⚠️ UI menampilkan feedback sukses (dari mock fallback), **tapi tidak persist ke backend** — dikonfirmasi backend **belum punya endpoint `PATCH /events/{id}/status`** sama sekali di `router.go`. Ini sesuai ekspektasi karena EVG-45 belum dibangun. |

---

## 5. Known Gap — Approve/Reject Belum Bisa Persist ke Backend

Scope item **"Menghubungkan UI dengan API approval"** belum terpenuhi sepenuhnya untuk operasi tulis. Dikonfirmasi langsung dari kode `be-eventgate/internal/router/router.go`: route yang terdaftar hanya `POST/GET/PUT/DELETE /events`, **tidak ada endpoint approve/reject/submit-for-approval sama sekali** — EVG-45 belum mulai dikerjakan.

**Tindak lanjut**: begitu EVG-45 rilis dengan endpoint yang jelas (misalnya `POST /events/{id}/approve`, `POST /events/{id}/reject`), sesuaikan `updateEventStatus()` di `eventApi.ts` — tidak perlu mengubah halaman `event-validation`.

## 6. Catatan Scope & Desain

- Tiket ini secara eksplisit hanya meminta aksi **Approve** dan **Reject**. Aksi **Request Revision** (disebut di EVG-29 & Role Permission Matrix EVG-27/EVG-41) tidak ada di Scope Pekerjaan/Acceptance Criteria EVG-46 — sengaja tidak diimplementasikan.
- Desain acuan adalah wireframe (`Super Admin.jpg`), bukan high-fidelity final dari EVG-54 — perlu disesuaikan lagi begitu EVG-54 rilis.
- Field `ManagedEvent` (dari `eventApi.ts`) belum 100% cocok dengan model backend asli (`organizer_name` di frontend vs `organizer_id` + nested `organizer` object yang saat ini kosong di response backend, tidak ada `category` di backend). Kolom "Penyelenggara" akan tampil kosong sampai backend menyediakan data organizer yang benar atau frontend menyesuaikan mapping-nya — di luar scope EVG-46, dicatat untuk EVG-44/tim backend.
