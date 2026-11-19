import { NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { getAdminEmail } from '@/lib/auth'

export async function GET() {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [rsvps, reservations, items] = await Promise.all([
    query('select attending,guests from rsvps'),
    query('select item_id,status from reservations'),
    query('select id,price from registry_items'),
  ])
  const yes = rsvps.rows.filter((x: any) => x.attending)
  const live = reservations.rows.filter((x: any) => x.status !== 'removed')
  const prices = Object.fromEntries(items.rows.map((i: any) => [i.id, Number(i.price)]))
  return NextResponse.json({
    rsvps: rsvps.rows.length,
    yes: yes.length,
    guests: yes.reduce((n: number, x: any) => n + (Number(x.guests) || 0), 0),
    no: rsvps.rows.length - yes.length,
    reserved: live.length,
    pending: live.filter((x: any) => x.status === 'pending').length,
    value: live.reduce((n: number, x: any) => n + (prices[x.item_id] || 0), 0),
  })
}
