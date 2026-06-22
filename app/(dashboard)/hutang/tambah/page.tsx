import TambahHutangForm from '@/components/hutang/TambahHutangForm'

export default function TambahHutangPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Hutang</h1>
        <p className="text-gray-500 text-sm mt-1">Isi form berikut untuk mencatat hutang baru</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xl">
        <TambahHutangForm />
      </div>
    </div>
  )
}
