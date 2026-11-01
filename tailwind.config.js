/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F9F9F6',
          subtle: '#F2F2EC',
          card: '#FFFFFF',
          border: '#E3E3DC',
          darkBorder: '#CECED6',
        },
        civic: {
          900: '#14231A',
          800: '#233F2E',
          700: '#2D513B',
          600: '#3D6C50',
          500: '#4D8262',
          100: '#E7EFEA',
          50: '#F2F7F4',
        },
        rust: {
          800: '#842D18',
          700: '#A4391F',
          600: '#C24A2C',
          100: '#FDEEEA',
          50: '#FDF7F5',
        },
        charcoal: {
          900: '#181A19',
          800: '#2C302D',
          600: '#535A55',
          400: '#7E8681',
          200: '#CACECB',
          100: '#E4E7E5',
        }
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
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
        'modal': '0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}

