/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#061a30', // KIT CMS primary dark
          800: '#0b2a4a', // KIT CMS header / cards
          700: '#123a63', // KIT CMS active link / subheader
          600: '#1a4b7d', // KIT CMS hover
          500: '#235e9c',
          400: '#3c79be',
          300: '#72a0db',
          200: '#b2ccf0',
          100: '#e1ecf9',
          50: '#f0f5fb',
        },
        bronze: {
          50: '#fdf8f4',
          100: '#f9eee4',
          200: '#f2dbc7',
          300: '#e8c1a1',
          400: '#dba175',
          500: '#cd7f32', // Signature KIT CMS bronze accent
          600: '#ba6a25',
          700: '#9d531d',
          800: '#7f431c',
          900: '#68391a',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
