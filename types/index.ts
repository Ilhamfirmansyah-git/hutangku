export interface Profile {
  id: string
  nama: string | null
  email: string | null
  is_premium: boolean
  premium_purchased_at: string | null
  created_at: string
}

export interface Kategori {
  id: string
  user_id: string
  nama: string
  created_at: string
}

export interface Hutang {
  id: string
  user_id: string
  kategori_id: string | null
  tanggal: string
  jumlah: number
  catatan: string | null
  is_recurring: boolean
  recurring_months: number | null
  created_at: string
  kategori?: Kategori
  total_dibayar?: number
  sisa?: number
}

export interface Pembayaran {
  id: string
  hutang_id: string
  user_id: string
  tanggal_bayar: string
  jumlah: number
  created_at: string
  hutang?: Hutang
}

export type StatusHutang = 'terlambat' | 'hari_ini' | 'bulan_ini' | 'bulan_depan' | 'kemudian' | 'lunas'
