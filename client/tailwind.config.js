/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FF4081',
          coral: '#FF6B8B',
          yellow: '#FFD166',
          blue: '#4EA8DE',
          teal: '#06D6A0',
          purple: '#7209B7',
          dark: '#1E293B',
          cream: '#FFF9F4',
          light: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Quicksand', 'sans-serif']
      }
    },
  },
  plugins: [],
}
