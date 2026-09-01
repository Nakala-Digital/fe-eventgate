# Dokumentasi Penyesuaian Backend (BE) - Ticket EVG-46

**Kode Tiket**: EVG-46 / IR-001  
**Fitur**: Approve Event / Pengajuan Approval Acara  
**Test Case**: TC-REV-02 (Pengajuan acara tidak bisa)  
**Severity**: High  
**Reporter**: Gilang (QA)  
**Tanggal**: 01-09-2026  

---

## 1. Ringkasan Masalah (Issue Summary)

Ketika user dengan role **Panitia** membuat event baru (`POST /api/v1/events`) lalu mencoba mengajukan event tersebut untuk disetujui Super Admin melalui tombol **"Ajukan"** (`POST /api/v1/events/{id}/submit`), permintaan pengajuan mengalami kegagalan.

### Penyebab (Root Cause):
1. Backend memiliki validasi pada endpoint submit approval (`POST /api/v1/events/{id}/submit`) yang mewajibkan event memiliki **minimal 1 `TicketType`**.
2. Saat event baru dibuat melalui `POST /api/v1/events`, backend **belum membuat record `ticket_types` default** berdasarkan `quota` dan `price` yang dikirim.
3. Belum tersedia endpoint CRUD untuk mengelola `ticket_types` (seperti `POST /api/v1/events/{id}/ticket-types`), sehingga Frontend tidak dapat menambahkan tiket sebelum melakukan pengajuan event.
4. Terdapat potensi issue pada query soft-delete GORM (jika entitas ticket type terfilter query atau membutuhkan klausa `Unscoped()`).

---

## 2. Rekomendasi Penyesuaian Backend

Untuk menyelesaikan blocker ini, tim Backend dapat menerapkan solusi berikut:

### Solusi 1: Auto-Seed Default Ticket Type saat Create Event (Sangat Direkomendasikan - Quick Fix)
Ketika handler `POST /api/v1/events` berhasil menyimpan data event ke database, lakukan insert 1 entitas `TicketType` default secara otomatis di dalam database transaction:

```go
// Contoh implementasi di CreateEvent handler / service:
defaultTicketType := models.TicketType{
    EventID:   createdEvent.ID,
    Name:      "Tiket Masuk", // atau "Reguler"
    Price:     createdEvent.Price,
    Quota:     createdEvent.Quota,
    SoldCount: 0,
}
if err := tx.Create(&defaultTicketType).Error; err != nil {
    tx.Rollback()
    return err
}
```

> **Keuntungan**:
> - Alur pembuatan event oleh panitia langsung siap diajukan untuk approval tanpa langkah konfigurasi tiket terpisah.
> - Mengatasi kegagalan validasi `TC-REV-02` secara instan tanpa perlu mengubah alur FE saat ini.

---

### Solusi 2: Tambah Endpoint Ticket Types API (Solusi Jangka Panjang / Modular)

Jika tiket acara dapat memiliki beberapa kategori (misal: *Presale*, *Early Bird*, *VIP*), sediakan endpoint berikut:

#### A. Tambah Tipe Tiket Baru
- **Endpoint**: `POST /api/v1/events/{id}/ticket-types`
- **Auth**: Protected (Bearer Token: Panitia pemilik event / Super Admin)
- **Request Body**:
```json
{
  "name": "Presale 1",
  "price": 50000,
  "quota": 100
}
```
- **Response Success (201 Created)**:
```json
{
  "code": 201,
  "message": "Ticket type berhasil dibuat",
  "data": {
    "id": 1,
    "event_id": 10,
    "name": "Presale 1",
    "price": 50000,
    "quota": 100,
    "sold_count": 0,
    "created_at": "2026-09-01T10:00:00Z",
    "updated_at": "2026-09-01T10:00:00Z"
  }
}
```

#### B. Ambil Daftar Tipe Tiket Acara
- **Endpoint**: `GET /api/v1/events/{id}/ticket-types`
- **Auth**: Public / Protected
- **Response Success (200 OK)**:
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "event_id": 10,
      "name": "Presale 1",
      "price": 50000,
      "quota": 100,
      "sold_count": 0
    }
  ]
}
```

#### C. Edit & Hapus Tipe Tiket (Opsional)
- `PUT /api/v1/events/{id}/ticket-types/{ticket_id}` (Update nama, kuota, harga)
- `DELETE /api/v1/events/{id}/ticket-types/{ticket_id}` (Hapus tipe tiket)

---

### Solusi 3: Periksa Behavior Soft-Delete pada Validasi Submit Approval
Pastikan pengecekan ticket type di endpoint `POST /api/v1/events/{id}/submit` tidak terkena false-negative karena soft delete:

```go
var ticketCount int64
if err := db.Model(&models.TicketType{}).
    Where("event_id = ? AND deleted_at IS NULL", eventID).
    Count(&ticketCount).Error; err != nil {
    return err
}

if ticketCount == 0 {
    return errors.New("event harus memiliki minimal 1 tipe tiket sebelum diajukan untuk persetujuan")
}
```

---

## 3. Verifikasi Setelah Penyesuaian BE

1. Login sebagai role `Panitia`.
2. Buat event baru di halaman Manajemen Acara (`/dashboard/panitia/event-management/create`).
3. Klik tombol **"Ajukan"** pada event berstatus `draft`.
4. Event berhasil berpindah status menjadi `pending_approval` dan muncul di antrean Super Admin (`/dashboard/super-admin/event-validation`).
