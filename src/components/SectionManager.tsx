'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

const templates = [
  { key: 'story', title: 'Our Story', icon: '◌', description: 'A personal timeline or your shared story.' },
  { key: 'schedule', title: 'Schedule', icon: '◷', description: 'Ceremony, reception and celebration times.' },
  { key: 'colours', title: 'Colours of the day', icon: '◈', description: 'Dress colours and wedding party guidance.' },
  { key: 'rsvp', title: 'RSVP', icon: '♡', description: 'Attendance form for guests.' },
  { key: 'registry', title: 'Gift Registry', icon: '◇', description: 'Gift items and reservation details.' },
  { key: 'gallery', title: 'Gallery', icon: '▧', description: 'A curated collection of wedding photographs.' },
  { key: 'faq', title: 'Questions', icon: '?', description: 'Answers to common guest questions.' },
]

export default function SectionManager({ onEdit }: { onEdit: (tab: string) => void }) {
  const [sections, setSections] = useState<any[]>([])
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [removeSection, setRemoveSection] = useState<any>(null)

  async function load() {
    const r = await fetch('/api/admin/crud?table=site_sections')
    if (!r.ok) return
    const b = await r.json()
    setSections((b.rows || []).sort((a: any, b: any) => a.position - b.position))
  }

  useEffect(() => { load() }, [])

  async function addSection(template: typeof templates[number]) {
    const activeCount = sections.filter(s => s.enabled).length
    await fetch('/api/admin/crud', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'site_sections', id: sections.find(s => s.section_key === template.key)?.id, data: { title: template.title, enabled: true, position: activeCount + 1 } }),
    })
    setCatalogOpen(false)
    await load()
  }

  async function remove(section: any) {
    await fetch('/api/admin/crud', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_sections', id: section.id, data: { title: section.title, enabled: false, position: 0 } }) })
    setRemoveSection(null)
    await load()
  }

  async function move(section: any, direction: -1 | 1) {
    const active = sections.filter(s => s.enabled).sort((a: any, b: any) => a.position - b.position)
    const index = active.findIndex(s => s.id === section.id)
    const swap = active[index + direction]
    if (!swap) return
    await Promise.all([
      fetch('/api/admin/crud', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_sections', id: section.id, data: { title: section.title, enabled: true, position: swap.position } }) }),
      fetch('/api/admin/crud', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'site_sections', id: swap.id, data: { title: swap.title, enabled: true, position: section.position } }) }),
    ])
    await load()
  }

  const active = sections.filter(s => s.enabled).sort((a: any, b: any) => a.position - b.position)
  const inactive = templates.filter(t => !sections.find(s => s.section_key === t.key)?.enabled)
  const tabFor: Record<string, string> = { story: 'Story', schedule: 'Schedule', colours: 'Colours', rsvp: 'RSVPs', registry: 'Registry', gallery: 'Gallery', faq: 'FAQ' }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div><p className="text-[10px] uppercase tracking-[0.24em] text-[#a07955]">Website structure</p><p className="mt-2 text-sm text-[#65706d]">Choose the sections guests can see and arrange their order.</p></div>
        <button className="btn" onClick={() => setCatalogOpen(true)} disabled={!inactive.length}>＋ Add section</button>
      </div>

      <div className="space-y-3">
        {active.map((section: any, index: number) => {
          const template = templates.find(t => t.key === section.section_key)
          return (
            <div key={section.id} className="bg-[#fffdfa] border border-[#173f3b]/10 rounded-[4px] p-4 flex items-center gap-4">
              <span className="w-10 h-10 shrink-0 rounded-full bg-[#edf1ec] text-[#173f3b] flex items-center justify-center font-display text-xl">{template?.icon || '•'}</span>
              <button className="text-left flex-1" onClick={() => onEdit(tabFor[section.section_key])}><p className="font-display text-xl text-[#173f3b]">{section.title}</p><p className="text-xs text-[#8b8d86] mt-1">{template?.description}</p></button>
              <div className="flex items-center gap-1">
                <button title="Move up" disabled={index === 0} onClick={() => move(section, -1)} className="w-9 h-9 rounded-full border border-[#173f3b]/10 disabled:opacity-30">↑</button>
                <button title="Move down" disabled={index === active.length - 1} onClick={() => move(section, 1)} className="w-9 h-9 rounded-full border border-[#173f3b]/10 disabled:opacity-30">↓</button>
                <button title="Remove section" onClick={() => setRemoveSection(section)} className="w-9 h-9 rounded-full border border-red-700/20 text-red-700 hover:bg-red-700 hover:text-white">×</button>
              </div>
            </div>
          )
        })}
        {!active.length && <p className="text-center text-sm text-[#65706d] py-12">No website sections are active. Add one to begin.</p>}
      </div>

      {catalogOpen && <div className="fixed inset-0 z-[100] bg-[#102d29]/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5" onClick={() => setCatalogOpen(false)}>
        <div className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[24px] sm:rounded-[4px] bg-[#fffdfa] p-6 sm:p-8" onClick={e => e.stopPropagation()}>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#a07955]">Section catalogue</p>
          <h3 className="mt-2 font-display text-4xl text-[#173f3b]">Add to your website</h3>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {inactive.map(template => <button key={template.key} onClick={() => addSection(template)} className="text-left p-4 rounded-[4px] border border-[#173f3b]/10 hover:border-[#173f3b]/40 hover:bg-[#edf1ec] transition-colors"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-[#edf1ec] text-[#173f3b] flex items-center justify-center font-display text-xl">{template.icon}</span><p className="font-display text-xl text-[#173f3b]">{template.title}</p></div><p className="mt-3 text-xs leading-5 text-[#65706d]">{template.description}</p></button>)}
          </div>
          <button className="mt-6 w-full min-h-11 rounded-full border border-[#173f3b]/15 text-sm text-[#173f3b]" onClick={() => setCatalogOpen(false)}>Close</button>
        </div>
      </div>}

      {removeSection && <Modal open title={`Remove ${removeSection.title}?`} message="The section will disappear from the public website. Its saved content can be restored by adding it again." confirmLabel="Remove section" danger onConfirm={() => remove(removeSection)} onClose={() => setRemoveSection(null)} />}
    </div>
  )
}
