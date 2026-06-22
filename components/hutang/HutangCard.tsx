'use client'

import { Hutang } from '@/types'
import { formatRupiah } from '@/lib/formatRupiah'
import { formatTanggal, getStatusHutang } from '@/lib/utils'
import { Calendar, Tag, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface HutangCardProps {
  hutang: Hutang
  onBayar: (hutang: Hutang) => void
  onSunting: (hutang: Hutang) => void
  onHapus: (id: string) => void
}

const statusConfig = {
  terlambat: { label: 'Terlambat', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: AlertCircle, iconColor: 'text-red-500' },
  hari_ini: { label: 'Hari Ini', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: Clock, iconColor: 'text-orange-500' },
  bulan_ini: { label: 'Bulan Ini', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: Calendar, iconColor: 'text-blue-500' },
  bulan_depan: { label: 'Bulan Depan', bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', icon: Calendar, iconColor: 'text-gray-500' },
  kemudian: { label: 'Kemudian', bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600', icon: Calendar, iconColor: 'text-gray-400' },
  lunas: { label: 'Lunas', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', icon: CheckCircle, iconColor: 'text-green-500' },
}

export default function HutangCard({ hutang, onBayar, onSunting, onHapus }: HutangCardProps) {
  const status = getStatusHutang(hutang)
  const cfg = statusConfig[status]
  const Icon = cfg.icon
  const sisa = hutang.sisa ?? hutang.jumlah

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-shadow hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 ${cfg.iconColor}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            {hutang.kategori && (
              <div className="flex items-center gap-1.5 mb-1">
                <Tag size={12} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 truncate">{hutang.kategori.nama}</span>
              </div>
            )}
            <div className="font-bold text-gray-900 text-lg">
              {formatRupiah(hutang.jumlah)}
            </div>
            {sisa < hutang.jumlah && (
              <div className="text-sm text-gray-500 mt-0.5">
                Sisa: <span className="font-semibold text-red-600">{formatRupiah(sisa)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <Calendar size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500">{formatTanggal(hutang.tanggal)}</span>
            </div>
            {hutang.catatan && (
              <p className="text-xs text-gray-500 mt-1.5 truncate">{hutang.catatan}</p>
            )}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {status !== 'lunas' && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onBayar(hutang)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Bayar
          </button>
          <button
            onClick={() => onSunting(hutang)}
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Sunting
          </button>
          <button
            onClick={() => onHapus(hutang.id)}
            className="flex-1 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Hapus
          </button>
        </div>
      )}
      {status === 'lunas' && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onHapus(hutang.id)}
            className="border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  )
}
