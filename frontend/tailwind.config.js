/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#F7F8F3',
          100: '#EEF0E7',
          200: '#E5E8DC',
          300: '#D2D7C4',
          400: '#B0B89C',
          500: '#89936B', // Soft Olive
          600: '#606B3F', // Primary Olive
          700: '#4D5633',
          800: '#424B2D', // Dark Olive
          900: '#2E351F',
          950: '#1A1E11',
        },
        surface: {
          bg: '#F7F8F3',
          card: '#FFFFFF',
          border: '#E5E8DC',
          text: '#292D24',
          muted: '#777D70',
        }
      }
    },
  },
  plugins: [],
}
