/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'main-font': ['MainFont', 'sans-serif'],
        'secondary-font': ['SecondaryFont', 'sans-serif'],
        'third-font': ['ThirdFont', 'sans-serif']
      },
      colors: {
        'black-grey': '#2B2B2B',
        'red-valorant': '#EB565B',
      }
    },
  },
  plugins: [],
}
