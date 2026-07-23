# Technical Documentation: EVG-39 [FE] Frontend Project Structure & Routing Setup

---

## Document Metadata

| Attribute | Details |
| :--- | :--- |
| **Project** | EventGate - Event Management System |
| **Task Code** | EVG-39 (Sprint 2) |
| **Feature** | Frontend Project Structure & Routing Setup |
| **Tech Stack** | Svelte 5, SvelteKit 2, TypeScript, TailwindCSS 4, Vite 8 |
| **Author** | Frontend Development Team |
| **Status** | Completed / Ready for Integration |

---

## 1. Executive Summary

Task **EVG-39** bertujuan untuk membangun fondasi arsitektur repositori frontend `fe-eventgate` berbasis **SvelteKit**. Sesuai *Scope Pekerjaan* dan *Expected Output*, task ini menyediakan:
1. Struktur folder frontend yang modular dan teratur.
2. Routing dasar berbasis file (*file-based routing*) untuk seluruh modul & role.
3. Layout dasar (Header, Navigation, Sidebar, Footer).
4. Konfigurasi environment frontend (`.env`).
5. Placeholder halaman untuk seluruh modul utama sesuai referensi wireframe (`WireFrame Admin`, `WireFrame Scanner`, `WireFrame Superadmin`, `WireFrame User`).
6. Dokumentasi setup dan panduan eksekusi frontend.

---

## 2. Directory Layout & Architecture

Proyek ini menerapkan struktur direktori terisolasi khas SvelteKit agar kode mudah dipelihara dan mempermudah kolaborasi antar anggota tim:

```text
fe-eventgate/
├── src/
│   ├── app.html                # Template dasar HTML & Google Fonts
│   ├── app.d.ts                # TypeScript global declarations
│   ├── lib/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.svelte      # Public Header Navigation & Role Switcher
│   │   │       ├── Footer.svelte      # Public Footer
│   │   │       ├── Sidebar.svelte     # Dynamic Dashboard Sidebar per Role
│   │   │       └── StatCard.svelte    # Reusable Metric Stat Card Placeholder
│   │   ├── config/
│   │   │   └── env.ts                 # Reading $env/static/public variables
│   │   └── stores/
│   │       └── authStore.ts           # Auth state & role switcher helper
│   └── routes/
│       ├── +layout.svelte             # Root base layout
│       ├── layout.css                 # Tailwind CSS 4 setup
│       ├── +page.svelte               # Public Home Page Placeholder
│       ├── auth/
│       │   ├── login/
│       │   │   └── +page.svelte       # Login Page Placeholder
│       │   └── register/
│       │       └── +page.svelte       # Register Page Placeholder
│       ├── events/
│       │   ├── +page.svelte           # Public Event Catalog Placeholder
│       │   └── [id]/
│       │       └── +page.svelte       # Public Event Detail Page Placeholder
│       └── dashboard/
│           ├── +layout.svelte         # Base Dashboard Layout (Top Bar + Sidebar)
│           ├── super-admin/
│           │   ├── +page.svelte       # Super Admin Overview Placeholder
│           │   ├── event-validation/  # Event Validation Placeholder
│           │   ├── event-management/  # Event Management Placeholder
│           │   ├── operasional/       # Admin Operasional Management Placeholder
│           │   ├── organizer/         # Create Admin Organizer Placeholder
│           │   └── participants/      # Participant Management Placeholder
│           ├── panitia/
│           │   ├── +page.svelte       # Admin Organizer Overview Placeholder
│           │   ├── event-management/  # Event Management (Organizers) Placeholder
│           │   ├── participants/      # Participant Management (Organizers) Placeholder
│           │   └── admin-lapangan/    # Admin Lapangan Management Placeholder
│           ├── peserta/
│           │   ├── +page.svelte       # Home User / Tiket Saya Placeholder
│           │   └── history/           # Riwayat Registrasi Placeholder
│           └── field-staff/
│               └── +page.svelte       # Scan QR Operator Placeholder
├── docs/
│   └── EVG-39_Frontend_Setup.md       # Dokumentasi teknis task ini
├── .env.example                       # Template environment variable
├── .env                               # Environment file lokal
├── svelte.config.js                   # Konfigurasi SvelteKit
├── tsconfig.json                      # Konfigurasi TypeScript
├── vite.config.ts                     # Konfigurasi Vite & Tailwind plugin
├── package.json                       # Dependencies & npm scripts
└── README.md                          # Quickstart guide
```

---

## 3. Environment Configuration (`.env`)

```env
PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
PUBLIC_APP_NAME=EventGate
PUBLIC_APP_ENV=development
```

---

## 4. Routing & Wireframe Mapping Table

| Route Path | Module / Function | Referensi Wireframe | Status |
| :--- | :--- | :--- | :--- |
| `/` | Beranda Utama Publik | `WireFrame User/Home User.png` | Ready |
| `/events` | Katalog Event Publik | `WireFrame User/Home User.png` | Ready |
| `/events/[id]` | Detail Event & Form | `WireFrame User/Detail Event.png` | Ready |
| `/auth/login` | Login Pengguna / Admin | `WireFrame User/Login Operator.png` | Ready |
| `/auth/register` | Registrasi Pengguna | `WireFrame User/Registrasi Event.png` | Ready |
| `/dashboard/super-admin` | Super Admin Overview | `WireFrame Superadmin/Super Admin.png` | Ready |
| `/dashboard/super-admin/event-validation` | Validasi Event | `WireFrame Superadmin/Event Validation-Super admin.png` | Ready |
| `/dashboard/super-admin/event-management` | Event Management Super Admin | `WireFrame Superadmin/Event Management Super Admin.png` | Ready |
| `/dashboard/super-admin/operasional` | Admin Operasional | `WireFrame Superadmin/admin operasional -Super admin.png` | Ready |
| `/dashboard/super-admin/organizer` | Create Admin Organizer | `WireFrame Superadmin/creta admin orginizer.png` | Ready |
| `/dashboard/super-admin/participants` | Participant Management Super Admin | `WireFrame Superadmin/participant management-Super admin.png` | Ready |
| `/dashboard/panitia` | Admin Organizer Overview | `WireFrame Admin/Admin Organizer Dashboard.png` | Ready |
| `/dashboard/panitia/event-management` | Event Management Organizer | `WireFrame Admin/Event Management admin Organizer.png` | Ready |
| `/dashboard/panitia/participants` | Participant Management Organizer | `WireFrame Admin/Participant Management.png` | Ready |
| `/dashboard/panitia/admin-lapangan` | Admin Lapangan Organizer | `WireFrame Admin/Admin Lapangan.png` | Ready |
| `/dashboard/peserta` | Home User / Tiket Saya | `WireFrame User/Home User.png` | Ready |
| `/dashboard/peserta/history` | Riwayat Registrasi Peserta | `WireFrame User/Registrasi Event.png` | Ready |
| `/dashboard/field-staff` | Scan QR Operator | `WireFrame Scanner/Scan QR.png` | Ready |

---

## 5. Local Setup & Execution Guide

### Quickstart Execution

1. **Install Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```
   Akses di browser: `http://localhost:5173`

3. **Verifikasi Build**:
   ```bash
   npm run check
   npm run build
   ```

---

## 6. Version Control & Commit Standard

### Recommended Commit Commands:

```bash
git add .
git commit -m "feat(setup): initialize frontend project structure, base routing, and role placeholders (EVG-39)"
git push origin main
```

