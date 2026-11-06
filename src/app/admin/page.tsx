'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Editor, { Col } from '@/components/Editor'

const T: Col['type'] = 'text'
const tabs: Record<string, { cols: Col[]; single?: boolean; noAdd?: boolean; csv?: boolean }> = {
  Settings: { table: 'site_settings', single: true, cols: [
    { key: 'couple_names', label: 'Couple names' }, { key: 'tagline', label: 'Tagline' }, { key: 'wedding_date', label: 'Wedding date', type: 'date' },
    { key: 'venue', label: 'Main venue' }, { key: 'hero_image', label: 'Hero image', type: 'image' }, { key: 'currency', label: 'Currency symbol' },
    { key: 'bank_name', label: 'Bank name' }, { key: 'account_name', label: 'Account name' }, { key: 'account_number', label: 'Account number' },
    { key: 'dress_code', label: 'Dress code note', type: 'textarea' }] },
  Story: { table: 'story_sections', cols: [{ key: 'position', label: 'Order', type: 'number' }, { key: 'title', label: 'Title' }, { key: 'body', label: 'Text', type: 'textarea' }, { key: 'image', label: 'Photo', type: 'image' }] },
  Schedule: { table: 'events', cols: [{ key: 'position', label: 'Order', type: 'number' }, { key: 'title', label: 'Event' }, { key: 'event_date', label: 'Date', type: 'date' }, { key: 'start_time', label: 'Time' }, { key: 'venue', label: 'Venue' }, { key: 'map_url', label: 'Map link' }, { key: 'description', label: 'Details', type: 'textarea' }] },
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return (location.href = '/admin/login')
    const { data } = await supabase.from('admins').select('email').limit(1) // RLS: only admins can read
    if (!data?.length) { setOk(false); return }
    setOk(true)
    const [r, res, items] = await Promise.all([supabase.from('rsvps').select('attending,guests'), supabase.from('reservations').select('item_id,status'), supabase.from('registry_items').select('id,price')])
    const yes = (r.data || []).filter((x: any) => x.attending)
    const live = (res.data || []).filter((x: any) => x.status !== 'removed')
    const price = Object.fromEntries((items.data || []).map((i: any) => [i.id, Number(i.price)]))
    setStats({ rsvps: r.data?.length || 0, yes: yes.length, guests: yes.reduce((a: number, x: any) => a + (x.guests || 0), 0), no: (r.data?.length || 0) - yes.length,
      reserved: live.length, pending: live.filter((x: any) => x.status === 'pending').length, value: live.reduce((a: number, x: any) => a + (price[x.item_id] || 0), 0) })
  })() }, [])
  if (ok === null) return <p className="p-8">Loading…</p>
  if (!ok) return <p className="p-8">This account is not on the admin list. <button className="underline" onClick={() => supabase.auth.signOut().then(() => location.href = '/admin/login')}>Sign out</button></p>
  const cfg: any = tabs[tab]
  const card = (l: string, v: any) => <div className="bg-white p-5 rounded-md border-t-4 border-copper"><p className="text-3xl font-display text-teal">{v ?? 0}</p><p className="text-sm text-taupe">{l}</p></div>
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-teal text-cream md:w-56 p-4 flex md:flex-col gap-1 overflow-x-auto">
        <p className="font-display text-2xl mb-2 hidden md:block">Dashboard</p>
        {['Overview', ...Object.keys(tabs)].map(t => <button key={t} onClick={() => setTab(t)} className={`text-left px-3 py-2 rounded whitespace-nowrap ${tab === t ? 'bg-copper' : 'hover:bg-white/10'}`}>{t}</button>)}
        <a href="/" className="px-3 py-2 hover:bg-white/10 md:mt-auto">View site</a>
        <button className="text-left px-3 py-2 hover:bg-white/10" onClick={() => supabase.auth.signOut().then(() => location.href = '/admin/login')}>Sign out</button>
      </aside>
      <main className="flex-1 p-6 max-w-4xl">
        <h1 className="font-display text-4xl text-teal mb-6">{tab}</h1>
        {tab === 'Overview' ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {card('RSVPs received', stats.rsvps)}{card('Attending (responses)', stats.yes)}{card('Total guests attending', stats.guests)}
          {card('Declined', stats.no)}{card('Gifts reserved', stats.reserved)}{card('Awaiting your confirmation', stats.pending)}
          {card('Total value reserved', Number(stats.value || 0).toLocaleString())}</div>
          : <Editor key={tab} table={cfg.table} cols={cfg.cols} single={cfg.single} noAdd={cfg.noAdd} csv={cfg.csv} />}
      </main>
    </div>)
}
