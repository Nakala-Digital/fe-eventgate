# Setup & QA Testing Guide - EventGate Frontend (`fe-eventgate`)

Panduan ini ditujukan untuk memfasilitasi tim Developer maupun QA (Quality Assurance) dalam menjalankan, mengonfigurasi, dan menguji aplikasi Frontend **EventGate**.

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan perangkat Anda telah terinstal:

- **Node.js**: Versi `18.x` atau lebih baru (`node -v`)
- **Package Manager**: `npm` (v9+) / `pnpm` / `yarn`
- **Browser**: Google Chrome / Microsoft Edge / Mozilla Firefox (versi terbaru)
- **Backend Service (Opsional)**: Backend API `be-eventgate` berjalan di `http://localhost:8080` (sesuai konfigurasi `.env`)

---

## 🚀 Langkah Instalasi & Menjalankan Aplikasi

### 1. Masuk ke Direktori Proyek
Buka terminal dan arahkan ke folder frontend:
```bash
cd fe-eventgate
```

### 2. Pasang Dependensi (Install Dependencies)
Jalankan perintah berikut untuk mengunduh seluruh dependensi yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin berkas contoh environment `.env.example` menjadi `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS / Bash:**
```bash
cp .env.example .env
```

Pastikan isi `.env` sesuai dengan alamat backend API:
```env
PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
PUBLIC_APP_NAME=EventGate
PUBLIC_APP_ENV=development
```

### 4. Jalankan Development Server
Mulai server development lokal:
```bash
npm run dev
```

Aplikasi web dapat diakses di browser melalui:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Panduan Testing & Skenario QA

Berikut adalah daftar route dan modul utama yang dapat dieksplorasi oleh QA:

### 1. Public & Guest Flow
| Halaman | Route | Deskripsi Pengujian |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Tampilan hero banner, informasi fitur, dan navigasi utama. |
| **Katalog Event** | `/events` | Pencarian, filter kategori/status event, dan list event. |
| **Detail Event** | `/events/[id]` | Rincian informasi event, jadwal, lokasi, harga tiket, dan registrasi pendaftaran. |

### 2. Autentikasi
| Halaman | Route | Deskripsi Pengujian |
| :--- | :--- | :--- |
| **Login** | `/auth/login` | Form login email & kata sandi, validasi form, dan auto-redirect sesuai role. |
| **Register** | `/auth/register` | Pendaftaran akun baru dan validasi input. |
| **Lupa Sandi** | `/auth/login/user/lupa-kata-sandi` | Alur reset/pemulihan password. |

### 3. Role-Based Dashboards
| Role | Route Utama | Modul / Fitur yang Diuji |
| :--- | :--- | :--- |
| **Super Admin** | `/dashboard/super-admin` | • Event Management (`/dashboard/super-admin/event-management`)<br>• Validasi/Approval Event diajukan panitia (`/dashboard/super-admin/event-validation`)<br>• Manajemen Pengguna |
| **Panitia** | `/dashboard/panitia` | • Manajemen Event Panitia (`/dashboard/panitia/event-management`)<br>• Form Buat Event Baru (`.../create`) & Edit Event (`.../[id]/edit`)<br>• Form Builder Dinamis & Daftar Peserta |
| **Peserta** | `/dashboard/peserta` | • Daftar Tiket Terdaftar<br>• E-Ticket & QR Code Tiket |
| **Field Staff** | `/dashboard/field-staff` | • Pemindaian / Scanner QR Code untuk Check-in di lokasi acara |
| **School Reviewer** | `/dashboard/school-reviewer` | • Validasi delegasi & dokumen peserta sekolah |

---

## 🛠️ Daftar Perintah (Available Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan local development server dengan hot-reload (`localhost:5173`). |
| `npm run check` | Menjalankan pemeriksaan tipe TypeScript dan diagnosa Svelte (`svelte-check`). |
| `npm run build` | Membuat bundel produksi di folder `.svelte-kit/output` atau `build`. |
| `npm run preview` | Menjalankan preview lokal dari hasil build produksi. |

---

## ❓ FAQ & Troubleshooting

1. **Error: Port 5173 is already in use**
   - Vite secara otomatis akan menggunakan port berikutnya (misalnya `5174`). Cek log terminal untuk URL yang aktif.
2. **Koneksi API Gagal / Network Error**
   - Pastikan backend API telah berjalan di port yang tertera pada `.env` (`PUBLIC_API_BASE_URL`).
   - Pastikan konfigurasi CORS pada backend mengizinkan origin `http://localhost:5173`.
3. **Module Not Found / Clean Cache**
   - Hapus folder `.svelte-kit` dan `node_modules`, lalu lakukan `npm install` kembali:
     ```bash
     npm run check
     ```
