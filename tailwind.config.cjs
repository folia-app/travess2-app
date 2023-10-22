/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

const pen = colors.zinc['900']
const pencil3H = colors.zinc['300']
const pencil5H = colors.zinc['200']
const pencil6H = colors.zinc['100']

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: '568px',
        md: '768px',
        mlg: '1024px',
        lg: '1240px',
        xl: '1600px',
        mouse: { raw: '(hover:hover)' }
      },
      spacing: {
        'stroke-lt': 'calc(var(--stroke-w) * 0.8)',
        'stroke': 'var(--stroke-w)',
        'stroke2x': 'calc(var(--stroke-w) * 2)',
        'stroke3x': 'calc(var(--stroke-w) * 3)',
      },
      colors: {
        'pen': pen,
        'pencil-3h': pencil3H,
        'pencil-5h': pencil5H,
        'pencil-6h': pencil6H,
      },
      fontFamily: {
        // 'comic': '"Comic Sans MS", "Comic Sans", cursive',
        'comic': '"Comic Sans", "Comic Sans MS", "Chalkboard", "ChalkboardSE-Regular", sans-serif',
      },
      fontSize: {
        'h1': 'var(--h1)',
        'h2': 'var(--h2)',
        'h3': 'var(--h3)',
        'h3b': 'var(--h3b)',
        'h4': 'var(--h4)',
        'h5': 'var(--h5)',
        'h5b': 'var(--h5b)',
        'h6': 'var(--h6)',
      },
      borderWidth: {
        'stroke-xs': 'var(--stroke-w-xs)',
        'stroke-sm': 'var(--stroke-w-sm)',
        'stroke': 'var(--stroke-w)',
      },
      borderRadius: {
        'stroke': 'var(--stroke-w)',
        'stroke2x': 'calc(var(--stroke-w) * 2)',
        'stroke3x': 'calc(var(--stroke-w) * 3)',
      },
      borderColor: {
        DEFAULT: pen,
      },
      width: {
        'full+10': 'calc(100% + 3rem)',
      },
      gap: {
        inherit: 'inherit',
      }
    },
  },
  plugins: [],
}