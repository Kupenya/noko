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

  if (invitation.status === 'used' && invitation.rsvp_id) {
    const ownRsvp = await query('select id,email from rsvps where id=$1', [invitation.rsvp_id])
    if (ownRsvp.rows[0]?.email !== email) return NextResponse.json({ error: 'This invitation has already submitted an RSVP.' }, { status: 409 })
  }
  if (invitation.status === 'used' && !invitation.rsvp_id) {
    return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 409 })
  }

  const rsvpId = await query(`
    insert into rsvps (name,email,attending,guests,dietary,message,updated_at)
    values ($1,$2,$3,$4,$5,$6,now())
    on conflict (email) do update set
      name=excluded.name,
      attending=excluded.attending,
      guests=excluded.guests,
      dietary=excluded.dietary,
      message=excluded.message,
      updated_at=now()
    returning id
  `, [
    name,
    email,
    !!b.attending,
    b.attending ? Math.min(Math.max(Number(b.guests) || 1, 1), 10) : 0,
    String(b.dietary || '').trim() || null,
    String(b.message || '').trim() || null,
  ])

  await query('update invitations set status=\'used\', rsvp_id=$1 where id=$2', [rsvpId.rows[0].id, invitation.id])

  const settings = await query('select couple_names from site_settings where id=$1', [1])
  try {
    await sendThanks(email, name, !!b.attending, settings.rows[0]?.couple_names || 'The Couple')
  } catch {}

  return NextResponse.json({ ok: true, rsvpId: rsvpId.rows[0].id })
}
