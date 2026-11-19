import { NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { getAdminEmail } from '@/lib/auth'

const allowed = new Set(['site_settings','site_sections','custom_sections','story_sections','events','color_palette','registry_items','gallery_images','faqs','rsvps','reservations'])

export async function GET(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const table = new URL(req.url).searchParams.get('table')
  if (!table || !allowed.has(table)) return NextResponse.json({ error: 'Invalid table.' }, { status: 400 })
  const order = table === 'site_settings' ? 'id'
    : ['story_sections','events','color_palette','registry_items','gallery_images','faqs','site_sections','custom_sections'].includes(table) ? 'position'
    : 'created_at'
  const result = await query(`select * from ${table} order by ${order} asc nulls first`)
  return NextResponse.json({ rows: result.rows })
}

export async function POST(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const table = body.table
  if (!allowed.has(table)) return NextResponse.json({ error: 'Invalid table.' }, { status: 400 })
  const data = body.data || {}
  delete data.id; delete data.created_at; delete data.updated_at

  if (table === 'site_settings') {
    data.id = 1
    for (const key of Object.keys(data)) {
      if (key === 'wedding_date' && data[key]) {
        const match = /^\d{4}-\d{2}-\d{2}/.exec(String(data[key]))
        data[key] = match ? match[0] : null
      }
    }
    const keys = Object.keys(data)
    const values = Object.values(data)
    const set = keys.map((key, i) => `${key}=$${i + 1}`).join(',')
    const result = await query(`update site_settings set ${set},updated_at=now() where id=1 returning id`, values)
    return NextResponse.json({ rows: result.rows })
  }

  const keys = Object.keys(data)
  if (!keys.length) return NextResponse.json({ error: 'No values.' }, { status: 400 })
  const values = Object.values(data)
  const columns = keys.join(',')
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(',')
  const result = await query(`insert into ${table} (${columns}) values (${placeholders}) returning *`, values)
  return NextResponse.json({ rows: result.rows })
}

export async function PUT(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const table = body.table
  const id = Number(body.id)
  if (!allowed.has(table) || !Number.isInteger(id)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const data = body.data || {}
  delete data.id; delete data.created_at; delete data.updated_at
  const keys = Object.keys(data)
  const values = Object.values(data)
  const set = keys.map((key, i) => `${key}=$${i + 1}`).join(',')
  const result = await query(`update ${table} set ${set} where id=$${keys.length + 1} returning id`, [...values, id])
  return NextResponse.json({ rows: result.rows })
}

export async function DELETE(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const table = body.table
  const id = Number(body.id)
  if (!allowed.has(table) || !Number.isInteger(id)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  await query(`delete from ${table} where id=$1`, [id])
  return NextResponse.json({ ok: true })
}
