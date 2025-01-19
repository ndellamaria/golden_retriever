/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',
      },
      fontFamily: {
        'istok': ['"Istok Web"', 'sans-serif'], // Added extra quotes around Istok Web
      }
    },
  },
  plugins: [],
}