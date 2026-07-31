# Technical Documentation: EVG-42 [FE2] Login Page & Role-Based Navigation

---

## Document Metadata

| Attribute | Details |
| :--- | :--- |
| **Project** | EventGate - Event Management System |
| **Task Code** | EVG-42 (Sprint 2) |
| **Feature** | Login Page & Role-Based Navigation |
| **Tech Stack** | Svelte 5, SvelteKit 2, TypeScript, TailwindCSS 4 |
| **Author** | Frontend Development Team |
| **Status** | Completed (Mock Auth) — Pending Backend Integration (EVG-41) |

---

## 1. Executive Summary

Task **EVG-42** mengimplementasikan halaman login dan navigasi berbasis role pada frontend EventGate, menggantikan mock role-switcher dari EVG-39 dengan alur autentikasi yang sesungguhnya: form login, penyimpanan sesi, route guard pada dashboard, dan redirect otomatis sesuai role setelah login berhasil.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── src/
│   ├── lib/
│   │   ├── services/
│   │   │   └── authApi.ts            # Login service (mock, swappable ke API asli)
│   │   ├── stores/
│   │   │   └── authStore.ts          # AuthState + persistensi token (local/sessionStorage)
│   │   └── components/common/
│   │       └── Navbar.svelte         # Diperbarui: tombol Masuk/Dashboard sesuai status login
│   └── routes/
│       ├── auth/login/+page.svelte   # UI login baru (email, password, remember me)
│       └── dashboard/+layout.svelte  # Route guard + info user & logout
├── .claude/launch.json               # Konfigurasi dev server untuk preview
```

---

## 3. Core Components

### A. Auth Service (`src/lib/services/authApi.ts`)
Fungsi `login(email, password)` — saat ini mock (menunggu backend Auth API EVG-41), dengan 4 akun demo satu per role. Diarsitektur sebagai satu fungsi terpisah agar mudah diganti dengan `fetch` ke endpoint backend asli tanpa mengubah halaman login.

Demo accounts (password: `password123`):
| Email | Role |
| :--- | :--- |
| superadmin@eventgate.id | super-admin |
| panitia@eventgate.id | panitia |
| peserta@eventgate.id | peserta |
| staff@eventgate.id | field-staff |

### B. Auth Store (`src/lib/stores/authStore.ts`)
- `setAuth(token, user, remember)` — menyimpan sesi ke `localStorage` (jika "Ingatkan Akun Saya" dicentang) atau `sessionStorage`.
- `clearAuth()` — logout, membersihkan kedua storage.
- State di-*hydrate* dari storage saat store diinisialisasi sehingga sesi bertahan setelah refresh.

### C. Login Page (`src/routes/auth/login/+page.svelte`)
Form email + password dengan toggle show/hide password, checkbox "Ingatkan Akun Saya", dan pesan error inline saat kredensial salah. Setelah sukses, redirect ke `/dashboard/{role}` sesuai role dari hasil login.

### D. Route Guard (`src/routes/dashboard/+layout.svelte`)
`onMount` mengecek `authStore`; jika belum login, redirect ke `/auth/login`. Header dashboard menampilkan nama user yang sedang login dan tombol logout (menggantikan dropdown "Pilih Role" dari EVG-39 yang memungkinkan akses tanpa login).

---

## 4. Routing & Redirect Behavior

| Route | Perilaku |
| :--- | :--- |
| `/auth/login` | Form login publik |
| `/dashboard/*` | Dilindungi — redirect ke `/auth/login` bila belum ada sesi aktif |
| Setelah login sukses | Redirect ke `/dashboard/{role}` sesuai role akun |
| Logout | Membersihkan sesi, redirect ke `/auth/login` |

---

## 5. Local Setup & Execution Guide

### Quickstart Execution

1. **Jalankan Dev Server**:
   ```bash
   npm run dev
   ```
   Akses di browser: `http://localhost:5173/auth/login`

2. **Login dengan akun demo** (lihat tabel akun demo di atas), lalu verifikasi redirect ke dashboard sesuai role dan tombol logout berfungsi.

3. **Verifikasi Build**:
   ```bash
   npm run check
   npm run build
   ```

---

## 6. Known Gap — Belum Terhubung ke Backend

Scope item **"Menghubungkan login frontend ke API auth"** dan Expected Output **"Login frontend terhubung dengan backend"** pada tiket **belum terpenuhi** per tanggal dokumen ini dibuat. Konfirmasi ke tim: EVG-41 (Backend Auth & RBAC, PIC Hanif) **belum selesai/belum ada konfirmasi** saat EVG-42 ini dikerjakan, sehingga `authApi.ts` sengaja dibuat mock (4 akun demo, lihat bagian 3.A) agar UI, route guard, dan redirect role tetap bisa diverifikasi tanpa menunggu backend.

**Tindak lanjut**: begitu EVG-41 rilis dengan endpoint login yang jelas, ganti isi fungsi `login()` di `authApi.ts` dengan `fetch` ke endpoint tersebut — tidak perlu mengubah halaman login, store, atau route guard.

## 7. Catatan untuk Sprint Berikutnya
- Role & Permission Matrix (EVG-27, sudah di-approve) menetapkan bahwa **Peserta menggunakan guest registration dan tidak memiliki akun login**; skema database EVG-40 juga sudah mengonfirmasi hal ini (tabel `participants` terpisah dari `users`, tanpa kolom password). Opsi login "peserta" pada implementasi saat ini bersifat sementara mengikuti draft tiket Sprint 2 dan sebaiknya dikonfirmasi ulang ke PM sebelum sprint berikutnya.
