'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Kategori, Profile } from '@/types'
import { Trash2, Plus, Star } from 'lucide-react'
import { formatTanggal } from '@/lib/utils'
import Link from 'next/link'

export default function PengaturanPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [namaKategori, setNamaKategori] = useState('')
  const [nama, setNama] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingKategori, setSavingKategori] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const [{ data: prof }, kategori] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      fetch('/api/kategori').then((r) => r.json()),
    ])

    if (prof) { setProfile(prof); setNama(prof.nama || '') }
    setKategoriList(Array.isArray(kategori) ? kategori : [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSavingProfile(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ nama })
      .eq('id', session.user.id)

    if (!error) { setSuccessMsg('Profil berhasil disimpan.'); setTimeout(() => setSuccessMsg(''), 3000) }
    setSavingProfile(false)
  }

  async function handleTambahKategori(e: React.FormEvent) {
    e.preventDefault()
    if (!namaKategori.trim()) return
    setSavingKategori(true)

    const res = await fetch('/api/kategori', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: namaKategori.trim() }),
    })

    if (res.ok) {
      setNamaKategori('')
      fetchData()
    }
    setSavingKategori(false)
  }

  async function handleHapusKategori(id: string) {
    if (!confirm('Hapus kategori ini? Hutang yang terkait tidak akan terhapus.')) return
    await fetch(`/api/kategori?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Memuat pengaturan...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola akun dan preferensi Anda</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}

      {/* Profil */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Profil</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {/* Status Premium */}
      <div className={`rounded-2xl border shadow-sm p-6 ${profile?.is_premium ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3 mb-3">
          <Star size={20} className={profile?.is_premium ? 'text-amber-500' : 'text-gray-400'} />
          <h2 className="font-bold text-gray-800">Status Akun</h2>
        </div>
        {profile?.is_premium ? (
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-2">
              <Star size={14} />
              Premium
            </div>
            <p className="text-sm text-gray-500">
              Diaktifkan sejak: {profile.premium_purchased_at ? formatTanggal(profile.premium_purchased_at) : '-'}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Akun Anda saat ini gratis (maks. 5 hutang). Upgrade untuk unlimited hutang, export, dan notifikasi email.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Star size={15} />
              Upgrade Premium
            </Link>
          </div>
        )}
      </div>

      {/* Kategori */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Kelola Kategori</h2>

        <form onSubmit={handleTambahKategori} className="flex gap-2 mb-4">
          <input
            type="text"
            value={namaKategori}
            onChange={(e) => setNamaKategori(e.target.value)}
            placeholder="Nama kategori baru"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={savingKategori || !namaKategori.trim()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Tambah
          </button>
        </form>

        {kategoriList.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Belum ada kategori.</p>
        ) : (
          <div className="space-y-2">
            {kategoriList.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">{k.nama}</span>
                <button
                  onClick={() => handleHapusKategori(k.id)}
                  className="p-1.5 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
