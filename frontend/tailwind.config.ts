import type { Config } from 'tailwindcss';

/**
 * Vite & Gourmand — Design System
 * Style : Éditorial gourmand (magazine culinaire premium)
 * Inspirations : Le Bristol, Coquelet, Ladurée éditions
 *
 * Palette tirée du terroir bordelais :
 *  - bordeaux : couleur signature du vin de la région
 *  - crème    : porcelaine, nappes, lumière du restaurant
 *  - or       : champagne, gastronomie haute
 *  - café     : bois sombre, café serré
 *  - terre    : terracotta, briques anciennes
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marque
        bordeaux: {
          50:  '#FBF3F4',
          100: '#F5E1E3',
          200: '#E7BAC0',
          300: '#D38A93',
          400: '#B85968',
          500: '#9B3344',
          600: '#7E2435',
          700: '#6B1F2A', // PRIMARY — couleur de marque
          800: '#511820',
          900: '#3C1118',
          950: '#21090D',
        },
        creme: {
          50:  '#FDFBF6',
          100: '#FAF5EA',
          200: '#F4ECDD', // BG principal
          300: '#EBDFC5',
          400: '#DCC9A0',
          500: '#CBB179',
          600: '#B79858',
          700: '#967B47',
          800: '#7A653C',
          900: '#5F4F31',
        },
        or: {
          50:  '#FBF7EE',
          100: '#F5ECD3',
          200: '#EAD8A8',
          300: '#DCBE74',
          400: '#CFA84D',
          500: '#C8A35A', // ACCENT
          600: '#A88436',
          700: '#876830',
          800: '#6F552C',
          900: '#5C4828',
        },
        cafe: {
          50:  '#F7F3F1',
          100: '#EBDFD9',
          200: '#D5BCAF',
          300: '#B6917E',
          400: '#956B53',
          500: '#7A5240',
          600: '#624234',
          700: '#4F352B',
          800: '#3A271F',
          900: '#2D1810', // TEXT principal
        },
        terre: {
          50:  '#FDF4F0',
          100: '#FAE4D9',
          200: '#F4C7B0',
          300: '#EE9F7B',
          400: '#E8704A', // ACCENT chaud
          500: '#D8542B',
          600: '#B83F1F',
          700: '#94311C',
          800: '#762A1C',
          900: '#5F261B',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Échelle typographique éditoriale (1.250 modular)
        'display-2xl': ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '300' }],
        'display-xl':  ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '300' }],
        'display-lg':  ['clamp(2rem, 4.5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '400' }],
        'display-md':  ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'eyebrow':     ['0.75rem', { lineHeight: '1', letterSpacing: '0.2em', fontWeight: '500' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'card': '1.25rem',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(45, 24, 16, 0.04), 0 8px 24px -8px rgba(45, 24, 16, 0.08)',
        'card': '0 4px 6px rgba(45, 24, 16, 0.04), 0 24px 48px -16px rgba(45, 24, 16, 0.12)',
        'pop':  '0 2px 4px rgba(107, 31, 42, 0.06), 0 32px 64px -24px rgba(107, 31, 42, 0.20)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      },
      transitionTimingFunction: {
        'gourmand': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
