import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route'

export async function GET() {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('hutang')
      .select(`*, kategori(id, nama), pembayaran(jumlah)`)
      .eq('user_id', session.user.id)
      .order('tanggal', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const hutangWithSisa = data.map((h: { jumlah: number; pembayaran: { jumlah: number }[] }) => {
      const totalDibayar = (h.pembayaran || []).reduce((sum: number, p: { jumlah: number }) => sum + Number(p.jumlah), 0)
      const sisa = Number(h.jumlah) - totalDibayar
      return { ...h, total_dibayar: totalDibayar, sisa, pembayaran: undefined }
    })

    return NextResponse.json(hutangWithSisa)
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
    const { kategori_id, tanggal, jumlah, catatan, is_recurring, recurring_months } = body

    if (!tanggal || !jumlah) {
      return NextResponse.json({ error: 'Tanggal dan jumlah wajib diisi.' }, { status: 400 })
    }

    // Ensure profile row exists
    await supabase.from('profiles').upsert(
      { id: session.user.id, email: session.user.email, nama: session.user.email?.split('@')[0] },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_premium) {
      const { count } = await supabase
        .from('hutang')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

      const batasGratis = 5
      const totalAkanDibuat = is_recurring && recurring_months && recurring_months > 1 ? recurring_months : 1
      if ((count ?? 0) + totalAkanDibuat > batasGratis) {
        return NextResponse.json(
          { error: `Akun gratis hanya bisa memiliki ${batasGratis} hutang. Upgrade ke Premium untuk unlimited.` },
          { status: 403 }
        )
      }
    }

    const entriesToInsert = []
    const baseDate = new Date(tanggal)

    if (is_recurring && recurring_months && recurring_months > 1) {
      for (let i = 0; i < recurring_months; i++) {
        const d = new Date(baseDate)
        d.setMonth(d.getMonth() + i)
        entriesToInsert.push({
          user_id: session.user.id,
          kategori_id: kategori_id || null,
          tanggal: d.toISOString().split('T')[0],
          jumlah,
          catatan: catatan || null,
          is_recurring: true,
          recurring_months,
        })
      }
    } else {
      entriesToInsert.push({
        user_id: session.user.id,
        kategori_id: kategori_id || null,
        tanggal,
        jumlah,
        catatan: catatan || null,
        is_recurring: false,
        recurring_months: null,
      })
    }

    const { data, error } = await supabase.from('hutang').insert(entriesToInsert).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID diperlukan.' }, { status: 400 })

    const body = await req.json()
    const { kategori_id, tanggal, jumlah, catatan, is_recurring, recurring_months } = body

    const { data, error } = await supabase
      .from('hutang')
      .update({ kategori_id: kategori_id || null, tanggal, jumlah, catatan, is_recurring, recurring_months })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID diperlukan.' }, { status: 400 })

    const { error } = await supabase
      .from('hutang')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
