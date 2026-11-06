/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Official GarbageMedia Brand Colors */
        navy: {
          DEFAULT: 'var(--navy)',
          2: 'var(--navy-2)',
          50: 'var(--navy-50)',
          100: 'var(--navy-100)',
          200: 'var(--navy-200)',
          300: 'var(--navy-300)',
          400: 'var(--navy-400)',
          500: 'var(--navy-500)',
          600: 'var(--navy-600)',
          700: 'var(--navy-700)',
          800: 'var(--navy-800)',
          900: 'var(--navy-900)',
          950: 'var(--navy-950)',
        },
        emerald: {
          DEFAULT: 'var(--emerald)',
          50: 'var(--emerald-50)',
          100: 'var(--emerald-100)',
          200: 'var(--emerald-200)',
          300: 'var(--emerald-300)',
          400: 'var(--emerald-400)',
          500: 'var(--emerald-500)',
          600: 'var(--emerald-600)',
          700: 'var(--emerald-700)',
          800: 'var(--emerald-800)',
          900: 'var(--emerald-900)',
        },
        lime: {
          DEFAULT: 'var(--lime)',
          50: 'var(--lime-50)',
          100: 'var(--lime-100)',
          200: 'var(--lime-200)',
          300: 'var(--lime-300)',
          400: 'var(--lime-400)',
          500: 'var(--lime-500)',
          600: 'var(--lime-600)',
          700: 'var(--lime-700)',
          800: 'var(--lime-800)',
          900: 'var(--lime-900)',
        },
        sky: {
          DEFAULT: 'var(--sky)',
          50: 'var(--sky-50)',
          100: 'var(--sky-100)',
          200: 'var(--sky-200)',
          300: 'var(--sky-300)',
          400: 'var(--sky-400)',
          500: 'var(--sky-500)',
          600: 'var(--sky-600)',
          700: 'var(--sky-700)',
          800: 'var(--sky-800)',
          900: 'var(--sky-900)',
        },
        coral: {
          DEFAULT: 'var(--coral)',
          50: 'var(--coral-50)',
          100: 'var(--coral-100)',
          200: 'var(--coral-200)',
          300: 'var(--coral-300)',
          400: 'var(--coral-400)',
          500: 'var(--coral-500)',
          600: 'var(--coral-600)',
          700: 'var(--coral-700)',
          800: 'var(--coral-800)',
          900: 'var(--coral-900)',
        },
        /* Supporting Neutrals */
        bg: 'var(--bg)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        white: 'var(--white)',
        surface: 'var(--white)',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',      /* 12px for inputs & buttons */
        DEFAULT: 'var(--radius-sm)', /* 12px */
        md: 'var(--radius-md)',      /* 12px */
        lg: 'var(--radius-lg)',      /* 20px for cards & containers */
        xl: 'var(--radius-lg)',      /* 20px */
        '2xl': 'var(--radius-lg)',   /* 20px */
        full: 'var(--radius-full)',  /* Full for avatars & pills */
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        modal: 'var(--shadow-modal)',
      },
      maxWidth: {
        shell: '1200px',
      },
      zIndex: {
        sticky: '50',
        dropdown: '60',
        modal: '70',
        toast: '80',
      },
    },
  },
  plugins: [],
}
