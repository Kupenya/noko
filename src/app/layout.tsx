import './globals.css'
import { Cormorant_Garamond, Karla } from 'next/font/google'
const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-display' })
const body = Karla({ subsets: ['latin'], variable: '--font-body' })
export const metadata = { title: 'Our Wedding | Celebration & Registry', description: 'An intimate celebration, wedding details and gift registry.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${display.variable} ${body.variable} font-body`}>{children}</body></html>
}
