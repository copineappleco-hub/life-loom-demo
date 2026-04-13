/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 30px rgba(125, 211, 252, 0.25)',
      },
      keyframes: {
        bubbleRise: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0.2' },
          '100%': { transform: 'translateY(-110vh) scale(1.15)', opacity: '0' },
        },
      },
      animation: {
        bubbleRise: 'bubbleRise 10s linear infinite',
      },
    },
  },
  plugins: [],
}
