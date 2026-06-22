'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Hutang } from '@/types'
import HutangCard from '@/components/hutang/HutangCard'
import BayarHutangModal from '@/components/hutang/BayarHutangModal'
import TambahHutangForm from '@/components/hutang/TambahHutangForm'
import { Plus, X } from 'lucide-react'

export default function HutangPage() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [hutangList, setHutangList] = useState<Hutang[]>([])
  const [loading, setLoading] = useState(true)
  const [bayarModal, setBayarModal] = useState<Hutang | null>(null)
  const [editHutang, setEditHutang] = useState<Hutang | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [filter, setFilter] = useState<'semua' | 'aktif' | 'lunas'>('aktif')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/hutang')
    if (res.ok) {
      const data = await res.json()
      setHutangList(data)
      if (editId) {
        const found = data.find((h: Hutang) => h.id === editId)
        if (found) {
          setEditHutang(found)
          setShowEditForm(true)
        }
      }
    }
    setLoading(false)
  }, [editId])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleHapus(id: string) {
    if (!confirm('Yakin ingin menghapus hutang ini?')) return
    await fetch(`/api/hutang?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const filtered = hutangList.filter((h) => {
    const sisa = h.sisa ?? h.jumlah
    if (filter === 'aktif') return sisa > 0
    if (filter === 'lunas') return sisa <= 0
    return true
  })

  if (showEditForm) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setShowEditForm(false); setEditHutang(null) }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sunting Hutang</h1>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xl">
          <TambahHutangForm
            hutangEdit={editHutang}
            onSuccess={() => { setShowEditForm(false); setEditHutang(null); fetchData() }}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Hutang</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} hutang ditemukan</p>
        </div>
        <Link
          href="/hutang/tambah"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Tambah
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {(['aktif', 'lunas', 'semua'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'aktif' ? 'Aktif' : f === 'lunas' ? 'Lunas' : 'Semua'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada hutang.</p>
          <Link href="/hutang/tambah" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            + Tambah hutang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => (
            <HutangCard
              key={h.id}
              hutang={h}
              onBayar={setBayarModal}
              onSunting={(hutang) => { setEditHutang(hutang); setShowEditForm(true) }}
              onHapus={handleHapus}
            />
          ))}
        </div>
      )}

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
