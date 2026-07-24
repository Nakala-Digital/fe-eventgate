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
| **Status** | Completed — Connected to real Auth API (EVG-41), verified against local backend |

---

## 1. Executive Summary

Task **EVG-42** mengimplementasikan halaman login dan navigasi berbasis role pada frontend EventGate. Awalnya dibangun dengan mock auth (backend EVG-41 belum ada konfirmasi selesai saat itu); setelah EVG-41 rilis, `authApi.ts` disambungkan ke endpoint asli (`POST /api/auth/login`) dan diverifikasi end-to-end melawan backend `be-eventgate` yang dijalankan lokal.

---

## 2. Directory Layout & Perubahan

```text
fe-eventgate/
├── .env                               # PUBLIC_API_BASE_URL -> http://localhost:8080/api (lihat Bagian 6)
├── src/
│   ├── lib/
│   │   ├── services/
│   │   │   └── authApi.ts            # Login service: real API + fallback mock jika backend unreachable
│   │   ├── stores/
│   │   │   └── authStore.ts          # UserRole (+school-reviewer) + persistensi token
│   │   └── components/common/
│   │       ├── Navbar.svelte         # Tombol Masuk/Dashboard sesuai status login
│   │       └── Sidebar.svelte        # + nav item untuk role school-reviewer
│   └── routes/
│       ├── auth/login/+page.svelte   # UI login (email, password, remember me)
│       ├── dashboard/+layout.svelte  # Route guard + info user & logout
│       └── dashboard/school-reviewer/+page.svelte  # Placeholder dashboard role baru (lihat Bagian 5)
```

---

## 3. Core Components

### A. Auth Service (`src/lib/services/authApi.ts`)
`login(email, password)` memanggil `POST {API_BASE_URL}/auth/login` sungguhan. Response sukses (`{token, user: {id, username, email, role_name, is_active}}`) dipetakan ke `UserProfile` internal via `ROLE_NAME_MAP`. Error 401/403 dari backend diteruskan sebagai `LoginError` dengan pesan asli. Jika `fetch` gagal total (backend tidak jalan), fallback ke 4 akun demo in-memory yang meniru data seed backend (`cmd/seeduser`) agar development tetap bisa jalan offline.

**Role mapping** (`role_name` backend snake_case → `UserRole` frontend):
| Backend `role_name` | Frontend `UserRole` | Bisa Login? |
| :--- | :--- | :--- |
| `super_admin` | `super-admin` | Ya |
| `admin_panitia` | `panitia` | Ya |
| `staf_lapangan` | `field-staff` | Ya |
| `school_reviewer` | `school-reviewer` | Ya |
| `peserta` | *(tidak ada mapping)* | **Tidak** — dikonfirmasi resmi oleh RBAC Matrix EVG-41: peserta terdaftar via guest registration, tidak punya akun/password. |

Demo accounts (fallback offline, password: `Rahasia123!`, sama seperti seed backend):
| Email | Role |
| :--- | :--- |
| superadmin@eventgate.com | super-admin |
| panitia@eventgate.com | panitia |
| staf@eventgate.com | field-staff |
| reviewer@eventgate.com | school-reviewer |

### B. Auth Store (`src/lib/stores/authStore.ts`)
`UserRole` ditambah `'school-reviewer'` (role baru yang ditemukan di EVG-41, tidak ada di ticket Sprint 2 asli). `setAuth`/`clearAuth`/persistensi storage tidak berubah dari implementasi sebelumnya.

### C. Login Page & Route Guard
Tidak berubah secara struktural dari versi sebelumnya — hanya mengonsumsi `authApi.ts` yang sekarang nyambung ke backend asli.

### D. Placeholder Dashboard `school-reviewer` (baru)
Role `school_reviewer` bisa login di backend tapi sebelumnya tidak punya tujuan redirect sama sekali di frontend (akan 404). Ditambahkan halaman placeholder + nav Sidebar minimal agar login role ini tidak error — **belum ada desain/spesifikasi UI resmi**, perlu dikonfirmasi ke PM/UI-UX sebelum dikembangkan lebih lanjut (lihat Bagian 5).

---

## 4. Routing & Redirect Behavior

| Route | Perilaku |
| :--- | :--- |
| `/auth/login` | Form login publik |
| `/dashboard/*` | Dilindungi — redirect ke `/auth/login` bila belum ada sesi aktif |
| Setelah login sukses | Redirect ke `/dashboard/{role}` sesuai role akun |
| Logout | Membersihkan sesi, redirect ke `/auth/login` |

---

## 5. Temuan Baru: Role `school_reviewer` Belum Punya Spesifikasi UI

Backend EVG-41 mendefinisikan 5 role, bukan 4 seperti draft ticket Sprint 2 (`Super Admin, Admin Panitia, Peserta, Staf Lapangan`). Role kelima, `school_reviewer`, disiapkan backend untuk *hierarchical approval workflow* tapi:
- Tidak disebut di ticket EVG-42/46 manapun.
- Tidak ada di EVG-52 (High Fidelity Design – Authentication) atau EVG-54 (Event Approval) scope.

Untuk sementara, user dengan role ini diarahkan ke placeholder kosong. **Perlu keputusan PM**: apakah role ini akan benar-benar dipakai Sprint 2 (butuh ticket UI baru) atau disimpan untuk sprint mendatang.

---

## 6. Bug Backend yang Ditemukan Saat Verifikasi (untuk diteruskan ke tim BE)

Saat menjalankan `be-eventgate` secara lokal untuk verifikasi integrasi, ditemukan beberapa bug:

1. **Routing `/api/v1/*` rusak** — `internal/delivery/http/router.go` mendaftarkan sub-route khusus `/api/v1` yang isinya cuma `/health`, sehingga menghalangi (shadow) router auth/event yang di-mount setelahnya untuk prefix yang sama. Hanya `/api/v1/health` yang bisa diakses; endpoint lain (`login`, `me`, `events`) hanya bisa lewat prefix `/api` polos (tanpa `/v1`). **Frontend saat ini di-set memakai `/api`** (lihat `.env` dan `src/lib/config/env.ts`) sebagai workaround — revert ke `/api/v1` setelah backend memperbaiki ini.
2. **`go run main.go` crash di database fresh** — `internal/database/database.go`'s `Migrate()` (GORM `AutoMigrate`) mengasumsikan nama constraint yang tidak sesuai dengan yang dibuat migration SQL manual (`roles_role_name_key` vs `uni_roles_role_name`, juga untuk `users.username`, `users.email`, `events.slug`). Anggota tim yang mengikuti Quickstart README akan mengalami crash yang sama sampai ini diperbaiki.
3. **Response envelope tidak konsisten** — `/health` dibungkus `{success, message, data}`, tapi `/auth/login`, `/auth/me`, `/events` mengembalikan JSON polos. Sudah diperbaiki di sisi frontend (`eventApi.ts`, lihat dokumentasi EVG-46) dengan helper `unwrap()`, tapi backend sebaiknya konsisten di semua endpoint.

**Tindak lanjut**: laporkan ke Hanif/tim backend — item #1 dan #2 blocking untuk semua orang yang setup ulang dari clean database.

## 7. Catatan Lama (sudah terkonfirmasi resmi)
Role & Permission Matrix EVG-41 mengonfirmasi **Peserta tidak memiliki akun login** (guest registration only) — sudah ditangani di Bagian 3.A (tidak ada mapping role peserta untuk login).
