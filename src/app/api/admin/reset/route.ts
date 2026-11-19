import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { query } from '@/lib/postgres'

export async function POST(req: Request) {
  const body = await req.json()
  const token = String(body.token || '')
  const password = String(body.password || '')
  if (!token) return NextResponse.json({ error: 'Missing reset link.' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })

  const hash = createHash('sha256').update(token).digest('hex')
  const reset = await query("select email from password_reset_tokens where token_hash=$1 and used_at is null and expires_at>now()", [hash])
  if (!reset.rows.length) return NextResponse.json({ error: 'This reset link is invalid or expired.' }, { status: 400 })

  const email = reset.rows[0].email
  const passwordHash = await bcrypt.hash(password, 12)
  await query('update admins set password_hash=$1 where email=$2', [passwordHash, email])
  await query('update password_reset_tokens set used_at=now() where token_hash=$1', [hash])
  return NextResponse.json({ ok: true })
}
