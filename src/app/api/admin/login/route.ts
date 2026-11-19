import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/postgres'
import { COOKIE_NAME, createSession } from '@/lib/auth'

export async function POST(req: Request) {
  const body = await req.json()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })

  const result = await query('select email,password_hash from admins where email=$1', [email])
  const admin = result.rows[0]
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, createSession(email), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60,
  })
  return response
}
