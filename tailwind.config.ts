import { theme } from './src/lib/theme'
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: theme, fontFamily: { display: ['var(--font-display)','serif'], body: ['var(--font-body)','sans-serif'] } } },
}
