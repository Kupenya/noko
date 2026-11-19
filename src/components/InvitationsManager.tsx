'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

export default function InvitationsManager() {
  const [rows, setRows] = useState<any[]>([])
  const [householdName, setHouseholdName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [allowedGuests, setAllowedGuests] = useState(1)
  const [expiresAt, setExpiresAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ title: string; text: string } | null>(null)

  async function load() {
    const r = await fetch('/api/admin/invitations')
    if (r.ok) setRows((await r.json()).rows || [])
  }

  useEffect(() => { load() }, [])

  async function createInvitation() {
    setBusy(true)
    const r = await fetch('/api/admin/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ householdName, email, phone, allowedGuests, expiresAt: expiresAt || null }) })
    const b = await r.json(); setBusy(false)
    if (!r.ok) return setMessage({ title: 'Could not create invitation', text: b.error || 'Please try again.' })
    setHouseholdName(''); setEmail(''); setPhone(''); setAllowedGuests(1); setExpiresAt('')
    await load()
    setMessage({ title: 'Invitation created', text: `Unique code: ${b.invitation.code}` })
  }

  async function revoke(row: any) {
    await fetch('/api/admin/invitations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, status: 'revoked' }) })
    await load()
  }

  function invitationUrl(code: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/#rsvp?code=${encodeURIComponent(code)}`
  }

  function share(row: any) {
    const url = invitationUrl(row.code)
    const text = `Hello ${row.household_name}, please RSVP using your invitation: ${url}`
    window.open(`https://wa.me/${String(row.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="bg-[#fffdfa] border border-[#173f3b]/10 p-5 md:p-6 rounded-[4px]">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#a07955]">Create invitation</p>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <label><span className="text-xs text-[#65706d]">Guest or household name</span><input className="inp mt-2" value={householdName} onChange={e => setHouseholdName(e.target.value)} placeholder="Family or guest name" /></label>
          <label><span className="text-xs text-[#65706d]">Allowed guests</span><input className="inp mt-2" type="number" min={1} max={10} value={allowedGuests} onChange={e => setAllowedGuests(Number(e.target.value))} /></label>
          <label><span className="text-xs text-[#65706d]">Email (optional)</span><input className="inp mt-2" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="guest@example.com" /></label>
          <label><span className="text-xs text-[#65706d]">WhatsApp number (optional)</span><input className="inp mt-2" value={phone} onChange={e => setPhone(e.target.value)} placeholder="2348012345678" /></label>
          <label className="md:col-span-2"><span className="text-xs text-[#65706d]">RSVP deadline (optional)</span><input className="inp mt-2" type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} /></label>
        </div>
        <button className="btn mt-5" disabled={busy} onClick={createInvitation}>{busy ? 'Creating…' : 'Generate invitation'}</button>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map(row => (
          <article key={row.id} className="bg-[#fffdfa] border border-[#173f3b]/10 p-4 rounded-[4px] flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1"><p className="font-display text-xl text-[#173f3b]">{row.household_name}</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#a07955]">Code {row.code} · {row.allowed_guests} guest{row.allowed_guests > 1 ? 's' : ''}</p><p className="mt-2 text-xs text-[#65706d]">Status: {row.status}</p></div>
            <div className="flex gap-2">
              <button className="min-h-10 px-4 rounded-full border border-[#173f3b]/15 text-xs" onClick={() => { navigator.clipboard?.writeText(invitationUrl(row.code)); setMessage({ title: 'Link copied', text: 'The personalized invitation link is ready to send.' }) }}>Copy link</button>
              {row.phone && <button className="min-h-10 px-4 rounded-full bg-[#173f3b] text-white text-xs" onClick={() => share(row)}>WhatsApp</button>}
              {row.status === 'active' && <button className="min-h-10 px-4 rounded-full border border-red-700/20 text-red-700 text-xs" onClick={() => revoke(row)}>Revoke</button>}
            </div>
          </article>
        ))}
        {!rows.length && <p className="text-center text-sm text-[#65706d] py-10">No invitations created yet.</p>}
      </div>

      {message && <Modal open title={message.title} message={message.text} confirmLabel="Done" onClose={() => setMessage(null)} />}
    </div>
  )
}
