'use client'
import { useEffect, useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [setup, setSetup] = useState(true); const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  useEffect(() => {
    ;(async () => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)
        const response = await fetch('/api/admin/signup', { signal: controller.signal, cache: 'no-store' })
        clearTimeout(timeout)
        const body = await response.json()
        setSetup(body.setup === true)
      } catch {
        setSetup(true)
      }
    })()
  }, [])
  async function createAdmin(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (password !== confirm) return setErr('Passwords do not match.')
    setBusy(true)
    const response = await fetch('/api/admin/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), })
    const body = await response.json()
    setBusy(false)
    if (!response.ok) return setErr(body.error || 'Could not create the admin account.')
    window.location.href = '/admin'
  }
  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const body = await response.json()
    setBusy(false)
    if (!response.ok) setErr(body.error || 'Invalid email or password.')
    else window.location.href = '/admin'
  }
  return (
    <main className="min-h-screen bg-[#173f3b] grid lg:grid-cols-[1.15fr_.85fr]">
      <section className="relative hidden lg:flex items-center justify-center overflow-hidden border-r border-white/10 px-16 text-[#f8f5ef]">
        <div className="absolute inset-6 border border-white/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/10" />
        <div className="relative text-center max-w-lg">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[#d7c1a5]">Wedding administration</p>
          <h1 className="mt-6 font-display text-7xl leading-[.9]">Curate every beautiful detail.</h1>
          <p className="mt-8 text-sm leading-7 text-white/65">A private place to manage your celebration, guests and registry.</p>
        </div>
      </section>
      <section className="min-h-screen flex items-center justify-center p-6 lg:bg-[#f8f5ef] lg:text-[#1d2928]">
        <form onSubmit={setup ? createAdmin : signIn} className="w-full max-w-sm bg-[#f8f5ef] lg:bg-transparent p-8 lg:p-0 rounded-[4px] lg:rounded-none">
          <a href="/" className="font-display text-2xl text-[#173f3b]">Our Wedding</a>
          <p className="mt-10 text-[10px] uppercase tracking-[0.28em] text-[#a07955]">Private access</p>
          <h2 className="mt-3 font-display text-5xl text-[#173f3b]">{setup ? 'Create admin' : 'Welcome back'}</h2>
          {setup && <p className="mt-4 text-sm leading-6 text-[#65706d]">Create the first administrator account. It will be secured automatically.</p>}
          <div className="mt-8 space-y-4">
            <label><span className="text-[10px] uppercase tracking-[0.16em] text-[#65706d]">Email address</span><input className="inp mt-2" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></label>
            <label><span className="text-[10px] uppercase tracking-[0.16em] text-[#65706d]">Password</span><input className="inp mt-2" type="password" minLength={setup ? 8 : undefined} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></label>
            {setup && <label><span className="text-[10px] uppercase tracking-[0.16em] text-[#65706d]">Confirm password</span><input className="inp mt-2" type="password" minLength={8} placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required /></label>}
          </div>
          {err && <p className="mt-4 text-sm text-red-700">{err}</p>}
          <button className="btn w-full mt-6" disabled={busy}>{busy ? 'Please wait…' : setup ? 'Create account' : 'Enter dashboard'}</button>
          {!setup && <div className="mt-5 flex items-center justify-between gap-4 text-xs text-[#65706d]"><button type="button" onClick={async () => { if (!email) return setErr('Enter your email first.'); await fetch('/api/admin/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); setErr('If the account exists, a reset link has been sent.') }} className="underline underline-offset-4">Forgot password?</button><a href="/admin/signup" className="underline underline-offset-4">Create account</a></div>}
          <a href="/" className="block text-center mt-5 text-xs text-[#65706d] underline underline-offset-4">Return to wedding website</a>
        </form>
      </section>
    </main>)
}
