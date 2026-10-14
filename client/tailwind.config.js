/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#07122A', 900: '#0B1B33', 800: '#12294A', 700: '#1B3A63', 600: '#2A4E7E' },
        ivory: { DEFAULT: '#FBF6EC', 100: '#F6EEDD', 200: '#EADFC8' },
        teal: { 300: '#6FD3CE', 400: '#37BDB7', 500: '#1AA6A0', 600: '#0F8C88', 700: '#0B6F6C' },
        sunset: { 300: '#FFB27F', 400: '#F99C62', 500: '#F28A4B', 600: '#D96F30' },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        float: '0 24px 60px -24px rgba(7,18,42,.55), 0 8px 20px -12px rgba(7,18,42,.35)',
        soft: '0 10px 30px -14px rgba(11,27,51,.25)',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        dash: { to: { strokeDashoffset: '-40' } },
        spin360: { to: { transform: 'rotate(360deg)' } },
      },
      animation: { floaty: 'floaty 7s ease-in-out infinite', dash: 'dash 3.5s linear infinite' },
    },
  },
  plugins: [],
};
