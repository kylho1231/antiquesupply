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
            500: '#1B5E20',
            600: '#0F5132',
            700: '#0A3B24',
            800: '#062818',
            900: '#03170E',
          },
          slate: {
            DEFAULT: '#17252A',
            800: '#17252A',
            900: '#0F181B',
            950: '#080D0E',
          },
          amber: {
            DEFAULT: '#F4B942',
            400: '#F7CA6A',
            500: '#F4B942',
            600: '#D99B22',
          },
          ivory: {
            DEFAULT: '#F8FAF7',
            light: '#FCFDFB',
            dark: '#EEF2EC',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'layer-card': '0 8px 32px 0 rgba(15, 81, 50, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'layer-glow': '0 0 24px -4px rgba(244, 185, 66, 0.35)',
      },
    },
  },
  plugins: [],
};
