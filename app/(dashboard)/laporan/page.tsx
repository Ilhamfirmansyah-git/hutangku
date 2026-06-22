'use client'

import { useState, useEffect, useCallback } from 'react'
import { Hutang, Pembayaran, Kategori } from '@/types'
import { formatRupiah } from '@/lib/formatRupiah'
import { formatTanggal } from '@/lib/utils'
import ChartBulanDemiBulan from '@/components/laporan/ChartBulanDemiBulan'
import ChartKategori from '@/components/laporan/ChartKategori'
import ExportButton from '@/components/laporan/ExportButton'

type TabLaporan = 'bulanan' | 'kategori' | 'pembayaran' | 'rekap'

const BULAN_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function LaporanPage() {
  const [tab, setTab] = useState<TabLaporan>('bulanan')
  const [hutangList, setHutangList] = useState<Hutang[]>([])
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([])
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear())
  const [filterKategori, setFilterKategori] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [h, p, k] = await Promise.all([
      fetch('/api/hutang').then((r) => r.json()),
      fetch('/api/pembayaran').then((r) => r.json()),
      fetch('/api/kategori').then((r) => r.json()),
    ])
    setHutangList(Array.isArray(h) ? h : [])
    setPembayaranList(Array.isArray(p) ? p : [])
    setKategoriList(Array.isArray(k) ? k : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const tahunList = Array.from(new Set(hutangList.map((h) => new Date(h.tanggal).getFullYear()))).sort()

  const hutangFiltered = hutangList.filter((h) => {
    const tahun = new Date(h.tanggal).getFullYear()
    if (tahun !== filterTahun) return false
    if (filterKategori && h.kategori_id !== filterKategori) return false
    return true
  })

  const dataBulanan = BULAN_LABELS.map((bulan, i) => ({
    bulan,
    jumlah: hutangFiltered
      .filter((h) => new Date(h.tanggal).getMonth() === i)
      .reduce((s, h) => s + Number(h.jumlah), 0),
  }))

  const dataKategori = kategoriList.map((k) => ({
    nama: k.nama,
    jumlah: hutangList
      .filter((h) => h.kategori_id === k.id)
      .reduce((s, h) => s + Number(h.jumlah), 0),
  })).filter((d) => d.jumlah > 0)

  const tabs = [
    { key: 'bulanan', label: 'Bulan demi Bulan' },
    { key: 'kategori', label: 'Per Kategori' },
    { key: 'pembayaran', label: 'Pembayaran' },
    { key: 'rekap', label: 'Rekap' },
  ] as const

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">Analisis dan rekap hutang Anda</p>
        </div>
        {!loading && (
          <ExportButton hutangList={hutangList} pembayaranList={pembayaranList} />
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              tab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuat laporan...</div>
      ) : (
        <>
          {tab === 'bulanan' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <select
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(tahunList.length ? tahunList : [new Date().getFullYear()]).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Kategori</option>
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              <ChartBulanDemiBulan data={dataBulanan} />
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">Bulan</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Total Hutang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataBulanan.filter((d) => d.jumlah > 0).map((d) => (
                      <tr key={d.bulan} className="border-b border-gray-50">
                        <td className="py-2.5 text-gray-700">{d.bulan} {filterTahun}</td>
                        <td className="py-2.5 text-right font-medium text-gray-900">{formatRupiah(d.jumlah)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'kategori' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {dataKategori.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Belum ada data per kategori.</p>
              ) : (
                <>
                  <ChartKategori data={dataKategori} />
                  <div className="mt-6 space-y-3">
                    {dataKategori.sort((a, b) => b.jumlah - a.jumlah).map((d) => (
                      <div key={d.nama} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">{d.nama}</span>
                        <span className="font-bold text-gray-900">{formatRupiah(d.jumlah)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'pembayaran' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">Riwayat Pembayaran</h2>
              {pembayaranList.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Belum ada riwayat pembayaran.</p>
              ) : (
                <div className="space-y-3">
                  {pembayaranList.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          {(p.hutang as { kategori?: { nama?: string } })?.kategori?.nama || 'Tanpa Kategori'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{formatTanggal(p.tanggal_bayar)}</div>
                      </div>
                      <span className="font-bold text-green-600">{formatRupiah(p.jumlah)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'rekap' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">Rekap per Kategori</h2>
              {kategoriList.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Belum ada kategori.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-gray-500 font-medium">Kategori</th>
                        <th className="text-right py-3 text-gray-500 font-medium">Total Hutang</th>
                        <th className="text-right py-3 text-gray-500 font-medium">Total Dibayar</th>
                        <th className="text-right py-3 text-gray-500 font-medium">Sisa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kategoriList.map((k) => {
                        const hutangKat = hutangList.filter((h) => h.kategori_id === k.id)
                        const totalHutang = hutangKat.reduce((s, h) => s + Number(h.jumlah), 0)
                        const totalDibayar = hutangKat.reduce((s, h) => s + (h.total_dibayar || 0), 0)
                        const sisa = totalHutang - totalDibayar
                        return (
                          <tr key={k.id} className="border-b border-gray-50">
                            <td className="py-3 text-gray-700 font-medium">{k.nama}</td>
                            <td className="py-3 text-right text-gray-900">{formatRupiah(totalHutang)}</td>
                            <td className="py-3 text-right text-green-600">{formatRupiah(totalDibayar)}</td>
                            <td className="py-3 text-right text-red-600 font-semibold">{formatRupiah(sisa)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
