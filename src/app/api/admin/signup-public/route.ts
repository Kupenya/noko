import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/postgres'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })

    const approvalCode = String(body.approvalCode || '').trim()
    if (!approvalCode || approvalCode !== process.env.ADMIN_SIGNUP_CODE) {
      return NextResponse.json({ error: 'A valid signup code is required.' }, { status: 403 })
    }

    const existing = await query('select id from admins where email=$1', [email])
    if (existing.rows.length) return NextResponse.json({ error: 'This account already exists.' }, { status: 409 })

    const hash = await bcrypt.hash(password, 12)
    await query('insert into admins (email,password_hash) values ($1,$2)', [email, hash])
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to create account.' }, { status: 500 })
  }
}
