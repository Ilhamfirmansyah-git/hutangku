'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '@/lib/formatRupiah'

interface DataKategori {
  nama: string
  jumlah: number
}

interface Props {
  data: DataKategori[]
}

const COLORS = ['#2563EB', '#7C3AED', '#DC2626', '#D97706', '#059669', '#0891B2', '#DB2777', '#65A30D']

interface TooltipProps { active?: boolean; payload?: { name: string; value: number; payload: { fill: string } }[] }
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-sm font-medium text-gray-700">{payload[0].name}</p>
        <p className="font-bold" style={{ color: payload[0].payload.fill }}>{formatRupiah(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function ChartKategori({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="jumlah"
          nameKey="nama"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
