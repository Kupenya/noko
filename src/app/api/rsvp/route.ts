import { NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { sendThanks } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const b = await req.json()
  const name = String(b.name || '').trim()
  const email = String(b.email || '').trim().toLowerCase()

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Name and a valid email are required.' }, { status: 400 })
  }

  await query(`
    insert into rsvps (name,email,attending,guests,dietary,message,updated_at)
    values ($1,$2,$3,$4,$5,$6,now())
    on conflict (email) do update set
      name=excluded.name,
      attending=excluded.attending,
      guests=excluded.guests,
      dietary=excluded.dietary,
      message=excluded.message,
      updated_at=now()
  `, [
    name,
    email,
    !!b.attending,
    b.attending ? Math.min(Math.max(Number(b.guests) || 1, 1), 10) : 0,
    String(b.dietary || '').trim() || null,
    String(b.message || '').trim() || null,
  ])

  const settings = await query('select couple_names from site_settings where id=$1', [1])
  try {
    await sendThanks(email, name, !!b.attending, settings.rows[0]?.couple_names || 'The Couple')
  } catch {}

  return NextResponse.json({ ok: true })
}
