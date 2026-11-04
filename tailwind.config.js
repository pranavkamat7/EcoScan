/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#16A34A',
          'green-dark': '#15803D',
          'green-light': '#22C55E',
          charcoal: '#17171F',
          'charcoal-light': '#262633',
          bg: '#E5ECE7',
          'bg-subtle': '#EEF4EF',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(23, 23, 31, 0.08), 0 4px 10px -2px rgba(23, 23, 31, 0.04)',
        'modal': '0 25px 50px -12px rgba(23, 23, 31, 0.25)',
        'btn-green': '0 4px 14px -1px rgba(22, 163, 74, 0.35)',
      },
    },
  },
  plugins: [],
}
