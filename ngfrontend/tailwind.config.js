/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-dark': '#3A3A3A',
        'gold': '#D8B671',
        'beige': '#FDF6F3',
        'green-dark': '#005E3A',
        'green-teal': '#00B073',
        'white': '#FFFFFF',
        'primary': '#005E3A',
        'secondary': '#00B073',
        'accent': '#D8B671',
        'bg-soft': '#FDF6F3',
      },
      fontFamily: {
        'dosis': ['Dosis', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
