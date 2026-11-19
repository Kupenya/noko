'use client'

import { useState } from 'react'

export default function MobileNav({ title, items }: { title: string; items: { title: string; id: string }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="sm:hidden w-10 h-10 rounded-full border border-[#173f3b]/15 flex flex-col items-center justify-center gap-1"
      >
        <span className={`block w-4 h-px bg-current transition-transform ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
        <span className={`block w-4 h-px bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-4 h-px bg-current transition-transform ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
      </button>

      {open && <div className="sm:hidden fixed inset-x-4 top-[72px] z-50 rounded-[4px] border border-[#173f3b]/10 bg-[#fffdfa] p-3 shadow-[0_20px_60px_rgba(23,63,59,.18)]">
        <p className="px-3 py-2 font-display text-xl text-[#173f3b]">{title}</p>
        <div className="grid gap-1">
          {items.map(item => <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)} className="px-3 py-3 rounded-[3px] text-xs uppercase tracking-[0.16em] text-[#65706d] hover:bg-[#edf1ec]">{item.title}</a>)}
          <a href="#registry" onClick={() => setOpen(false)} className="mt-1 px-3 py-3 rounded-[3px] bg-[#173f3b] text-center text-xs uppercase tracking-[0.16em] text-white">Gift Registry</a>
        </div>
      </div>}
    </>
  )
}
