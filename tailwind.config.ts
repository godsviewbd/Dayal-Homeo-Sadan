
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem', // 16px for mobile (px-4)
        sm: '1.5rem',    // 24px
        md: '2rem',      // 32px for tablet (md:px-8)
        lg: '2rem',      // 32px for desktop
      },
      screens: {
        sm: '640px',  // mobile
        md: '768px',  // tablet
        lg: '1024px', // desktop
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        body: ['var(--font-sans)', 'sans-serif'], // Use CSS var for PT Sans or system
        headline: ['var(--font-sans)', 'sans-serif'], // Use CSS var for PT Sans or system
        code: ['monospace', 'monospace'],
      },
      fontSize: {
        // From spec (adjusting keys slightly for Tailwind conventions)
        'display-lg': ['2rem', { lineHeight: '1.25' }],    // 32px Page Title
        'display-md': ['1.75rem', { lineHeight: '1.25' }], // 28px
        'xl': ['1.5rem', { lineHeight: '1.3' }],      // 24px Card Title
        'lg': ['1.25rem', { lineHeight: '1.3' }],      // 20px Section Heading
        'base': ['1rem', { lineHeight: '1.5' }],       // 16px Body Text/Labels
        'sm': ['0.875rem', { lineHeight: '1.4' }],     // 14px Captions/Help Text
        'xs': ['0.75rem', { lineHeight: '1.4' }],       // 12px Tiny Text
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // For new design system primary colors
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
           // New secondary colors
          50: "hsl(var(--secondary-50))",
          100: "hsl(var(--secondary-100))",
          200: "hsl(var(--secondary-200))",
          300: "hsl(var(--secondary-300))",
          400: "hsl(var(--secondary-400))",
          500: "hsl(var(--secondary-500))",
          600: "hsl(var(--secondary-600))",
          700: "hsl(var(--secondary-700))",
          800: "hsl(var(--secondary-800))",
          900: "hsl(var(--secondary-900))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          50: "hsl(var(--destructive-50))",
          100: "hsl(var(--destructive-100))",
          // ... other shades if needed
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          50: "hsl(var(--success-50))",
          // ... other shades
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          50: "hsl(var(--warning-50))",
          // ... other shades
        },
        // Neutral gray palette from spec
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
         teal: { // New primary teal for easier direct use
          50: 'hsl(174, 60%, 95%)', // Lighter
          100: 'hsl(174, 50%, 90%)',
          200: 'hsl(174, 40%, 80%)',
          300: 'hsl(174, 30%, 70%)', // Dark mode primary text
          400: 'hsl(174, 28%, 60%)', // Dark mode primary button
          500: 'hsl(174, 25%, 55%)', // Primary brand color
          600: 'hsl(174, 30%, 45%)', // Hover
          700: 'hsl(174, 35%, 35%)',
          800: 'hsl(174, 40%, 25%)',
          900: 'hsl(174, 45%, 15%)', // Dark mode AI card bg / accent
        },
        // Semantic colors directly
        'semantic-success': 'hsl(140, 35%, 45%)',
        'semantic-warning': 'hsl(35, 75%, 55%)',
        'semantic-error': 'hsl(0, 65%, 50%)',
        'semantic-success-fg': 'hsl(0, 0%, 100%)', // white for text on semantic bg
        'semantic-warning-fg': 'hsl(0, 0%, 0%)',   // black for text on warning
        'semantic-error-fg': 'hsl(0, 0%, 100%)',   // white for text on error
      },
      borderRadius: {
        lg: "var(--radius)", // Keep shadcn default
        xl: "calc(var(--radius) + 4px)", // 0.75rem if radius is 0.5rem
        '2xl': "calc(var(--radius) + 8px)", // 1rem if radius is 0.5rem
        '3xl': "calc(var(--radius) + 16px)", // 1.5rem
        full: "9999px",
      },
      spacing: {
        '1.5': '0.375rem', // 6px
        '2.5': '0.625rem', // 10px
        '3.5': '0.875rem', // 14px
        '4.5': '1.125rem', // 18px
        '14': '3.5rem',    // 56px (bottom nav height)
        '18': '4.5rem',    // 72px
      },
      height: {
        '11': '2.75rem', // 44px
        '12': '3rem',    // 48px
        '14': '3.5rem',    // 56px
        '16': '4rem',    // 64px
      },
      minHeight: {
        '11': '2.75rem',
        '12': '3rem',
      },
      boxShadow: {
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)', // Softer md
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)', // Softer lg
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)', // Softer xl
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
