import { NextResponse } from 'next/server'
import { getAdminEmail } from '@/lib/auth'

export async function GET() {
  const email = getAdminEmail()
  return email ? NextResponse.json({ email }) : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
