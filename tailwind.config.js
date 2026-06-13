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
          navy: '#061B35',
          'deep-navy': '#020B18',
          'secondary-navy': '#0B2A4A',
          gold: '#F4B400',
          'light-gold': '#FFD766',
          white: '#FFFFFF',
          'muted-text': '#AAB6C5',
          // Legacy mappings to prevent visual breakage and map neatly to Shazo brand navy palette
          800: '#061B35',
          900: '#020B18',
          950: '#0B2A4A'
        }
      }
    },
  },
  plugins: [],
}
