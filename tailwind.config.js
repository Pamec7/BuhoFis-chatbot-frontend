/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0582CA',
        'dark-blue': '#003D61',
        'navy-blue': '#084062',
        'green': '#195427',
        'light-green': '#6EC971',
        'pastel-green': '#CCFFCE',
        'light-blue': '#B3E5FC',
      }
    },
  },
  plugins: [],
}