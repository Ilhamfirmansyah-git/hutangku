import { NextRequest, NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('pembayaran')
    .select(`*, hutang(id, jumlah, tanggal, catatan, kategori(nama))`)
    .eq('user_id', session.user.id)
    .order('tanggal_bayar', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { hutang_id, jumlah, tanggal_bayar } = body

  if (!hutang_id || !jumlah || !tanggal_bayar) {
    return NextResponse.json({ error: 'Data pembayaran tidak lengkap.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pembayaran')
    .insert({ hutang_id, user_id: session.user.id, jumlah, tanggal_bayar })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
