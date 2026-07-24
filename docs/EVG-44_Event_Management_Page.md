# Technical Documentation: EVG-44 [FE1] Event Management Page Implementation

---

## Document Metadata

| Attribute | Details |
| :--- | :--- |
| **Project** | EventGate - Event Management System |
| **Task Code** | EVG-44 (Sprint 2) |
| **Feature** | Event Management Page Implementation |
| **Tech Stack** | Svelte 5, SvelteKit 2, TypeScript, TailwindCSS 4 |
| **Author** | Frontend Development Team |
| **Design Reference** | Wireframe `WireFrame Admin - Event Management admin Organizer.png` & `WireFrame Superadmin - Event Management Super Admin.png` |
| **Status** | Completed (Service layer with API & Mock Fallback) |

---

## 1. Executive Summary

Task **EVG-44** mengimplementasikan halaman pengolahan dan manajemen event oleh **Admin Panitia** dan **Super Admin**. Pengerjaan ini mencakup:
- Halaman daftar event (*Event Listing*) dengan stat ringkasan metric, toolbar filter (pencarian, status, kategori, penyelenggara), badge status yang jelas (`draft`, `pending_approval`, `approved`, `published`, `rejected`, `ended`), serta penanganan state **loading**, **empty state**, dan **error state** dengan tombol "Coba Lagi".
- Form tambah event (*Create Event*) dan form edit event (*Edit Event*) berbasis komponen reusable `EventForm.svelte` dengan validasi lengkap di frontend.
- Validasi syarat bisnis: Event berbayar (`berbayar`) menampilkan input harga wajib (> 0), sedangkan Event gratis (`gratis`) mengaburkan/menyembunyikan input harga dan tidak wajib diisi (harga 0).
- Integrasi service layer `eventApi.ts` yang mendukung request HTTP REST ke backend API (`/api/v1/events`) dan dilengkapi dengan *in-memory mock fallback* agar preview/dev lokal tetap berfungsi tanpa hambatan.

---

## 2. Directory Layout & Changes

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── events/
│   │   │       └── EventForm.svelte                      # Form reusable (Create & Edit) + Validasi
│   │   └── services/
│   │       └── eventApi.ts                               # Service API CRUD Event + Mock Fallback
│   └── routes/
│       └── dashboard/
│           ├── panitia/
│           │   └── event-management/
│           │       ├── +page.svelte                      # Daftar Event Panitia + Stat + Filter + State
│           │       ├── create/
│           │       │   └── +page.svelte                  # Route Form Create Event Panitia
│           │       └── [id]/
│           │           └── edit/
│           │               └── +page.svelte              # Route Form Edit Event Panitia
│           └── super-admin/
│               └── event-management/
│                   ├── +page.svelte                      # Daftar Event Super Admin (Semua Organizer)
│                   ├── create/
│                   │   └── +page.svelte                  # Route Form Create Event Super Admin
│                   └── [id]/
│                       └── edit/
│                           └── +page.svelte              # Route Form Edit Event Super Admin
├── docs/
│   └── EVG-44_Event_Management_Page.md                   # Dokumentasi teknis task ini
```

---

## 3. Core Components & Logic

### A. Event Service Layer (`src/lib/services/eventApi.ts`)
- Interface `ManagedEvent`, `EventFormData`, `EventStatus`, dan `TicketTypeMode`.
- Fungsi CRUD:
  - `listEvents(params)`: Mengambil daftar event (dengan query filter).
  - `getEventById(id)`: Mengambil detail event berdasarkan ID.
  - `createEvent(data)`: Membuat event baru.
  - `updateEvent(id, data)`: Memperbarui data event.
  - `deleteEvent(id)`: Menghapus event.
  - `updateEventStatus(id, status)`: Mengubah status event (misal: ajukan approval, publish).
- Otomatis mengirim `Authorization: Bearer <token>` dari `authStore` jika user sudah login.

### B. Form Event Reusable (`src/lib/components/events/EventForm.svelte`)
- Digunakan secara bersama oleh alur *Create* dan *Edit* baik di dashboard Panitia maupun Super Admin.
- **Validasi Frontend**:
  - Field Wajib: Nama Event, Kategori, Penyelenggara, Deskripsi, Waktu Mulai, Waktu Selesai, Lokasi, Kuota.
  - Validasi Tanggal: Tanggal selesai tidak boleh lebih awal dari tanggal mulai (`end_date >= start_date`).
  - Validasi Harga Tiket: Jika `ticket_type === 'berbayar'`, field harga ditampilkan dan wajib diisi (> 0). Jika `ticket_type === 'gratis'`, field harga disembunyikan dan di-reset ke 0.
- Inline error text di bawah setiap field jika validasi gagal saat submit.

### C. Dashboard Event List Views (`panitia/event-management` & `super-admin/event-management`)
- **Metric Cards**: Menampilkan ringkasan Total Event, Published, Pending Approval, dan Draft/Rejected.
- **Filter Toolbar**: Input pencarian real-time (nama event, lokasi, deskripsi), filter status, filter kategori, serta filter penyelenggara (khusus Super Admin).
- **Status Badges**:
  - `draft`: Abu-abu (Draft)
  - `pending_approval`: Kuning/Amber (Menunggu Approval)
  - `approved`: Hijau/Emerald (Disetujui)
  - `published`: Biru (Dipublikasikan)
  - `rejected`: Merah (Ditolak, dilengkapi rincian alasan penolakan jika ada)
  - `ended`: Kelabu (Selesai)
- **State Handling**:
  - *Loading state*: Menggunakan ikon spinner & pesan indikator memuat data.
  - *Empty state*: Tampilan ilustrasi bersih dengan tombol rujukan "+ Buat Event Pertama".
  - *Error state*: Banner error merah dengan tombol "Coba Lagi" untuk retry fetching data.

---

## 4. Acceptance Criteria Verification

| Criteria | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Daftar event berhasil ditampilkan** | ✅ Terpenuhi | Tampil dalam bentuk tabel responsif dengan informasi lengkap (banner, judul, waktu, lokasi, tiket, status, aksi) |
| **Form event dapat melakukan submit ke backend** | ✅ Terpenuhi | Mengirim request via `eventApi.ts` ke backend `/api/v1/events` dengan fallback mock |
| **Field wajib memiliki validasi di frontend** | ✅ Terpenuhi | Di-enforce melalui `validate()` di `EventForm.svelte` dengan pesan error inline |
| **Event berbayar menampilkan input harga** | ✅ Terpenuhi | Opsi radio "Berbayar" memunculkan input harga (wajib > Rp 0) |
| **Event gratis tidak wajib mengisi harga** | ✅ Terpenuhi | Opsi radio "Gratis" menyembunyikan input harga (otomatis Rp 0) |
| **UI menampilkan status event dengan jelas** | ✅ Terpenuhi | Badge warna-warni kontras untuk seluruh status event |

---

## 5. Local Setup & Execution Guide

1. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```
2. **Akses Dashboard**:
   - Login sebagai **Admin Panitia** (`panitia@eventgate.id` / `password123`) -> Buka `/dashboard/panitia/event-management`
   - Login sebagai **Super Admin** (`superadmin@eventgate.id` / `password123`) -> Buka `/dashboard/super-admin/event-management`
3. **Verifikasi Types & Build**:
   ```bash
   npm run check
   npm run build
   ```
