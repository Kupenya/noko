'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export type Col = { key: string; label: string; type?: 'text' | 'number' | 'textarea' | 'date' | 'bool' | 'image' | 'select'; options?: string[]; readonly?: boolean }

export default function Editor({ table, cols, single, noAdd, csv }: { table: string; cols: Col[]; single?: boolean; noAdd?: boolean; csv?: boolean }) {
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')
  const order = single ? 'id' : (cols.some(c => c.key === 'position') ? 'position' : 'created_at')
  const load = async () => { const { data } = await supabase.from(table).select('*').order(order, { ascending: order !== 'created_at' }); setRows(data || []) }
  useEffect(() => { load() }, [table])
  const upd = (i: number, k: string, v: any) => setRows(r => r.map((x, j) => j === i ? { ...x, [k]: v } : x))

  async function save(r: any) {
    const { id, created_at, ...rest } = r
    Object.keys(rest).forEach(k => { if (rest[k] === '') rest[k] = null })
    const { error } = single ? await supabase.from(table).update(rest).eq('id', 1)
      : id ? await supabase.from(table).update(rest).eq('id', id) : await supabase.from(table).insert(rest)
    alert(error ? error.message : 'Saved'); load()
  }
  async function del(r: any) {
    if (!confirm('Delete this? This cannot be undone.')) return
    if (r.id) await supabase.from(table).delete().eq('id', r.id)
    load()
  }
  async function upload(i: number, key: string, file?: File) {
    if (!file) return
    const path = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
    const { error } = await supabase.storage.from('images').upload(path, file)
    if (error) return alert(error.message)
    upd(i, key, supabase.storage.from('images').getPublicUrl(path).data.publicUrl)
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
      <div className="flex gap-3 mb-4 flex-wrap">
        {!single && <input className="inp max-w-xs" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />}
        {!single && !noAdd && <button className="btn" onClick={() => setRows([{ position: rows.length + 1 }, ...rows])}>Add new</button>}
        {csv && <button className="btn" onClick={exportCsv}>Export CSV</button>}
        <span className="self-center text-sm text-taupe">{rows.length} total</span>
      </div>
      <div className="space-y-4">
        {shown.map((r, i) => (
          <div key={r.id ?? 'new' + i} className="bg-white p-4 rounded-md border border-taupe/20 grid md:grid-cols-2 gap-3">
            {cols.map(c => (
              <label key={c.key} className={`text-sm ${c.type === 'textarea' || c.type === 'image' ? 'md:col-span-2' : ''}`}>{c.label}
                {c.type === 'textarea' ? <textarea className="inp mt-1" rows={3} value={r[c.key] ?? ''} onChange={e => upd(i, c.key, e.target.value)} />
                  : c.type === 'bool' ? <input type="checkbox" className="ml-2" checked={!!r[c.key]} disabled={c.readonly} onChange={e => upd(i, c.key, e.target.checked)} />
                  : c.type === 'select' ? <select className="inp mt-1" value={r[c.key] ?? ''} onChange={e => upd(i, c.key, e.target.value)}>{c.options!.map(o => <option key={o}>{o}</option>)}</select>
                  : c.type === 'image' ? <div className="mt-1 flex items-center gap-3">{r[c.key] && <img src={r[c.key]} className="h-16 rounded" alt="" />}<input type="file" accept="image/*" onChange={e => upload(i, c.key, e.target.files?.[0])} /></div>
                  : <input className="inp mt-1" type={c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : 'text'} readOnly={c.readonly} value={r[c.key] ?? ''} onChange={e => upd(i, c.key, c.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} />}
              </label>))}
            <div className="md:col-span-2 flex gap-3"><button className="btn" onClick={() => save(r)}>Save</button>{!single && <button className="text-red-700 underline text-sm" onClick={() => del(r)}>Delete</button>}</div>
          </div>))}
        {!shown.length && <p className="text-taupe">Nothing here yet.</p>}
      </div>
    </div>)
}
