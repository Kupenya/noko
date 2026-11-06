import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/supabase'
export async function POST(req: Request) {
  const b = await req.json()
  if (!b.item_id) return NextResponse.json({ error: 'Missing item.' }, { status: 400 })
  const anon = !!b.anonymous
  const name = (b.name || '').trim()
  if (!anon && !name) return NextResponse.json({ error: 'Enter your name or choose anonymous.' }, { status: 400 })
  const { error } = await serviceClient().from('reservations').insert({
    item_id: b.item_id, guest_name: anon ? null : name, display_name: anon ? 'Anonymous' : name, status: 'pending' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
