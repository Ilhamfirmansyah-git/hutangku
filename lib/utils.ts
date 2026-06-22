import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Hutang, StatusHutang } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusHutang(hutang: Hutang): StatusHutang {
  const sisa = hutang.sisa ?? hutang.jumlah
  if (sisa <= 0) return 'lunas'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tanggal = new Date(hutang.tanggal)
  tanggal.setHours(0, 0, 0, 0)

  const bulanIni = new Date(today.getFullYear(), today.getMonth(), 1)
  const akhirBulanIni = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const awalBulanDepan = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const akhirBulanDepan = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  if (tanggal < today) return 'terlambat'
  if (tanggal.getTime() === today.getTime()) return 'hari_ini'
  if (tanggal >= bulanIni && tanggal <= akhirBulanIni) return 'bulan_ini'
  if (tanggal >= awalBulanDepan && tanggal <= akhirBulanDepan) return 'bulan_depan'
  return 'kemudian'
}

export function formatTanggal(tanggal: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(tanggal))
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}
