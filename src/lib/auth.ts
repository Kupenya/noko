import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'wedding_admin'

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET
  if (!value) throw new Error('Missing ADMIN_SESSION_SECRET')
  return value
}

export function createSession(email: string) {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), expires })).toString('base64url')
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifySession(token: string | undefined) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, signature] = parts
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!value.email || value.expires < Date.now()) return null
    return value.email as string
  } catch {
    return null
  }
}

export function getAdminEmail() {
  return verifySession(cookies().get(COOKIE_NAME)?.value)
}

export async function requireAdmin() {
  return getAdminEmail()
}

export { COOKIE_NAME }
