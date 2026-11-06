'use client'
import { useState } from 'react'
export default function RsvpForm() {
  const [f, setF] = useState<any>({ name: '', email: '', attending: true, guests: 1, dietary: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')
  const set = (k: string, v: any) => setF({ ...f, [k]: v })
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState('sending'); setErr('')
    const r = await fetch('/api/rsvp', { method: 'POST', body: JSON.stringify(f) })
    if (r.ok) setState('done'); else { setErr((await r.json()).error || 'Something went wrong. Please try again.'); setState('idle') }
  }
  if (state === 'done') return <p className="text-center text-xl text-teal">Thank you, {f.name}! A confirmation is on its way to {f.email}.</p>
  return (
    <form onSubmit={submit} className="max-w-xl mx-auto space-y-4">
      <input className="inp" placeholder="Full name" required value={f.name} onChange={e => set('name', e.target.value)} />
      <input className="inp" type="email" placeholder="Email" required value={f.email} onChange={e => set('email', e.target.value)} />
      <div className="flex gap-3">
        {[true, false].map(v => <button type="button" key={String(v)} onClick={() => set('attending', v)}
          className={`flex-1 py-3 rounded-md border ${f.attending === v ? 'bg-teal text-white border-teal' : 'bg-white border-taupe/30'}`}>{v ? 'Joyfully accept' : 'Regretfully decline'}</button>)}
      </div>
      {f.attending && <>
        <label className="block text-sm">Number of guests (including you)<input className="inp mt-1" type="number" min={1} max={10} value={f.guests} onChange={e => set('guests', e.target.value)} /></label>
        <input className="inp" placeholder="Dietary needs (optional)" value={f.dietary} onChange={e => set('dietary', e.target.value)} />
      </>}
      <textarea className="inp" rows={3} placeholder="A message for the couple (optional)" value={f.message} onChange={e => set('message', e.target.value)} />
      {err && <p className="text-red-700 text-sm">{err}</p>}
      <button className="btn w-full" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send RSVP'}</button>
    </form>)
}
