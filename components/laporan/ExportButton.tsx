'use client'

import { useState } from 'react'
import { Hutang, Pembayaran } from '@/types'
import { formatRupiah } from '@/lib/formatRupiah'
import { formatTanggal } from '@/lib/utils'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  hutangList: Hutang[]
  pembayaranList: Pembayaran[]
}

export default function ExportButton({ hutangList, pembayaranList }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function exportExcel() {
    setLoading(true)
    const XLSX = await import('xlsx')

    const hutangRows = hutangList.map((h) => ({
      'Kategori': h.kategori?.nama || '-',
      'Tanggal Jatuh Tempo': h.tanggal,
      'Jumlah': h.jumlah,
      'Total Dibayar': h.total_dibayar || 0,
      'Sisa': h.sisa ?? h.jumlah,
      'Catatan': h.catatan || '',
    }))

    const pembayaranRows = pembayaranList.map((p) => ({
      'Tanggal Bayar': p.tanggal_bayar,
      'Jumlah Dibayar': p.jumlah,
      'Kategori Hutang': (p.hutang as { kategori?: { nama?: string } })?.kategori?.nama || '-',
      'Catatan Hutang': (p.hutang as { catatan?: string })?.catatan || '',
    }))

    const wb = XLSX.utils.book_new()
    const wsHutang = XLSX.utils.json_to_sheet(hutangRows)
    const wsPembayaran = XLSX.utils.json_to_sheet(pembayaranRows)

    XLSX.utils.book_append_sheet(wb, wsHutang, 'Daftar Hutang')
    XLSX.utils.book_append_sheet(wb, wsPembayaran, 'Riwayat Pembayaran')

    XLSX.writeFile(wb, `LunasPro-Laporan-${new Date().toISOString().split('T')[0]}.xlsx`)
    setLoading(false)
  }

  async function exportPDF() {
    setLoading(true)
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235)
    doc.text('LunasPro - Laporan Hutang', 20, 20)

    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(`Dicetak pada: ${formatTanggal(new Date().toISOString())}`, 20, 30)

    const totalHutang = hutangList.reduce((s, h) => s + Number(h.jumlah), 0)
    const totalDibayar = pembayaranList.reduce((s, p) => s + Number(p.jumlah), 0)
    const totalSisa = hutangList.reduce((s, h) => s + (h.sisa ?? h.jumlah), 0)

    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text('Ringkasan', 20, 45)

    doc.setFontSize(11)
    doc.text(`Total Hutang     : ${formatRupiah(totalHutang)}`, 20, 55)
    doc.text(`Total Dibayar    : ${formatRupiah(totalDibayar)}`, 20, 63)
    doc.text(`Total Sisa       : ${formatRupiah(totalSisa)}`, 20, 71)

    doc.setFontSize(13)
    doc.text('Daftar Hutang', 20, 85)

    let y = 95
    doc.setFontSize(10)
    hutangList.slice(0, 20).forEach((h, i) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(`${i + 1}. ${formatTanggal(h.tanggal)} - ${formatRupiah(h.jumlah)} - Sisa: ${formatRupiah(h.sisa ?? h.jumlah)}`, 20, y)
      y += 8
    })

    doc.save(`LunasPro-Laporan-${new Date().toISOString().split('T')[0]}.pdf`)
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportExcel}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Download size={15} />
        Excel
      </button>
      <button
        onClick={exportPDF}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Download size={15} />
        PDF
      </button>
    </div>
  )
}
