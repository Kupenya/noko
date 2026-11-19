import { query } from '@/lib/postgres'
import Registry from '@/components/Registry'
import RsvpForm from '@/components/RsvpForm'
import WeddingMusic from '@/components/WeddingMusic'
import MobileNav from '@/components/MobileNav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const fmtDate = (value?: string | Date) => {
  if (!value) return ''
  let year: number
  let month: number
  let day: number

  if (typeof value === 'string') {
    const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(value)
    if (!match) return ''
    year = Number(match[1]); month = Number(match[2]); day = Number(match[3])
  } else {
    year = value.getUTCFullYear(); month = value.getUTCMonth() + 1; day = value.getUTCDate()
  }

  if (!year || !month || !day) return ''
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default async function Home() {
  const [settings, story, events, colors, items, reservations, faqs, gallery, sections, customSections] = await Promise.all([
    query('select * from site_settings where id=$1', [1]),
    query('select * from story_sections order by position'),
    query('select * from events order by position'),
    query('select * from color_palette order by position'),
    query('select * from registry_items where active=true order by position'),
    query("select item_id, display_name from reservations where status <> 'removed'"),
    query('select * from faqs order by position'),
    query('select * from gallery_images order by position'),
    query('select * from site_sections where enabled=true order by position'),
    query('select * from custom_sections where enabled=true order by position'),
  ])
  const set: any = settings.rows[0] || {}
  const storyRows = story.rows
  const eventRows = events.rows
  const colorRows = colors.rows
  const itemRows = items.rows
  const reservationRows = reservations.rows
  const faqRows = faqs.rows
  const galleryRows = gallery.rows
  const sectionRows = sections.rows
  const customRows = customSections.rows
  const configuredSections = [
    ...sectionRows.map((s: any) => ({ kind: s.section_key, position: s.position, title: s.title })),
    ...customRows.map((s: any) => ({ kind: 'custom', id: s.id, position: s.position, title: s.title, body: s.body, image: s.image })),
  ].sort((a: any, b: any) => Number(a.position) - Number(b.position))
  const nav = configuredSections.map((s: any) => ({
    title: s.title,
    id: s.kind === 'custom' ? `custom-${s.id}` : s.kind,
  })).filter((item: any) => item.title)
  const themeStyle = {
    '--wedding-primary': set.primary_color || '#173f3b',
    '--wedding-accent': set.accent_color || '#b38a62',
    '--wedding-sage': set.sage_color || '#edf1ec',
    '--wedding-cream': set.cream_color || '#f8f5ef',
  } as React.CSSProperties
  return (
    <main style={themeStyle}>
      <nav className="fixed top-0 inset-x-0 z-30 backdrop-blur-xl border-b border-[#1d2928]/[0.07]" style={{ background: 'color-mix(in srgb, var(--wedding-cream) 92%, transparent)' }}>
        <div className="max-w-6xl mx-auto h-16 px-5 md:px-8 flex items-center justify-between">
          <a href="#top" className="font-display text-xl text-[#173f3b]">{set.couple_names || 'Our Wedding'}</a>
          <div className="hidden md:flex items-center gap-5 md:gap-8 text-[10px] md:text-xs uppercase tracking-[0.18em] text-[#56605e]">
            {nav.map(n => <a key={n.id} href={'#' + n.id} className="hidden sm:block hover:text-[#173f3b] transition-colors">{n.title}</a>)}
          </div>
          <MobileNav title={set.couple_names || 'Our Wedding'} items={nav} />
        </div>
      </nav>

      <header id="top" className="relative min-h-[720px] md:min-h-[820px] flex items-center justify-center text-center overflow-hidden text-[#fbfaf7] pt-16"
        style={set.hero_image ? { backgroundImage: `linear-gradient(180deg,color-mix(in srgb,var(--wedding-primary) 45%,transparent),color-mix(in srgb,var(--wedding-primary) 78%,transparent)),url(${set.hero_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(135deg,var(--wedding-primary),var(--wedding-accent))' }}>
        <div className="absolute inset-5 md:inset-8 border border-white/25" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border border-white/15" />
        <div className="relative max-w-4xl px-6 py-20">
          <p className="text-xs md:text-sm uppercase tracking-[0.42em] mb-8 text-[#e7d7c3]">Together with their families</p>
          <h1 className="font-display text-6xl sm:text-7xl md:text-[112px] leading-[0.82] tracking-[-0.035em]">{set.couple_names || 'Our Wedding'}</h1>
          <div className="flex items-center justify-center gap-4 mt-10"><span className="ornament" /><span className="text-xl md:text-2xl font-display italic">are getting married</span><span className="ornament" /></div>
          <p className="mt-8 text-sm md:text-base uppercase tracking-[0.22em]">{fmtDate(set.wedding_date)}</p>
          <p className="mt-3 font-display text-xl md:text-2xl text-[#ede3d5]">{set.venue}</p>
          <a href="#rsvp" className="inline-flex mt-10 rounded-full border border-white/50 bg-white/10 backdrop-blur px-7 py-4 text-xs uppercase tracking-[0.18em] hover:bg-white hover:text-[#173f3b] transition-all">Respond to invitation</a>
        </div>
      </header>

      {configuredSections.map((section: any, index: number) => {
        const tint = index % 2 === 1
        if (section.kind === 'story') return <Section key="story" id="story" title={section.title} tint={tint}><div className="space-y-12">{storyRows.map((x: any, i: number) => <article key={x.id} className={`flex flex-col md:flex-row gap-6 items-center ${i % 2 ? 'md:flex-row-reverse' : ''}`}>{x.image && <img src={x.image} alt={x.title} className="w-full md:w-1/2 rounded-md object-cover aspect-[4/3]" />}<div className="md:w-1/2"><h3 className="font-display text-3xl text-teal mb-2">{x.title}</h3><p className="leading-relaxed">{x.body}</p></div></article>)}</div></Section>
        if (section.kind === 'schedule') return <Section key="schedule" id="schedule" title={section.title} tint={tint}><div className="grid md:grid-cols-3 gap-6">{eventRows.map((e: any) => <article key={e.id} className="bg-white p-6 border-t-4 border-copper rounded-md"><h3 className="font-display text-2xl text-teal">{e.title}</h3><p className="mt-2 font-medium">{fmtDate(e.event_date)}</p><p>{e.start_time}</p><p className="text-taupe">{e.venue}</p><p className="mt-2 text-sm">{e.description}</p>{e.map_url && <a href={e.map_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-copper underline">Get directions</a>}</article>)}</div></Section>
        if (section.kind === 'colours') return <Section key="colours" id="colours" title={section.title} tint={tint}><p className="text-center mb-8">{set.dress_code}</p><div className="grid grid-cols-2 md:grid-cols-4 gap-5">{colorRows.map((c: any) => <div key={c.id} className="text-center"><div className="h-24 rounded-md border border-black/5" style={{ background: c.hex }} /><p className="mt-2 font-medium">{c.role}</p><p className="text-sm text-taupe">{c.name}</p>{c.note && <p className="text-xs text-taupe">{c.note}</p>}</div>)}</div></Section>
        if (section.kind === 'rsvp') return <Section key="rsvp" id="rsvp" title={section.title} tint={tint}><RsvpForm /></Section>
        if (section.kind === 'registry') return <Section key="registry" id="registry" title={section.title} tint={tint}><Registry items={itemRows || []} reservations={reservationRows || []} settings={set} /></Section>
        if (section.kind === 'gallery') return galleryRows.length ? <Section key="gallery" id="gallery" title={section.title} tint={tint}><div className="columns-2 md:columns-3 gap-3">{galleryRows.map((g: any) => <img key={g.id} src={g.image} alt={g.caption || ''} className="mb-3 rounded-md w-full" />)}</div></Section> : null
        if (section.kind === 'faq') return faqRows.length ? <Section key="faq" id="faq" title={section.title} tint={tint}><div className="max-w-2xl mx-auto space-y-3">{faqRows.map((f: any) => <details key={f.id} className="bg-white p-4 rounded-md"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-2">{f.answer}</p></details>)}</div></Section> : null
        return <Section key={`custom-${section.id}`} id={`custom-${section.id}`} title={section.title} tint={tint}><div className="max-w-3xl mx-auto">{section.image && <img src={section.image} alt={section.title} className="w-full max-h-[420px] object-cover rounded-md mb-8" />}<p className="text-center leading-8 whitespace-pre-line">{section.body}</p></div></Section>
      })}

      <WeddingMusic url={set.music_url} />
      <footer className="bg-teal text-cream text-center py-10"><p className="font-display text-3xl">{set.couple_names || 'Our Wedding'}</p><p className="text-sm text-mint mt-1">{fmtDate(set.wedding_date)}</p></footer>
    </main>
  )
}

function Section({ id, title, tint, children }: any) {
  return (
    <section id={id} className="paper-grain py-24 md:py-32 px-5" style={{ background: tint ? 'var(--wedding-sage)' : 'var(--wedding-cream)' }}>
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-14 md:mb-18">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#a07955] mb-3">The celebration</p>
          <h2 className="font-display text-5xl md:text-7xl text-[#173f3b] leading-none">{title}</h2>
          <div className="mt-5 flex justify-center items-center gap-3"><span className="w-10 h-px bg-[#c5a27a]" /><span className="text-[#c5a27a]">◆</span><span className="w-10 h-px bg-[#c5a27a]" /></div>
        </header>
        {children}
      </div>
    </section>
  )
}
