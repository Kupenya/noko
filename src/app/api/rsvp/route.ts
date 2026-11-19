import { NextResponse } from 'next/server'
import { query } from '@/lib/postgres'
import { sendThanks } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const b = await req.json()
  const name = String(b.name || '').trim()
  const email = String(b.email || '').trim().toLowerCase()
  const code = String(b.code || '').trim().toUpperCase()

  if (!code) return NextResponse.json({ error: 'Enter your invitation code.' }, { status: 400 })

  const invitationResult = await query('select * from invitations where upper(code)=upper($1)', [code])
  const invitation = invitationResult.rows[0]
  if (!invitation) return NextResponse.json({ error: 'This invitation code is invalid.' }, { status: 404 })
  if (invitation.status === 'revoked') return NextResponse.json({ error: 'This invitation has been revoked.' }, { status: 403 })
  if (invitation.expires_at && new Date(invitation.expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'The RSVP deadline has passed.' }, { status: 403 })

  if (invitation.status === 'used') {
    return NextResponse.json({ error: 'This invitation has already submitted an RSVP and cannot be used again.' }, { status: 409 })
  }

  const rsvpId = await query(`
    insert into rsvps (name,email,attending,guests,dietary,message,invitation_id,updated_at)
    values ($1,$2,$3,$4,$5,$6,$7,now())
    returning id
  `, [
    name,
    email,
    !!b.attending,
    b.attending ? Math.min(Math.max(Number(b.guests) || 1, 1), Math.min(invitation.allowed_guests || 10, 10)) : 0,
    String(b.dietary || '').trim() || null,
    String(b.message || '').trim() || null,
    invitation.id,
  ])

  await query('update invitations set status=\'used\', rsvp_id=$1 where id=$2', [rsvpId.rows[0].id, invitation.id])

  const settings = await query('select couple_names from site_settings where id=$1', [1])
  try {
    await sendThanks(email, name, !!b.attending, settings.rows[0]?.couple_names || 'The Couple')
  } catch {}

  return NextResponse.json({ ok: true, rsvpId: rsvpId.rows[0].id })
}
