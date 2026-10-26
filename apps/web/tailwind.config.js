/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        antique: {
          green: {
            DEFAULT: '#0F5132',
            50: '#E8F5E9',
            100: '#C8E6C9',
            200: '#A5D6A7',
            300: '#81C784',
            400: '#4CAF50',
            500: '#1B5E20',
            600: '#0F5132',
            700: '#0A3B24',
            800: '#062818',
            900: '#03170E',
            950: '#010B07',
          },
          slate: {
            DEFAULT: '#17252A',
            50: '#F8FAFB',
            100: '#F1F5F7',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#17252A',
            900: '#0F181B',
            950: '#080D0E',
          },
          amber: {
            DEFAULT: '#F4B942',
            50: '#FEF9EE',
            100: '#FDF1D5',
            200: '#FBE2AB',
            300: '#F8D17B',
            400: '#F7CA6A',
            500: '#F4B942',
            600: '#D99B22',
            700: '#B07914',
            800: '#8C5D0B',
            900: '#664205',
          },
          ivory: {
            DEFAULT: '#F8FAF7',
            light: '#FCFDFB',
            dark: '#EEF2EC',
            subtle: '#E7EDE4',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'layer-card': '0 8px 32px 0 rgba(15, 81, 50, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'layer-glow': '0 0 24px -4px rgba(244, 185, 66, 0.35)',
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 28px -4px rgba(15, 81, 50, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
};
