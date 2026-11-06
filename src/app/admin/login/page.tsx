'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState('')
  async function go(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr(error.message); else location.href = '/admin'
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-teal p-4">
      <form onSubmit={go} className="bg-cream p-8 rounded-md w-full max-w-sm space-y-4">
        <h1 className="font-display text-3xl text-teal">Admin sign in</h1>
        <input className="inp" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="inp" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {err && <p className="text-red-700 text-sm">{err}</p>}
        <button className="btn w-full">Sign in</button>
      </form>
    </main>)
}
