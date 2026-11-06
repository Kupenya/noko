import { supabase } from '@/lib/supabase'
import Registry from '@/components/Registry'
import { theme } from '@/lib/theme'
import RsvpForm from '@/components/RsvpForm'
export const dynamic = 'force-dynamic'

const fmtDate = (d?: string) => d ? new Date(d + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''

export default async function Home() {
  const [s, story, events, colors, items, res, faqs, gallery] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 1).single(),
    supabase.from('story_sections').select('*').order('position'),
    supabase.from('events').select('*').order('position'),
    supabase.from('color_palette').select('*').order('position'),
    supabase.from('registry_items').select('*').order('position'),
    supabase.from('public_reservations').select('*'),
    supabase.from('faqs').select('*').order('position'),
    supabase.from('gallery_images').select('*').order('position'),
  ])
  const set: any = s.data || {}
  const nav = ['Story', 'Schedule', 'Colours', 'RSVP', 'Registry']
  return (
    <main>
      <nav className="sticky top-0 z-20 bg-cream/90 backdrop-blur border-b border-taupe/20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-5 overflow-x-auto text-sm">
          {nav.map(n => <a key={n} href={'#' + n.toLowerCase()} className="hover:text-copper whitespace-nowrap">{n}</a>)}
        </div>
      </nav>

      <header className="bg-teal text-cream text-center px-6 py-28 relative"
        style={set.hero_image ? { backgroundImage: `linear-gradient(#0F5257cc,#0F5257cc),url(${set.hero_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <p className="text-mint mb-4">{set.tagline}</p>
        <h1 className="font-display text-6xl md:text-8xl">{set.couple_names}</h1>
        <p className="mt-6 text-lg">{fmtDate(set.wedding_date)}</p>
        <p className="text-cream/80">{set.venue}</p>
        <div className="mt-8 flex justify-center gap-2" aria-hidden>
          {['sage','copper','rose','taupe','mint','purple'].map(c => <span key={c} className="h-2 w-10" style={{ background: (theme as any)[c] }} />)}
        </div>
      </header>

      <Section id="story" title="Our story">
        <div className="space-y-12">
          {story.data?.map((x: any, i: number) => (
            <div key={x.id} className={`flex flex-col md:flex-row gap-6 items-center ${i % 2 ? 'md:flex-row-reverse' : ''}`}>
              {x.image && <img src={x.image} alt={x.title} className="w-full md:w-1/2 rounded-md object-cover aspect-[4/3]" />}
              <div className="md:w-1/2"><h3 className="font-display text-3xl text-teal mb-2">{x.title}</h3><p className="leading-relaxed">{x.body}</p></div>
            </div>))}
        </div>
      </Section>

      <Section id="schedule" title="Schedule" tint>
        <div className="grid md:grid-cols-3 gap-6">
          {events.data?.map((e: any) => (
            <div key={e.id} className="bg-white p-6 border-t-4 border-copper rounded-md">
              <h3 className="font-display text-2xl text-teal">{e.title}</h3>
              <p className="mt-2 font-medium">{fmtDate(e.event_date)}</p>
              <p>{e.start_time}</p><p className="text-taupe">{e.venue}</p>
              <p className="mt-2 text-sm">{e.description}</p>
              {e.map_url && <a href={e.map_url} target="_blank" className="inline-block mt-3 text-sm text-copper underline">Get directions</a>}
            </div>))}
        </div>
      </Section>

      <Section id="colours" title="Colours of the day">
        <p className="text-center mb-8">{set.dress_code}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {colors.data?.map((c: any) => (
            <div key={c.id} className="text-center">
              <div className="h-24 rounded-md border border-black/5" style={{ background: c.hex }} />
              <p className="mt-2 font-medium">{c.role}</p><p className="text-sm text-taupe">{c.name}</p>
              {c.note && <p className="text-xs text-taupe">{c.note}</p>}
            </div>))}
        </div>
      </Section>

      <Section id="rsvp" title="RSVP" tint><RsvpForm /></Section>

      <Section id="registry" title="Gift registry">
        <Registry items={items.data || []} reservations={res.data || []} settings={set} />
      </Section>

      {!!gallery.data?.length && <Section id="gallery" title="Gallery" tint>
        <div className="columns-2 md:columns-3 gap-3">{gallery.data.map((g: any) => <img key={g.id} src={g.image} alt={g.caption || ''} className="mb-3 rounded-md w-full" />)}</div>
      </Section>}

      {!!faqs.data?.length && <Section id="faq" title="Questions">
        <div className="max-w-2xl mx-auto space-y-3">{faqs.data.map((f: any) => (
          <details key={f.id} className="bg-white p-4 rounded-md"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-2">{f.answer}</p></details>))}</div>
      </Section>}

      <footer className="bg-teal text-cream text-center py-10"><p className="font-display text-3xl">{set.couple_names}</p><p className="text-sm text-mint mt-1">{fmtDate(set.wedding_date)}</p></footer>
    </main>
  )
}

function Section({ id, title, tint, children }: any) {
  return (
    <section id={id} className={`py-20 px-4 ${tint ? 'bg-sage/15' : ''}`}>
      <div className="max-w-5xl mx-auto"><h2 className="font-display text-5xl text-teal text-center mb-10">{title}</h2>{children}</div>
    </section>)
}
