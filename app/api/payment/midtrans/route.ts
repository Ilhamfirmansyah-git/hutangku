import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    return NextResponse.json({ error: 'Konfigurasi payment belum diatur.' }, { status: 500 })
  }

  const orderId = `LUNASPRO-${session.user.id.slice(0, 8)}-${Date.now()}`
  const amount = 99000

  const payload = {
    transaction_details: { order_id: orderId, gross_amount: amount },
    customer_details: { email: session.user.email },
    item_details: [{ id: 'PREMIUM', price: amount, quantity: 1, name: 'LunasPro Premium (Selamanya)' }],
  }

  const auth = Buffer.from(`${serverKey}:`).toString('base64')

  const res = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: 'Gagal membuat transaksi.', detail: err }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({ token: data.token, redirect_url: data.redirect_url, order_id: orderId })
}

export async function PUT(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { order_id } = await req.json()
  if (!order_id) return NextResponse.json({ error: 'Order ID diperlukan.' }, { status: 400 })

  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const auth = Buffer.from(`${serverKey}:`).toString('base64')

  const res = await fetch(`https://api.sandbox.midtrans.com/v2/${order_id}/status`, {
    headers: { Authorization: `Basic ${auth}` },
  })

  const txData = await res.json()

  if (['settlement', 'capture'].includes(txData.transaction_status)) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true, premium_purchased_at: new Date().toISOString() })
      .eq('id', session.user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, status: 'premium_activated' })
  }

  return NextResponse.json({ success: false, status: txData.transaction_status })
}
