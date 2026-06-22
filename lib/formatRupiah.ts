export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(angka)
    .replace('Rp', 'Rp')
    .trim()
}

export function parseRupiah(nilai: string): number {
  const cleaned = nilai.replace(/[^0-9,]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}
