'use client'
import { useEffect, useState } from 'react'
import Editor, { Col } from '@/components/Editor'
import SectionManager from '@/components/SectionManager'

const T: Col['type'] = 'text'
const tabs: Record<string, { cols: Col[]; single?: boolean; noAdd?: boolean; csv?: boolean }> = {
  Settings: { table: 'site_settings', single: true, cols: [
    { key: 'couple_names', label: 'Couple names' }, { key: 'tagline', label: 'Tagline' }, { key: 'wedding_date', label: 'Wedding date', type: 'date' },
    { key: 'venue', label: 'Main venue' }, { key: 'hero_image', label: 'Hero image', type: 'image' }, { key: 'currency', label: 'Currency symbol' },
    { key: 'bank_name', label: 'Bank name' }, { key: 'account_name', label: 'Account name' }, { key: 'account_number', label: 'Account number' },
    { key: 'dress_code', label: 'Dress code note', type: 'textarea' }, { key: 'music_url', label: 'Wedding music (MP3 or audio file)', type: 'audio' },
    { key: 'primary_color', label: 'Primary wedding color', type: 'color' }, { key: 'accent_color', label: 'Accent / gold color', type: 'color' },
    { key: 'sage_color', label: 'Soft section color', type: 'color' }, { key: 'cream_color', label: 'Page background color', type: 'color' }] },
  Story: { table: 'story_sections', cols: [{ key: 'position', label: 'Order', type: 'number' }, { key: 'title', label: 'Title' }, { key: 'body', label: 'Text', type: 'textarea' }, { key: 'image', label: 'Photo', type: 'image' }] },
  Schedule: { table: 'events', cols: [{ key: 'position', label: 'Order', type: 'number' }, { key: 'title', label: 'Event' }, { key: 'event_date', label: 'Date', type: 'date' }, { key: 'start_time', label: 'Time' }, { key: 'venue', label: 'Venue' }, { key: 'map_url', label: 'Map link' }, { key: 'description', label: 'Details', type: 'textarea' }] },
  'Section Manager': { table: 'site_sections', noAdd: true, cols: [] },
  Colours: { table: 'color_palette', cols: [{ key: 'position', label: 'Order', type: 'number' }, { key: 'role', label: 'Who' }, { key: 'name', label: 'Colour name' }, { key: 'hex', label: 'Hex code (e.g. #9CAF88)' }, { key: 'note', label: 'Note' }] },
  RSVPs: { table: 'rsvps', noAdd: true, csv: true, cols: [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'attending', label: 'Attending', type: 'bool' }, { key: 'guests', label: 'Guests', type: 'number' }, { key: 'dietary', label: 'Dietary' }, { key: 'message', label: 'Message', type: 'textarea' }] },
  Registry: { table: 'registry_items', cols: [{ key: 'position', label: 'Order', type: 'number' }, { key: 'name', label: 'Item' }, { key: 'price', label: 'Price', type: 'number' }, { key: 'description', label: 'Description' }, { key: 'image', label: 'Image', type: 'image' }] },
  Reservations: { table: 'reservations', noAdd: true, csv: true, cols: [{ key: 'item_id', label: 'Item ID', readonly: true }, { key: 'guest_name', label: 'Real name (private)' }, { key: 'display_name', label: 'Name shown publicly' }, { key: 'status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'removed'] }] },
  Gallery: { table: 'gallery_images', cols: [{ key: 'position', label: 'Order', type: 'number' }, { key: 'image', label: 'Photo', type: 'image' }, { key: 'caption', label: 'Caption' }] },
  FAQ: { table: 'faqs', cols: [{ key: 'position', label: 'Order', type: 'number' }, { key: 'question', label: 'Question' }, { key: 'answer', label: 'Answer', type: 'textarea' }] },
} as any

export default function Admin() {
  const [ok, setOk] = useState<boolean | null>(null)
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState<any>({})
  useEffect(() => { (async () => {
    const me = await fetch('/api/admin/me')
    if (me.status === 401) return (window.location.href = '/admin/login')
    if (!me.ok) { setOk(false); return }
    setOk(true)
    const response = await fetch('/api/admin/stats')
    if (response.ok) setStats(await response.json())
  })() }, [])
  if (ok === null) return <p className="p-8">Loading…</p>
  if (!ok) return <p className="p-8">This account is not authorized. <button className="underline" onClick={() => fetch('/api/admin/logout', { method: 'POST' }).then(() => location.href = '/admin/login')}>Sign out</button></p>
  const cfg: any = tabs[tab]
  const card = (l: string, v: any) => <div className="bg-[#fffdfa] p-5 md:p-6 rounded-[3px] border border-[#173f3b]/10 border-t-2 border-t-[#b38a62] shadow-[0_10px_30px_rgba(45,70,62,.05)]"><p className="text-4xl md:text-5xl font-display text-[#173f3b]">{v ?? 0}</p><p className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.12em] text-[#7a7d76]">{l}</p></div>
  return (
    <div className="min-h-screen md:flex bg-[#f8f5ef]">
      <aside className="bg-[#173f3b] text-[#f8f5ef] md:w-64 md:min-h-screen p-4 md:p-6 flex md:flex-col gap-1 overflow-x-auto md:sticky md:top-0 md:h-screen">
        <div className="hidden md:block mb-8"><p className="text-[9px] uppercase tracking-[0.28em] text-[#d7c1a5]">Private suite</p><p className="font-display text-3xl mt-2">Wedding</p></div>
        <div className="flex md:flex-col gap-1">
          {['Overview', ...Object.keys(tabs)].map(t => <button key={t} onClick={() => setTab(t)} className={`text-left px-3 py-2.5 rounded-[3px] whitespace-nowrap text-xs md:text-sm transition-colors ${tab === t ? 'bg-[#f8f5ef] text-[#173f3b]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>{t}</button>)}
        </div>
        <div className="hidden md:flex mt-auto flex-col gap-1">
          <a href="/" className="px-3 py-2.5 text-sm text-white/70 hover:text-white">View website</a>
          <button className="text-left px-3 py-2.5 text-sm text-white/70 hover:text-white" onClick={() => fetch('/api/admin/logout', { method: 'POST' }).then(() => location.href = '/admin/login')}>Sign out</button>
        </div>
      </aside>
      <main className="flex-1 p-5 md:p-10 lg:p-12 min-w-0">
        <div className="max-w-5xl mx-auto">
          <header className="flex items-end justify-between mb-8">
            <div><p className="text-[9px] uppercase tracking-[0.24em] text-[#a07955]">Dashboard</p><h1 className="font-display text-5xl md:text-6xl text-[#173f3b] mt-2">{tab}</h1></div>
            <a href="/" className="md:hidden text-xs underline text-[#173f3b]">View site</a>
          </header>
          {tab === 'Overview' ? <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {card('RSVP responses', stats.rsvps)}{card('Attending', stats.yes)}{card('Guests attending', stats.guests)}
            {card('Declined', stats.no)}{card('Gifts reserved', stats.reserved)}{card('Awaiting confirmation', stats.pending)}
            {card('Reserved value', Number(stats.value || 0).toLocaleString())}</div>
            : tab === 'Section Manager' ? <SectionManager onEdit={setTab} /> : <Editor key={tab} table={cfg.table} cols={cfg.cols} single={cfg.single} noAdd={cfg.noAdd} csv={cfg.csv} />}
        </div>
      </main>
    </div>)
}
