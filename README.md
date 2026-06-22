# LunasPro — Manajemen Hutang Pribadi

Aplikasi web SaaS manajemen hutang pribadi berbasis Next.js 14, Supabase, dan Tailwind CSS.

---

## Fitur Utama

- **Dashboard** — Ringkasan hutang terlambat, hari ini, bulan ini, bulan depan, kemudian, dan total
- **Daftar Hutang** — Lihat, sunting, hapus, dan filter hutang aktif/lunas
- **Tambah Hutang** — Form dengan kategori, tanggal jatuh tempo, jumlah, catatan, dan opsi recurring
- **Bayar Hutang** — Bayar penuh atau sebagian dengan modal konfirmasi
- **Laporan** — 4 jenis laporan: bulanan, per kategori, riwayat pembayaran, rekap
- **Export** — Export ke Excel (.xlsx) dan PDF
- **Pengaturan** — Kelola profil, kategori, dan status premium
- **Sistem Premium** — Bayar sekali via Midtrans, akses unlimited selamanya

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Charts**: Recharts
- **Export**: jsPDF + SheetJS (xlsx)
- **Payment**: Midtrans

---

## Setup & Instalasi

### 1. Clone dan install dependencies

```bash
git clone <repo-url>
cd lunaspro
npm install
```

### 2. Konfigurasi Environment Variables

Salin `.env.example` ke `.env.local` dan isi nilai-nilainya:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

### 3. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan migration SQL di `supabase/migrations/001_initial.sql` via SQL Editor Supabase
3. Salin URL dan API keys dari **Settings → API** ke `.env.local`

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Deploy ke Vercel

1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables di dashboard Vercel
4. Deploy otomatis setiap push ke branch utama

---

## Struktur Database

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | Profil user (nama, email, status premium) |
| `kategori` | Kategori hutang per user |
| `hutang` | Data hutang (jumlah, tanggal, kategori, recurring) |
| `pembayaran` | Riwayat pembayaran per hutang |

Semua tabel menggunakan Row Level Security (RLS).

---

## Konfigurasi Midtrans

- Gunakan **Sandbox** untuk testing: `https://app.sandbox.midtrans.com`
- Ganti ke **Production** saat go-live
- Ubah URL di `app/api/payment/midtrans/route.ts`

---

## Format Angka

Semua angka dalam format Rupiah Indonesia:
- Pemisah ribuan: titik (`.`)
- Pemisah desimal: koma (`,`)
- Contoh: `Rp 1.068.000,00`

---

## Lisensi

MIT
