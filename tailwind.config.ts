import type { Config } from 'tailwindcss'
import { default as plugin } from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './feat/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx,mdx}',
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      screens: {
        'xs-max': { max: '320px' },
        'md-max': { max: '767px' },
        'lg-max': { max: '1024px' },
        lg: '1025px',
        xxl: '1441px',
      },
      spacing: {
        safe: '1.25rem',
        13: '3.25rem',
        15: '3.75rem',
        19: '4.75rem',
        22: '5.5rem',
        38: '9.5rem',
        70: '17.5rem',
        93: '23.25rem',
        118: '29.5rem',
        143: '35.75rem',
        144: '36rem',
        163: '40.75rem',
        168: '42rem',
        173: '43.25rem',
        175: '43.75rem',
        200: '50rem',
        245: '61.25rem',
      },
      colors: {
        primary: 'rgb(37 99 235 / 1)',
        tomato: 'rgb(255 85 48 / 1)',
        body: 'rgb(54 54 55 / 1)',
        zinc: {
          50: 'rgb(250 250 253 / 1)',
          100: 'rgb(244 244 248 / 1)',
          900: 'rgb(28 28 30 / 1)',
        },
      },
      zIndex: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
      },
      fontSize: {
        // base: ['1.0625rem', '1.5rem'],
        base: ['1rem', '1.5rem'],
        xxs: ['11px', '14px'],
        'lead-title-sm': ['18px', '26px'],
        'lead-title': ['20px', '25px'],
        'lead-title-lg': ['24px', '27px'],
        'large-title-sm': ['28px', '32px'],
        'large-title': ['32px', '36px'],
        'large-title-lg': ['40px', '44px'],
        'huge-title-sm': ['48px', '53px'],
        'huge-title': ['56px', '60px'],
        'huge-title-lg': ['64px', '68px'],
        'colossal-title-sm': ['72px', '76px'],
        'colossal-title': ['80px', '84px'],
        'colossal-title-md': ['96px', '100px'],
        'colossal-title-lg': ['120px', '124px'],
      },
      borderRadius: {
        inherit: 'inherit',
        field: '0.625rem',
        card: '1.25rem',
      },
      letterSpacing: {
        base: '0.0013em',
        lead: '0.015em',
      },
      willChange: {
        opacity: 'opacity',
        'transform-opacity': 'transform, opacity',
      },
      opacity: {
        0: '0.001',
        100: '0.999',
      },
      transitionTimingFunction: {
        default: 'ease',
        panel: 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionProperty: {
        'opacity-transform': 'opacity, transform',
      },
      transitionDuration: {
        600: '600ms',
        560: '560ms',
      },
      animation: {
        'alert-show': 'alert-show 320ms cubic-bezier(.32,.72,0,1) forwards',
        'alert-hide': 'alert-hide 320ms cubic-bezier(.32,.72,0,1) forwards',

        // Modal
        'modal-show': 'modal-show .3s ease forwards',
        'modal-hide': 'modal-hide .3s ease forwards',

        // Presentation
        'presentation-show': 'presentation-show .56s cubic-bezier(0.19, 1, 0.22, 1)', // prettier-ignore
        'presentation-hide': 'presentation-hide .56s cubic-bezier(0.19, 1, 0.22, 1)', // prettier-ignore
        'presentation-large-show': 'presentation-large-show .6s cubic-bezier(0.19, 1, 0.22, 1)', // prettier-ignore
        'presentation-large-hide': 'presentation-large-hide .6s cubic-bezier(0.19, 1, 0.22, 1)', // prettier-ignore
        'presentation-overlay-fade-in': 'presentation-overlay-fade-in .3s ease forwards', // prettier-ignore
        'presentation-overlay-fade-out': 'presentation-overlay-fade-out .3s ease forwards', // prettier-ignore
      },
      keyframes: {
        'alert-show': {
          '0%': { opacity: '0.001', transform: 'scale(0.8)' },
          '100%': { opacity: '0.999', transform: 'scale(1)' },
        },
        'alert-hide': {
          '0%': { opacity: '0.999', transform: 'scale(1)' },
          '100%': { opacity: '0.001', transform: 'scale(0.8)' },
        },
        'modal-show': {
          '0%': {
            transform: 'scale(0.9) translate(var(--tw-translate-x), var(--tw-translate-y))', // prettier-ignore
            opacity: '0.001',
          },
          '100%': {
            transform: 'scale(1) translate(var(--tw-translate-x), var(--tw-translate-y))', // prettier-ignore
            opacity: '0.999',
          },
        },
        'modal-hide': {
          '0%': {
            transform: 'scale(1) translate(var(--tw-translate-x), var(--tw-translate-y))', // prettier-ignore
            opacity: '0.999',
          },
          '100%': {
            transform: 'scale(0.9) translate(var(--tw-translate-x), var(--tw-translate-y))', // prettier-ignore
            opacity: '0.001',
          },
        },

        // Presentation
        'presentation-show': {
          '100%': { transform: 'translateY(0)' },
          '0%': { transform: 'translateY(100%)' },
        },
        'presentation-hide': {
          '100%': { transform: 'translateY(100%)' },
          '0%': { transform: 'translateY(0)' },
        },
        'presentation-large-show': {
          '100%': { transform: 'translate(-50%, -50%)' },
          '0%': { transform: 'translate(-50%, 50vh)' },
        },
        'presentation-large-hide': {
          '100%': { transform: 'translate(-50%, 50vh)' },
          '0%': { transform: 'translate(-50%, -50%)' },
        },
        'presentation-overlay-fade-in': {
          '100%': { opacity: '0.199' },
          '0%': { opacity: '0.001' },
        },
        'presentation-overlay-fade-out': {
          '100%': { opacity: '0.001' },
          '0%': { opacity: '0.199' },
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.translate-z-0': { transform: 'translateZ(0px)' },
      })
    }),
  ],
}

export default config
