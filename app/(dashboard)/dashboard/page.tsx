'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Hutang } from '@/types'
import { formatRupiah } from '@/lib/formatRupiah'
import { getStatusHutang } from '@/lib/utils'
import HutangCard from '@/components/hutang/HutangCard'
import BayarHutangModal from '@/components/hutang/BayarHutangModal'
import { AlertCircle, Clock, Calendar, CalendarDays, Infinity as InfinityIcon, TrendingUp, Plus } from 'lucide-react'

interface RingkasanItem {
  label: string
  jumlah: number
  warna: string
  bg: string
  icon: React.ReactNode
}

export default function DashboardPage() {
  const [hutangList, setHutangList] = useState<Hutang[]>([])
  const [loading, setLoading] = useState(true)
  const [bayarModal, setBayarModal] = useState<Hutang | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/hutang')
    if (res.ok) {
      const data = await res.json()
      setHutangList(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const aktif = hutangList.filter((h) => (h.sisa ?? h.jumlah) > 0)

  const ringkasan = {
    terlambat: aktif.filter((h) => getStatusHutang(h) === 'terlambat').reduce((s, h) => s + (h.sisa ?? h.jumlah), 0),
    hari_ini: aktif.filter((h) => getStatusHutang(h) === 'hari_ini').reduce((s, h) => s + (h.sisa ?? h.jumlah), 0),
    bulan_ini: aktif.filter((h) => ['hari_ini', 'bulan_ini'].includes(getStatusHutang(h))).reduce((s, h) => s + (h.sisa ?? h.jumlah), 0),
    bulan_depan: aktif.filter((h) => getStatusHutang(h) === 'bulan_depan').reduce((s, h) => s + (h.sisa ?? h.jumlah), 0),
    kemudian: aktif.filter((h) => getStatusHutang(h) === 'kemudian').reduce((s, h) => s + (h.sisa ?? h.jumlah), 0),
    total: hutangList.reduce((s, h) => s + Number(h.jumlah), 0),
  }

  const cards: RingkasanItem[] = [
    { label: 'Terlambat', jumlah: ringkasan.terlambat, warna: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: <AlertCircle size={20} className="text-red-500" /> },
    { label: 'Hari Ini', jumlah: ringkasan.hari_ini, warna: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: <Clock size={20} className="text-orange-500" /> },
    { label: 'Bulan Ini', jumlah: ringkasan.bulan_ini, warna: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: <Calendar size={20} className="text-blue-500" /> },
    { label: 'Bulan Depan', jumlah: ringkasan.bulan_depan, warna: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', icon: <CalendarDays size={20} className="text-indigo-500" /> },
    { label: 'Kemudian', jumlah: ringkasan.kemudian, warna: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: <InfinityIcon size={20} className="text-gray-500" /> },
    { label: 'Total Sepanjang Waktu', jumlah: ringkasan.total, warna: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: <TrendingUp size={20} className="text-green-500" /> },
  ]

  async function handleHapus(id: string) {
    if (!confirm('Yakin ingin menghapus hutang ini?')) return
    await fetch(`/api/hutang?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const mendatang = aktif.slice(0, 10)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan hutang Anda</p>
        </div>
        <Link
          href="/hutang/tambah"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Tambah Hutang
        </Link>
      </div>

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
            </div>
            <div className={`font-bold text-lg ${card.warna}`}>
              {formatRupiah(card.jumlah)}
            </div>
          </div>
        ))}
      </div>

      {/* List Hutang Mendatang */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Hutang Mendatang</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat data...</div>
        ) : mendatang.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-5xl mb-3">🎉</div>
            <p className="text-gray-500 font-medium">Tidak ada hutang aktif!</p>
            <Link href="/hutang/tambah" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Tambah hutang pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mendatang.map((h) => (
              <HutangCard
                key={h.id}
                hutang={h}
                onBayar={setBayarModal}
                onSunting={(hutang) => window.location.href = `/hutang?edit=${hutang.id}`}
                onHapus={handleHapus}
              />
            ))}
            {aktif.length > 10 && (
              <Link href="/hutang" className="block text-center text-blue-600 hover:underline text-sm py-2">
                Lihat semua {aktif.length} hutang →
              </Link>
            )}
          </div>
        )}
      </div>

      {bayarModal && (
        <BayarHutangModal
          hutang={bayarModal}
          onClose={() => setBayarModal(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
