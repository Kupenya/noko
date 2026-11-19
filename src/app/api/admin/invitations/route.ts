import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { query } from '@/lib/postgres'
import { getAdminEmail } from '@/lib/auth'

function generateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(8)
  let code = ''
  for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length]
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

export async function GET() {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await query('select * from invitations order by created_at desc')
  return NextResponse.json({ rows: result.rows })
}

export async function POST(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const householdName = String(body.householdName || '').trim()
  const email = String(body.email || '').trim().toLowerCase() || null
  const phone = String(body.phone || '').trim() || null
  const allowedGuests = Math.min(Math.max(Number(body.allowedGuests) || 1, 1), 10)
  if (!householdName) return NextResponse.json({ error: 'Guest or household name is required.' }, { status: 400 })

  let code = generateCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const result = await query(`insert into invitations (code,household_name,email,phone,allowed_guests,expires_at) values ($1,$2,$3,$4,$5,$6) returning *`, [code, householdName, email, phone, allowedGuests, body.expiresAt || null])
      return NextResponse.json({ invitation: result.rows[0] })
    } catch (error: any) {
      if (error.code !== '23505') throw error
      code = generateCode()
    }
  }
  return NextResponse.json({ error: 'Could not generate a unique code.' }, { status: 500 })
}

export async function PUT(req: Request) {
  if (!getAdminEmail()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const id = Number(body.id)
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid invitation.' }, { status: 400 })
  await query('update invitations set status=$1,used_at=case when $1=$2 then coalesce(used_at,now()) else used_at end where id=$3', [body.status || 'revoked', 'used', id])
  const result = await query('select * from invitations where id=$1', [id])
  return NextResponse.json({ invitation: result.rows[0] })
}
