import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      fontSize: {
        base: ['1.0625rem', '1.5rem'],
      },
      letterSpacing: {
        base: '0.005em',
      },
    },
  },
  plugins: [],
}
export default config
