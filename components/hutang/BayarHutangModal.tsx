'use client'

import { useState } from 'react'
import { Hutang } from '@/types'
import { formatRupiah } from '@/lib/formatRupiah'
import { getTodayISO } from '@/lib/utils'
import { X } from 'lucide-react'

interface BayarHutangModalProps {
  hutang: Hutang
  onClose: () => void
  onSuccess: () => void
}

export default function BayarHutangModal({ hutang, onClose, onSuccess }: BayarHutangModalProps) {
  const sisa = hutang.sisa ?? hutang.jumlah
  const [modeBayar, setModeBayar] = useState<'penuh' | 'sebagian'>('penuh')
  const [jumlahBayar, setJumlahBayar] = useState('')
  const [tanggalBayar, setTanggalBayar] = useState(getTodayISO())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const jumlah = modeBayar === 'penuh' ? sisa : parseFloat(jumlahBayar)

    if (!jumlah || jumlah <= 0) {
      setError('Jumlah pembayaran tidak valid.')
      setLoading(false)
      return
    }

    if (jumlah > sisa) {
      setError(`Jumlah melebihi sisa hutang (${formatRupiah(sisa)}).`)
      setLoading(false)
      return
    }

    const res = await fetch('/api/pembayaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hutang_id: hutang.id, jumlah, tanggal_bayar: tanggalBayar }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Gagal menyimpan pembayaran.')
    } else {
      onSuccess()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Bayar Hutang</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-xl p-4 mb-5">
            <div className="text-sm text-gray-500 mb-1">Total Hutang</div>
            <div className="font-bold text-2xl text-gray-900">{formatRupiah(hutang.jumlah)}</div>
            {sisa !== hutang.jumlah && (
              <div className="text-sm text-red-600 font-medium mt-1">Sisa: {formatRupiah(sisa)}</div>
            )}
            {hutang.kategori && (
              <div className="text-xs text-gray-500 mt-1">Kategori: {hutang.kategori.nama}</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModeBayar('penuh')}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    modeBayar === 'penuh'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Bayar Penuh
                </button>
                <button
                  type="button"
                  onClick={() => setModeBayar('sebagian')}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    modeBayar === 'sebagian'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Bayar Sebagian
                </button>
              </div>
            </div>

            {modeBayar === 'sebagian' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Dibayar (Rp)
                </label>
                <input
                  type="number"
                  value={jumlahBayar}
                  onChange={(e) => setJumlahBayar(e.target.value)}
                  required
                  min="1"
                  max={sisa}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Pembayaran
              </label>
              <input
                type="date"
                value={tanggalBayar}
                onChange={(e) => setTanggalBayar(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Konfirmasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
