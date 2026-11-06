'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function Registry({ items, reservations, settings }: any) {
  const [open, setOpen] = useState<any>(null)
  const [name, setName] = useState(''); const [anon, setAnon] = useState(false)
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const [copied, setCopied] = useState(false)
  const router = useRouter()
  const money = (n: number) => `${settings.currency || '₦'}${Number(n).toLocaleString()}`
  const who = (id: number) => reservations.filter((r: any) => r.item_id === id).map((r: any) => r.display_name)
  const close = () => { setOpen(null); setMsg(''); setName(''); setAnon(false) }
  async function paid() {
    setBusy(true); setMsg('')
    const r = await fetch('/api/reserve', { method: 'POST', body: JSON.stringify({ item_id: open.id, name, anonymous: anon }) })
    setBusy(false)
    if (r.ok) { setMsg('Thank you! Your gift has been marked as reserved.'); router.refresh() } else setMsg((await r.json()).error)
  }
  const copy = () => { navigator.clipboard.writeText(settings.account_number || ''); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (<>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
      {items.map((i: any) => { const w = who(i.id); return (
        <button key={i.id} onClick={() => setOpen(i)} className="text-left bg-white rounded-md overflow-hidden border border-taupe/20 hover:border-copper">
          <div className="relative aspect-square bg-mint/30">
            {i.image && <img src={i.image} alt={i.name} className="w-full h-full object-cover" />}
            {w.length > 0 && <span className="absolute inset-x-0 bottom-0 bg-purple/90 text-white text-sm text-center py-1.5">Reserved by {w[0]}{w.length > 1 ? ` +${w.length - 1}` : ''}</span>}
          </div>
          <div className="p-3"><p className="font-medium">{i.name}</p><p className="text-copper">{money(i.price)}</p></div>
        </button>) })}
    </div>
    {open && (
      <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center p-4" onClick={close}>
        <div role="dialog" className="bg-cream rounded-md max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h3 className="font-display text-3xl text-teal">{open.name}</h3>
          <p className="text-copper text-xl">{money(open.price)}</p>
          <p className="text-sm mt-1">{open.description}</p>
          <div className="bg-white rounded-md p-4 mt-4 text-sm space-y-1">
            <p className="font-medium">Send payment to</p>
            <p>{settings.bank_name}</p><p>{settings.account_name}</p>
            <p className="text-lg tracking-wider">{settings.account_number} <button onClick={copy} className="ml-2 text-xs underline text-teal">{copied ? 'Copied' : 'Copy'}</button></p>
          </div>
          {msg.startsWith('Thank') ? <><p className="mt-4 text-teal">{msg}</p><button className="btn mt-4 w-full" onClick={close}>Close</button></> : <>
            <input className="inp mt-4" placeholder="Your name" disabled={anon} value={name} onChange={e => setName(e.target.value)} />
            <label className="flex items-center gap-2 mt-3 text-sm"><input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />Keep my name anonymous</label>
            {msg && <p className="text-red-700 text-sm mt-2">{msg}</p>}
            <button className="btn w-full mt-4" disabled={busy} onClick={paid}>{who(open.id).length ? "Reserve again. I've paid" : "I've paid"}</button>
            <p className="text-xs text-taupe mt-2">Tap this only after you have sent the money.</p>
          </>}
        </div>
      </div>)}
  </>)
}
