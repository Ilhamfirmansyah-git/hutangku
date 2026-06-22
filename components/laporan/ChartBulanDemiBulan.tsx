'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '@/lib/formatRupiah'

interface DataBulan {
  bulan: string
  jumlah: number
}

interface Props {
  data: DataBulan[]
}

interface TooltipProps { active?: boolean; payload?: { value: number }[]; label?: string }
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-blue-600 font-bold">{formatRupiah(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function ChartBulanDemiBulan({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="jumlah" fill="#2563EB" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
