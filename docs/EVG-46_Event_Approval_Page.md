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
| **Status** | Completed (Mock API) — Pending Backend Integration (EVG-45) |

---

## 1. Executive Summary

Task **EVG-46** mengimplementasikan halaman approval event untuk Super Admin: daftar seluruh event dengan filter & stat ringkasan, halaman detail review terpisah per event, serta aksi approve dan reject (dengan alasan wajib) lewat modal konfirmasi. UI disusun ulang mengikuti wireframe "Event Validation" dari desainer (2 frame: list/table dan detail review) setelah revisi awal yang sempat dibangun murni dari requirement teks.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   ├── components/common/
│   │   │   └── ConfirmActionModal.svelte   # Modal reusable: konfirmasi approve / alasan reject
│   │   └── services/
│   │       └── approvalApi.ts              # Data event (semua status) + aksi approve/reject (mock)
│   └── routes/
│       └── dashboard/super-admin/
│           └── event-validation/
│               ├── +page.svelte            # List/table + stat card + filter + aksi inline
│               └── [id]/
│                   └── +page.svelte        # Detail review per event
```

---

## 3. Core Components

### A. Approval Service (`src/lib/services/approvalApi.ts`)
Model data `ApprovalEvent` mencakup seluruh status (`pending_approval` | `approved` | `rejected`), lengkap dengan `category`, `banner_url`, dan `ticket_types[]` (mendukung >1 tipe tiket per event). Fungsi: `listEvents()`, `getEventDetail(id)`, `approveEvent(id)`, `rejectEvent(id, reason)`. Pola sama seperti `authApi.ts` (EVG-42) — mock in-memory, tinggal diganti `fetch` ke backend begitu EVG-45 tersedia.

### B. Halaman List (`event-validation/+page.svelte`)
- **Role guard**: redirect ke dashboard sesuai role bila bukan Super Admin (pola sama seperti sebelumnya).
- **Stat card**: Total Pending / Total di Setujui / Total di Tolak, dihitung dari data.
- **Filter toolbar**: dropdown Organizer dan Status (client-side filter).
- **Tabel** (bukan card-list): Nama Event, Penyelenggara, Tanggal Pengajuan, Status (badge warna), Aksi. Menampilkan **semua status**, bukan hanya pending — status yang sudah diproses tetap terlihat di tabel, sesuai wireframe.
- **Aksi inline per baris**: ikon "Lihat" selalu tersedia (buka halaman detail); ikon Approve/Reject hanya muncul untuk baris berstatus `pending_approval`.

### C. Halaman Detail Review (`event-validation/[id]/+page.svelte`)
Layout kartu sesuai wireframe: header (judul + badge status + organizer), card **Detail Acara** (deskripsi + badge kategori), card **Tempat & Waktu**, card **Tipe Tiket** (tabel Nama Tiket/Harga/Kuota), card **Media & Banner** (preview gambar). Tombol Approve/Reject tampil di header bila status masih pending; alasan penolakan ditampilkan bila event sudah ditolak.

### D. Modal Konfirmasi (`src/lib/components/common/ConfirmActionModal.svelte`)
Komponen reusable dipakai dari kedua halaman: mode approve (konfirmasi tanpa input) dan mode reject (textarea alasan wajib, tervalidasi sebelum submit).

---

## 4. Behavior Summary

| Aksi | Hasil |
| :--- | :--- |
| Akses halaman list/detail sebagai non-Super Admin | Redirect otomatis ke dashboard sesuai role |
| Approve dari tabel atau halaman detail | Modal konfirmasi → status berubah `approved`, tetap tampil di tabel |
| Reject tanpa alasan | Modal menampilkan error, submit ditahan |
| Reject dengan alasan | Status berubah `rejected`, alasan tersimpan & tampil di detail |
| Filter organizer/status | Tabel ter-filter langsung (client-side) |
| Event non-pending | Ikon approve/reject disembunyikan, hanya "Lihat" yang aktif |

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

Scope item **"Menghubungkan UI dengan API approval"** belum terpenuhi sepenuhnya. EVG-45 (Event Approval Workflow API, PIC Hanif) **belum ada konfirmasi selesai**, sehingga `approvalApi.ts` sengaja dibuat mock (in-memory) agar UI, role guard, filter, dan alur approve/reject tetap bisa diverifikasi tanpa menunggu backend.

**Tindak lanjut**: begitu EVG-45 rilis, ganti isi fungsi di `approvalApi.ts` dengan `fetch` ke endpoint backend — tidak perlu mengubah halaman `event-validation/+page.svelte` maupun `[id]/+page.svelte`.

## 7. Catatan Scope & Desain

- Tiket ini secara eksplisit hanya meminta aksi **Approve** dan **Reject**. Aksi **Request Revision** (disebut di EVG-29 & Role Permission Matrix EVG-27) tidak ada di Scope Pekerjaan/Acceptance Criteria EVG-46 — sengaja tidak diimplementasikan.
- Desain yang dipakai sebagai acuan adalah wireframe (`Super Admin.jpg`), bukan high-fidelity final dari EVG-54 — desainer mengonfirmasi file tersebut masih on-progress. Styling detail (warna, spacing presisi, komponen final) sebaiknya disesuaikan lagi begitu high-fidelity EVG-54 rilis.
- Frame "Approve Modal"/"Reject Modal" belum ada di export desain yang diterima; pola modal konfirmasi pada implementasi ini adalah adaptasi wajar dari pola tabel+ikon aksi yang terlihat di wireframe, bukan tiruan pixel-perfect dari desain modal resmi.
