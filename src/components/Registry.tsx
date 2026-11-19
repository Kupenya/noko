'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Registry({ items, reservations, settings }: any) {
  const [open, setOpen] = useState<any>(null)
  const [name, setName] = useState('')
  const [anon, setAnon] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const money = (n: number) => `${settings.currency || '₦'}${Number(n).toLocaleString()}`
  const who = (id: number) => reservations.filter((r: any) => r.item_id === id).map((r: any) => r.display_name)
  const close = () => { setOpen(null); setMsg(''); setName(''); setAnon(false) }

  async function paid() {
    setBusy(true); setMsg('')
    const r = await fetch('/api/reserve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: open.id, name, anonymous: anon }) })
    setBusy(false)
    if (r.ok) { setMsg('Thank you. Your thoughtful gift has been reserved.'); router.refresh() }
    else setMsg((await r.json()).error || 'Unable to reserve this gift.')
  }

  const copy = async () => {
    if (settings.account_number) await navigator.clipboard?.writeText(settings.account_number)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  if (!items.length) return <p className="text-center font-display text-2xl text-[#6d746f]">The registry will be revealed soon.</p>

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
        {items.map((i: any) => {
          const names = who(i.id)
          return (
            <button key={i.id} onClick={() => setOpen(i)} className="group text-left bg-[#fffdfa] rounded-[3px] overflow-hidden border border-[#173f3b]/10 shadow-[0_12px_40px_rgba(45,70,62,.06)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(45,70,62,.12)] transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e8ebe4]">
                {i.image ? <img src={i.image} alt={i.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" /> : <div className="w-full h-full flex items-center justify-center text-[#173f3b]/25 font-display text-6xl">{i.name?.charAt(0)}</div>}
                {names.length > 0 && <span className="absolute left-4 bottom-4 rounded-full bg-[#173f3b] px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-white shadow-lg">Reserved by {names[0]}{names.length > 1 ? ` +${names.length - 1}` : ''}</span>}
              </div>
              <div className="p-5 md:p-6"><p className="font-display text-2xl text-[#173f3b]">{i.name}</p><p className="mt-2 text-[#a07955] text-sm uppercase tracking-[0.12em]">{money(i.price)}</p></div>
            </button>
          )
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-[#102d29]/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-5" onClick={close}>
          <div role="dialog" aria-modal="true" className="bg-[#f8f5ef] rounded-t-[24px] md:rounded-[4px] max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {open.image && <img src={open.image} alt={open.name} className="w-full h-52 object-cover" />}
            <div className="p-6 md:p-8">
              <button onClick={close} className="float-right w-9 h-9 rounded-full border border-[#173f3b]/15 text-[#173f3b] hover:bg-[#173f3b] hover:text-white transition-colors" aria-label="Close">×</button>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#a07955] mb-2">Selected gift</p>
              <h3 className="font-display text-4xl text-[#173f3b] pr-12">{open.name}</h3>
              <p className="mt-2 text-[#a07955]">{money(open.price)}</p>
              {open.description && <p className="mt-4 text-sm leading-7 text-[#65706d]">{open.description}</p>}

              <div className="bg-[#173f3b] text-[#f8f5ef] rounded-[3px] p-5 mt-6">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#d8c6af]">Send payment to</p>
                <p className="mt-3 font-display text-xl">{settings.bank_name}</p>
                <p className="text-sm text-white/75 mt-1">{settings.account_name}</p>
                <p className="mt-3 flex items-center justify-between text-lg tracking-wider"><span>{settings.account_number}</span><button onClick={copy} className="text-[10px] uppercase tracking-[0.16em] underline underline-offset-4">{copied ? 'Copied' : 'Copy'}</button></p>
              </div>

              {msg.startsWith('Thank') ? <><p className="mt-6 text-center text-[#173f3b] font-display text-xl">{msg}</p><button className="btn mt-6 w-full" onClick={close}>Close</button></> : <>
                <label className="block mt-6"><span className="text-xs uppercase tracking-[0.14em] text-[#65706d]">Your name</span><input className="inp mt-2" placeholder="Name shown to the couple" disabled={anon} value={name} onChange={e => setName(e.target.value)} /></label>
                <label className="flex items-center gap-3 mt-4 text-sm text-[#65706d]"><input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} className="accent-[#173f3b]" /> Keep my name anonymous</label>
                {msg && <p className="text-red-700 text-sm mt-3">{msg}</p>}
                <button className="btn w-full mt-5" disabled={busy} onClick={paid}>{busy ? 'Recording…' : who(open.id).length ? "I've sent my contribution" : "I've paid"}</button>
                <p className="text-[11px] text-[#8b8d86] text-center mt-3">Tap this after your transfer has been sent.</p>
              </>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
