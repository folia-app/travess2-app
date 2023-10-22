/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'mouse': { raw: '(hover:hover)' } // targets only browser with mouse hover
      },
      aspectRatio: {
        'card': '4 / 3',
      },
      animation: {
        'flash': 'flash 250ms infinite linear',
        'flash-slow': 'flash 500ms infinite linear',
        'blink': 'blink 250ms infinite linear',
      },
      keyframes: {
        'flash': {
          '0%, 50%': { background: 'black', color: 'white' },
          '51%, 100%': { background: 'white', color: 'black' }
        },
        'blink': {
          '0%, 50%': { opacity:0 },
          '51%, 100%': { opacity:1 },
        }
      }
    },
  },
  plugins: [],
}