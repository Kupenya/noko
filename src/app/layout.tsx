import './globals.css'
import { Cormorant_Garamond, Karla } from 'next/font/google'
const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-display' })
const body = Karla({ subsets: ['latin'], variable: '--font-body' })
export const metadata = { title: 'Our Wedding', description: 'Join us as we celebrate our wedding.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${display.variable} ${body.variable} font-body`}>{children}</body></html>
}
