/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    screens : {
      'sm': '700px',
      'md': '850px',
      'lg': '1300px',
      'xl': '1800px',
    }
  },
  plugins: [require('daisyui')],
}