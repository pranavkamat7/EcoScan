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
          charcoal: '#0F172A',
          'charcoal-light': '#1E293B',
          bg: '#F8FAFC',
          'bg-subtle': '#F1F5F9',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
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
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)',
        'card-hover': '0 12px 28px -8px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(16, 185, 129, 0.04)',
        'modal': '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        'btn-green': '0 4px 16px -2px rgba(5, 150, 105, 0.35)',
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
}
