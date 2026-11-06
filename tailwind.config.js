/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Core Palette mapped to Design Tokens */
        forest: {
          DEFAULT: 'var(--color-forest)',
          dark: 'var(--color-forest-dark)',
          hover: 'var(--color-forest-hover)',
          surface: 'var(--color-forest-surface)',
          border: 'var(--color-forest-border)',
        },
        lime: {
          DEFAULT: 'var(--color-lime)',
          hover: 'var(--color-lime-hover)',
          subtle: 'var(--color-lime-subtle)',
        },
        coral: {
          DEFAULT: 'var(--color-coral)',
          hover: 'var(--color-coral-hover)',
          subtle: 'var(--color-coral-subtle)',
        },
        mint: {
          DEFAULT: 'var(--color-mint)',
          hover: 'var(--color-mint-hover)',
          subtle: 'var(--color-mint-subtle)',
        },
        amber: {
          DEFAULT: 'var(--color-amber)',
          subtle: 'var(--color-amber-subtle)',
        },
        /* Canvas & Surfaces */
        bg: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
          hover: 'var(--color-surface-hover)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          subtle: 'var(--color-border-subtle)',
        },
        /* Typography */
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        faint: 'var(--color-faint)',
      },
      fontFamily: {
        heading: ['Bricolage Grotesque', 'Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Bricolage Grotesque', 'Georgia', 'serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',         /* 10px */
        DEFAULT: 'var(--radius-sm)',    /* 10px */
        md: 'var(--radius-sm)',         /* 10px */
        lg: 'var(--radius-lg)',         /* 20px */
        xl: 'var(--radius-lg)',         /* 20px */
        '2xl': 'var(--radius-lg)',      /* 20px */
        '3xl': 'var(--radius-lg)',      /* 20px */
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        subtle: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        card: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        modal: 'var(--shadow-modal)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
      },
      maxWidth: {
        shell: '1200px',
      },
    },
  },
  plugins: [],
}
