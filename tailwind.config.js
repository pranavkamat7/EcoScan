/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F4F1EA',
        surface: '#FFFDF8',
        border: '#E2DCCD',
        ink: '#1C2B24',
        muted: '#6B7468',
        primary: {
          DEFAULT: '#1E6B4B',
          hover: '#18553B',
          light: '#EAF3EE',
        },
        accent: '#D9822B',
        before: '#B3432E',
        after: '#2F8F5B',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['Fraunces', 'Bricolage Grotesque', 'Georgia', 'serif'],
        heading: ['Fraunces', 'Bricolage Grotesque', 'serif'],
        sans: ['DM Sans', 'Instrument Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '12px',
        '3xl': '12px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(28, 43, 36, 0.05)',
        card: '0 1px 3px 0 rgba(28, 43, 36, 0.06)',
        dropdown: '0 4px 16px -2px rgba(28, 43, 36, 0.12)',
        modal: '0 12px 32px -4px rgba(28, 43, 36, 0.18)',
      },
    },
  },
  plugins: [],
}
