/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cacique: {
          dark: "#0A090C",
          green: "#659B5E",
          orange: "#D16014",
          cream: "#F8FFE5",
          glass: "#001812"
        }
      }
    },
  },
  plugins: [],
}