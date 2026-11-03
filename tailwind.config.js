/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0b0d17',
          900: '#111424',
          850: '#16192e',
        },
        coral: {
          DEFAULT: '#ff5a36',
          hover: '#ff7a52',
          light: '#ff8a6b',
          glow: 'rgba(255, 90, 54, 0.25)',
        },
        skeleton: {
          joint: '#ff5a36',
          bone: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
