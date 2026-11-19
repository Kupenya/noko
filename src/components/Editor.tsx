'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
export type Col = { key: string; label: string; type?: 'text' | 'number' | 'textarea' | 'date' | 'bool' | 'image' | 'audio' | 'color' | 'select'; options?: string[]; readonly?: boolean }

export default function Editor({ table, cols, single, noAdd, csv }: { table: string; cols: Col[]; single?: boolean; noAdd?: boolean; csv?: boolean }) {
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [modal, setModal] = useState<{ type?: 'delete' | 'save'; row?: any }>()
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const response = await fetch(`/api/admin/crud?table=${encodeURIComponent(table)}`)
    if (!response.ok) return
    const body = await response.json()
    setRows(body.rows?.map((r: any) => {
      const normalized = { ...r }
      cols.filter(c => c.type === 'date').forEach(c => {
        if (normalized[c.key]) {
          if (typeof normalized[c.key] === 'string') {
            normalized[c.key] = normalized[c.key].match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
          } else {
            const date = new Date(normalized[c.key])
            normalized[c.key] = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
          }
        }
      })
      return normalized
    }) || [])
  }

  useEffect(() => { load() }, [table])
  const upd = (i: number, k: string, v: any) => setRows(r => r.map((x, j) => j === i ? { ...x, [k]: v } : x))

  async function save(r: any) {
    setLoading(true)
    const { id, created_at, updated_at, ...rest } = r
    Object.keys(rest).forEach(k => { if (rest[k] === '') rest[k] = null })

    const response = await fetch('/api/admin/crud', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, data: rest }),
    })
    const body = await response.json()
    setLoading(false)
    if (!response.ok) {
      setModal({ type: 'save', row: { title: 'Could not save', message: body.error || 'Please check the date and try again.' } })
      return
    }
    setModal({ type: 'save', row: { title: 'Changes saved', message: 'Your update is now available on the wedding website.' } })
    setTimeout(() => { setModal(undefined); load() }, 700)
  }

  async function del(r: any) {
    setModal({ type: 'delete', row: r })
  }

  async function confirmDelete() {
    const r = modal?.row
    if (!r?.id) { setModal(undefined); return }
    setLoading(true)
    const response = await fetch('/api/admin/crud', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, id: r.id }) })
    const body = await response.json()
    setLoading(false)
    if (!response.ok) {
      setModal({ type: 'save', row: { title: 'Could not delete', message: body.error || 'Please try again.' } })
      return
    }
    setModal({ type: 'save', row: { title: 'Deleted', message: 'The record has been removed.' } })
    setTimeout(() => { setModal(undefined); load() }, 700)
  }

  async function upload(i: number, key: string, file?: File) {
    if (!file) return
    setLoading(true)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90000)
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form, signal: controller.signal })
      clearTimeout(timeout)
      const body = await response.json().catch(() => ({}))
      setLoading(false)

      if (!response.ok) {
        setModal({ type: 'save', row: { title: 'Upload failed', message: body.error || 'Please choose a smaller image and try again.' } })
        return
      }

      const updated = { ...rows[i], [key]: body.url }
      upd(i, key, body.url)
      await save(updated)
    } catch (error: any) {
      clearTimeout(timeout)
      setLoading(false)
      setModal({
        type: 'save',
        row: {
          title: 'Upload could not finish',
          message: error?.name === 'AbortError'
            ? 'The upload took too long. Use an image under 4 MB and try again.'
            : 'The upload connection failed. Check the image and try again.',
        },
      })
    }
  }
  function exportCsv() {
    const keys = ['created_at', ...cols.map(c => c.key)]
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const blob = new Blob([[keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${table}.csv`; a.click()
  }
  const shown = rows.filter(r => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        {!single && <input className="inp !w-auto min-w-[220px]" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />}
        {!single && !noAdd && <button className="btn" onClick={() => setRows([{ position: rows.length + 1 }, ...rows])}>＋ Add new</button>}
        {csv && <button className="btn !bg-[#fffdfa] !text-[#173f3b] !border !border-[#173f3b]/20" onClick={exportCsv}>Export CSV</button>}
        <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-[#8b8d86]">{rows.length} records</span>
      </div>
      <div className="space-y-5">
        {shown.map((r, i) => (
          <div key={r.id ?? 'new' + i} className="bg-[#fffdfa] p-5 md:p-6 rounded-[3px] border border-[#173f3b]/10 shadow-[0_10px_30px_rgba(45,70,62,.04)] grid md:grid-cols-2 gap-4">
            {cols.map(c => (
              <label key={c.key} className={`text-sm ${c.type === 'textarea' || c.type === 'image' ? 'md:col-span-2' : ''}`}>{c.label}
                {c.type === 'textarea' ? <textarea className="inp mt-1" rows={3} value={r[c.key] ?? ''} onChange={e => upd(i, c.key, e.target.value)} />
                  : c.type === 'bool' ? <input type="checkbox" className="ml-2" checked={!!r[c.key]} disabled={c.readonly} onChange={e => upd(i, c.key, e.target.checked)} />
                  : c.type === 'select' ? <select className="inp mt-1" value={r[c.key] ?? ''} onChange={e => upd(i, c.key, e.target.value)}>{c.options!.map(o => <option key={o}>{o}</option>)}</select>
                  : c.type === 'image' ? <div className="mt-2 space-y-3">{r[c.key] && <div className="relative w-fit"><img src={r[c.key]} className="h-24 rounded-md object-cover border border-[#173f3b]/10" alt="" /><button type="button" className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-700 text-white text-xs shadow" onClick={() => save({ ...r, [c.key]: null })} aria-label="Remove image">×</button></div>}<input type="file" accept="image/*" onChange={e => upload(i, c.key, e.target.files?.[0])} /></div>
                  : c.type === 'audio' ? <div className="mt-2 space-y-3">{r[c.key] && <><audio controls preload="metadata" className="w-full max-w-sm" src={r[c.key]} /><button type="button" className="text-xs text-red-700 underline" onClick={() => save({ ...r, [c.key]: null })}>Remove music</button></>}<input type="file" accept="audio/*" onChange={e => upload(i, c.key, e.target.files?.[0])} /></div>
                  : c.type === 'color' ? <input className="inp mt-1 h-14 cursor-pointer p-1" type="color" value={/^#[0-9a-f]{6}$/i.test(r[c.key] || '') ? r[c.key] : '#173f3b'} onChange={e => upd(i, c.key, e.target.value)} />
                  : c.type === 'date' ? <input className="inp mt-2 h-14 cursor-pointer text-[#173f3b] [color-scheme:light]" type="date" value={r[c.key] ?? ''} onChange={e => upd(i, c.key, e.target.value)} />
                  : <input className="inp mt-1" type={c.type === 'number' ? 'number' : 'text'} readOnly={c.readonly} value={r[c.key] ?? ''} onChange={e => upd(i, c.key, c.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} />}
              </label>))}
            <div className="md:col-span-2 flex items-center gap-3"><button className="btn" onClick={() => save(r)}>Save</button>{!single && <button className="ml-auto min-h-9 rounded-full px-4 text-xs font-medium border border-red-700/20 text-red-700 hover:bg-red-700 hover:text-white transition-colors" onClick={() => del(r)}>Delete</button>}</div>
          </div>))}
        {!shown.length && <p className="text-taupe">Nothing here yet.</p>}
      </div>
      {modal?.type === 'delete' && <Modal open title="Remove this record?" message="This action cannot be undone." confirmLabel="Delete" danger onConfirm={confirmDelete} onClose={() => setModal(undefined)} />}
      {modal?.type === 'save' && <Modal open title={modal.row?.title || 'Saved'} message={modal.row?.message || 'Your changes are now available on the wedding website.'} confirmLabel="Done" onClose={() => setModal(undefined)} />}
      {loading && <div className="fixed inset-0 z-[90] bg-[#102d29]/20 backdrop-blur-[2px] flex items-center justify-center"><div className="w-10 h-10 rounded-full border-2 border-[#173f3b]/20 border-t-[#173f3b] animate-spin" /></div>}
    </div>)
}
