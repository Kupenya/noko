import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/postgres'
import { COOKIE_NAME, createSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const result = await query('select id from admins limit 1')
  return NextResponse.json({ setup: result.rows.length === 0 })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const existing = await query('select id from admins limit 1')
    if (existing.rows.length) {
      return NextResponse.json({ error: 'An admin account already exists.' }, { status: 403 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await query('insert into admins (email,password_hash) values ($1,$2)', [email, passwordHash])

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, createSession(email), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unable to create the admin account.' }, { status: 500 })
  }
}
