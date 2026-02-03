// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8dfd0',
          300: '#d4c4a8',
          400: '#bda67a',
          500: '#a88b5a',
          600: '#9a7a4a',
          700: '#7f643e',
          800: '#695237',
          900: '#56452f',
        },
        accent: {
          50: '#f0f7f4',
          100: '#d9ebe3',
          200: '#b5d7c8',
          300: '#8abda6',
          400: '#5b9a7a',
          500: '#4a8a68',
          600: '#3d7356',
          700: '#325c45',
          800: '#2b5f47',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      },
    },
  },
} satisfies Config
