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
          green: '#059669',
          'green-dark': '#047857',
          'green-light': '#10B981',
          'green-glow': '#34D399',
          teal: '#0D9488',
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
        'btn-green': '0 4px 16px -2px rgba(5, 150, 105, 0.35)',
      },
    },
  },
  plugins: [],
}
