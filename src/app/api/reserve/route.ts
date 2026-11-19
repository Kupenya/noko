import { NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

export async function POST(req: Request) {
  const b = await req.json()
  const itemId = Number(b.item_id)
  const anon = !!b.anonymous
  const name = String(b.name || '').trim()

  if (!Number.isInteger(itemId) || itemId < 1) return NextResponse.json({ error: 'Missing or invalid gift.' }, { status: 400 })
  if (!anon && !name) return NextResponse.json({ error: 'Enter your name or choose anonymous.' }, { status: 400 })

  const item = await query('select id from registry_items where id=$1 and active=true', [itemId])
  if (!item.rows.length) return NextResponse.json({ error: 'This gift is no longer available.' }, { status: 404 })

  await query(
    'insert into reservations (item_id,guest_name,display_name,status) values ($1,$2,$3,$4)',
    [itemId, anon ? null : name, anon ? 'Anonymous' : name, 'pending'],
  )
  return NextResponse.json({ ok: true })
}
