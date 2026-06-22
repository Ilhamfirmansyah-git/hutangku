'use client'

import { useState } from 'react'
import { Star, Check, Zap, Download, Bell } from 'lucide-react'

const benefits = [
  { icon: Zap, text: 'Unlimited hutang aktif (free: hanya 5)' },
  { icon: Download, text: 'Export ke Excel & PDF' },
  { icon: Bell, text: 'Notifikasi email H-1 dan H-0 jatuh tempo' },
  { icon: Star, text: 'Akses semua fitur laporan lanjutan' },
  { icon: Check, text: 'Bayar sekali, akses selamanya' },
]

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBayar() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/payment/midtrans', { method: 'POST' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Gagal memulai pembayaran.')
      setLoading(false)
      return
    }

    const { token, redirect_url } = await res.json()

    interface SnapWindow extends Window { snap?: { pay: (token: string, opts: object) => void } }
    if (typeof window !== 'undefined' && (window as SnapWindow).snap && token) {
      ;(window as SnapWindow).snap!.pay(token, {
        onSuccess: async (result: { order_id: string }) => {
          await fetch('/api/payment/midtrans', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: result.order_id }),
          })
          window.location.href = '/pengaturan'
        },
        onPending: () => setLoading(false),
        onError: () => { setError('Pembayaran gagal.'); setLoading(false) },
        onClose: () => setLoading(false),
      })
    } else if (redirect_url) {
      window.location.href = redirect_url
    } else {
      setError('Konfigurasi payment belum aktif. Hubungi admin.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upgrade ke Premium</h1>
        <p className="text-gray-500 text-sm mt-1">Bayar sekali, akses selamanya</p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Star size={28} className="text-amber-500" />
          <span className="text-2xl font-bold text-gray-900">LunasPro Premium</span>
        </div>
        <div className="text-4xl font-extrabold text-amber-600 mt-4 mb-1">
          Rp 99.000
        </div>
        <p className="text-sm text-gray-500">Satu kali pembayaran, akses selamanya</p>

        <div className="mt-6 space-y-3">
          {benefits.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-amber-600" />
              </div>
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleBayar}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-3.5 rounded-xl font-bold text-lg transition-colors"
      >
        {loading ? 'Memproses...' : 'Bayar Sekarang — Rp 99.000'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Pembayaran aman menggunakan Midtrans. Mendukung transfer bank, e-wallet, kartu kredit.
      </p>

      {/* Load Midtrans Snap */}
      <script
        src={`https://app.sandbox.midtrans.com/snap/snap.js`}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        async
      />
    </div>
  )
}
