'use client'
import { useState } from 'react'

export default function ResetPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    const token = new URLSearchParams(window.location.search).get('token') || ''
    const response = await fetch('/api/admin/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    const body = await response.json(); setBusy(false)
    if (!response.ok) return setError(body.error || 'Unable to reset password.')
    setDone(true)
  }

  return <main className="min-h-screen flex items-center justify-center bg-[#173f3b] p-5">
    <form onSubmit={submit} className="w-full max-w-md bg-[#f8f5ef] p-7 md:p-9 rounded-[4px]">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#a07955]">Account recovery</p>
      <h1 className="mt-2 font-display text-5xl text-[#173f3b]">Reset password</h1>
      {done ? <><p className="mt-5 text-sm text-[#65706d]">Your password has been updated.</p><a className="btn w-full mt-6" href="/admin/login">Return to sign in</a></> : <>
        <input className="inp mt-7" type="password" minLength={8} placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required />
        <input className="inp mt-3" type="password" minLength={8} placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <button className="btn w-full mt-6" disabled={busy}>{busy ? 'Updating…' : 'Set new password'}</button>
      </>}
    </form>
  </main>
}
