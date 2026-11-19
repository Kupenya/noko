'use client'
import { useState } from 'react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [approvalCode, setApprovalCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    const response = await fetch('/api/admin/signup-public', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, approvalCode }) })
    const body = await response.json(); setBusy(false)
    if (!response.ok) return setError(body.error || 'Unable to create account.')
    window.location.href = '/admin/login'
  }

  return <main className="min-h-screen flex items-center justify-center bg-[#173f3b] p-5">
    <form onSubmit={submit} className="w-full max-w-sm bg-[#f8f5ef] p-7 md:p-9 rounded-[4px]">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#a07955]">New administrator</p>
      <h1 className="mt-2 font-display text-5xl text-[#173f3b]">Create account</h1>
      <input className="inp mt-7" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
      <input className="inp mt-3" type="password" minLength={8} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <input className="inp mt-3" type="password" minLength={8} placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      <input className="inp mt-3" type="text" placeholder="Approval code" value={approvalCode} onChange={e => setApprovalCode(e.target.value)} required />
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <button className="btn w-full mt-6" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      <a className="block mt-5 text-center text-xs underline text-[#65706d]" href="/admin/login">Back to sign in</a>
    </form>
  </main>
}
