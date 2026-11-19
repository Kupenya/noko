import { NextResponse } from 'next/server'
import { query } from '@/lib/postgres'

export async function POST(req: Request) {
  const body = await req.json()
  const code = String(body.code || '').trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Enter your invitation code.' }, { status: 400 })

  const result = await query(`select household_name,allowed_guests,status,expires_at,rsvp_id from invitations where upper(code)=upper($1)`, [code])
  const invitation = result.rows[0]
  if (!invitation) return NextResponse.json({ error: 'This invitation code is invalid.' }, { status: 404 })
  if (invitation.status === 'revoked') return NextResponse.json({ error: 'This invitation has been revoked.' }, { status: 403 })
  if (invitation.expires_at && new Date(invitation.expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'The RSVP deadline has passed.' }, { status: 403 })
  if (invitation.status === 'used' && invitation.rsvp_id) {
    const rsvp = await query('select attending,guests,dietary,message,name,email from rsvps where id=$1', [invitation.rsvp_id])
    return NextResponse.json({ valid: true, householdName: invitation.household_name, allowedGuests: invitation.allowed_guests, submitted: true, rsvp: rsvp.rows[0] || null })
  }
  return NextResponse.json({ valid: true, householdName: invitation.household_name, allowedGuests: invitation.allowed_guests, submitted: false })
}
