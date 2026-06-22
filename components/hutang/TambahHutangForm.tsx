'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Hutang, Kategori } from '@/types'
import { getTodayISO } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface TambahHutangFormProps {
  hutangEdit?: Hutang | null
  onSuccess?: () => void
}

export default function TambahHutangForm({ hutangEdit, onSuccess }: TambahHutangFormProps) {
  const router = useRouter()
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [kategoriId, setKategoriId] = useState('')
  const [namaKategoriBaru, setNamaKategoriBaru] = useState('')
  const [showKategoriBaru, setShowKategoriBaru] = useState(false)
  const [tanggal, setTanggal] = useState(getTodayISO())
  const [jumlah, setJumlah] = useState('')
  const [catatan, setCatatan] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringMonths, setRecurringMonths] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchKategori()
  }, [])

  useEffect(() => {
    if (hutangEdit) {
      setKategoriId(hutangEdit.kategori_id || '')
      setTanggal(hutangEdit.tanggal)
      setJumlah(String(hutangEdit.jumlah))
      setCatatan(hutangEdit.catatan || '')
      setIsRecurring(hutangEdit.is_recurring)
      setRecurringMonths(String(hutangEdit.recurring_months || 1))
    }
  }, [hutangEdit])

  async function fetchKategori() {
    const res = await fetch('/api/kategori')
    if (res.ok) {
      const data = await res.json()
      setKategoriList(data)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let finalKategoriId = kategoriId

    if (showKategoriBaru && namaKategoriBaru.trim()) {
      const res = await fetch('/api/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: namaKategoriBaru.trim() }),
      })
      if (res.ok) {
        const newKat = await res.json()
        finalKategoriId = newKat.id
      }
    }

    const payload = {
      kategori_id: finalKategoriId || null,
      tanggal,
      jumlah: parseFloat(jumlah),
      catatan: catatan.trim() || null,
      is_recurring: isRecurring,
      recurring_months: isRecurring ? parseInt(recurringMonths) : null,
    }

    const url = hutangEdit ? `/api/hutang?id=${hutangEdit.id}` : '/api/hutang'
    const method = hutangEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Gagal menyimpan hutang.')
    } else {
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/hutang')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        {!showKategoriBaru ? (
          <div className="flex gap-2">
            <select
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowKategoriBaru(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <Plus size={16} />
              Baru
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={namaKategoriBaru}
              onChange={(e) => setNamaKategoriBaru(e.target.value)}
              placeholder="Nama kategori baru"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowKategoriBaru(false)}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* Tanggal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Jatuh Tempo</label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Jumlah */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
        <input
          type="number"
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
          required
          min="1"
          step="0.01"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      </div>

      {/* Catatan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Tambahkan catatan..."
        />
      </div>

      {/* Recurring */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="recurring" className="text-sm font-medium text-gray-700 cursor-pointer">
          Ulangi Hutang (Recurring)
        </label>
      </div>

      {isRecurring && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jumlah Bulan untuk Mengulang
          </label>
          <input
            type="number"
            value={recurringMonths}
            onChange={(e) => setRecurringMonths(e.target.value)}
            required
            min="1"
            max="60"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Akan membuat {recurringMonths} entri hutang dengan nominal yang sama setiap bulan.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Menyimpan...' : hutangEdit ? 'Simpan Perubahan' : 'Tambah Hutang'}
        </button>
      </div>
    </form>
  )
}
