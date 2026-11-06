import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/supabase'
import { sendThanks } from '@/lib/email'
export const runtime = 'nodejs'
export async function POST(req: Request) {
  const b = await req.json()
  if (!b.name || !/\S+@\S+\.\S+/.test(b.email || '')) return NextResponse.json({ error: 'Name and a valid email are required.' }, { status: 400 })
  const db = serviceClient()
  const { error } = await db.from('rsvps').insert({
    name: b.name, email: b.email, attending: !!b.attending, guests: b.attending ? Math.min(Number(b.guests) || 1, 10) : 0,
    dietary: b.dietary || null, message: b.message || null })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const { data: s } = await db.from('site_settings').select('couple_names').eq('id', 1).single()
  try { await sendThanks(b.email, b.name, !!b.attending, s?.couple_names || 'The Couple') } catch {}
  return NextResponse.json({ ok: true })
}
