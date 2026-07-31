# EventGate Frontend (`fe-eventgate`)

> Modern Event Management System & E-Ticketing Platform built with **Svelte 5**, **SvelteKit 2**, **TypeScript**, **TailwindCSS 4**, and **Vite 8**.

---

## 📋 Overview

**EventGate Frontend** adalah aplikasi web modern yang berfungsi sebagai antarmuka utama platform pengelolaan event dan e-ticketing EventGate. Aplikasi ini menyediakan portal publik untuk katalog event dan registrasi peserta, portal autentikasi pengguna, serta antarmuka khusus untuk berbagai peran pengguna: **Super Admin**, **Admin Panitia**, **Peserta**, dan **Staf Lapangan (Field Staff)**.

---

## 🛠️ Tech Stack

- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) (Svelte 5 with Runes `$state`, `$derived`, `$effect`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)

---

## ✨ Features & Role Portals

### 1. Public & Guest Portal
- **Landing Page**: Informasi event utama dan fitur platform (`/`)
- **Katalog Event**: Pencarian dan eksplorasi daftar event publik (`/events`)
- **Detail Event**: Informasi rincian event, lokasi, tipe tiket, dan formulir pendaftaran (`/events/[id]`)

### 2. Autentikasi & Navigasi Berbasis Role
- **Login & Register**: Alur autentikasi terpusat (`/auth/login`, `/auth/register`)
- **Route Guard & Auto Redirect**: Restriksi akses halaman dashboard berdasarkan role pengguna

### 3. Event Management (Admin Panitia & Super Admin)
- **Dashboard Panitia**: Ringkasan statistik event milik panitia (`/dashboard/panitia`)
- **Pengelolaan Event**: Daftar event, pemfilteran, status badge (`draft`, `pending_approval`, `approved`, `published`, `rejected`), serta aksi submit approval & publish (`/dashboard/panitia/event-management`)
- **Form Create & Edit Event**: Formulir dinamis pembuatan dan pembaruan data event dengan validasi harga event berbayar vs gratis (`/dashboard/.../create`, `/dashboard/.../[id]/edit`)
- **Dashboard Super Admin**: Pengelolaan seluruh event dari seluruh penyelenggara terdaftar (`/dashboard/super-admin/event-management`)

### 4. Event Approval / Validation (Super Admin)
- **Validasi Event**: Modul peninjauan, persetujuan (*approve*), dan penolakan (*reject* dengan alasan wajib) terhadap event yang diajukan panitia (`/dashboard/super-admin/event-validation`)

### 5. Peserta & Operational Portals
- **Portal Peserta**: Riwayat tiket dan tiket QR digital (`/dashboard/peserta`)
- **Field Staff Portal**: Antarmuka pemindaian (*scan*) QR code tiket di lokasi acara (`/dashboard/field-staff`)

---

## 🚀 Quickstart & Execution

### Prerequisites
- Node.js (v18+ direkomendasikan)
- npm

### Installation & Execution

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Setup environment file (.env)
cp .env.example .env

# 3. Run development server
npm run dev

# 4. Check TypeScript & Svelte diagnostics
npm run check

# 5. Build for production
npm run build
```

Dev server akan berjalan di `http://localhost:5173`.

---

## 📚 Technical Documentation Index

Dokumentasi detail mengenai tiap modul dan tugas pengembangan tersedia di direktori [`docs/`](docs/):

- 📄 [EVG-39 Frontend Structure & Routing Setup](docs/EVG-39_Frontend_Setup.md)
- 📄 [EVG-42 Login & Role-Based Navigation](docs/EVG-42_Login_RoleBased_Navigation.md)
- 📄 [EVG-44 Event Management Page Implementation](docs/EVG-44_Event_Management_Page.md)
- 📄 [EVG-46 Event Approval Page for Super Admin](docs/EVG-46_Event_Approval_Page.md)
