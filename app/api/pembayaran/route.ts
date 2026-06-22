import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route'

export async function GET() {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('pembayaran')
      .select(`*, hutang(id, jumlah, tanggal, catatan, kategori(nama))`)
      .eq('user_id', session.user.id)
      .order('tanggal_bayar', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient()
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
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
