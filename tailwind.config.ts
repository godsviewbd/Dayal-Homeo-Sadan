
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
        // Updated to system fonts as per Section 7.1
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
        // Removed 'body' and 'headline' as they will now default to 'sans'
        code: ['monospace', 'monospace'],
      },
      fontSize: {
        // From spec (Section 7.1)
        'display-lg': ['2rem', { lineHeight: '1.25' }],    // 32px Page Title
        'display-md': ['1.75rem', { lineHeight: '1.25' }], // 28px
        '2xl': ['1.5rem', { lineHeight: '1.3' }],      // 24px Card Title (Tailwind default xl)
        'xl': ['1.25rem', { lineHeight: '1.3' }],      // 20px Section Heading (Tailwind default lg)
        'lg': ['1.125rem', { lineHeight: '1.4' }], // 18px (Tailwind default base)
        'base': ['1rem', { lineHeight: '1.5' }],       // 16px Body Text/Labels
        'sm': ['0.875rem', { lineHeight: '1.4' }],     // 14px Captions/Help Text
        'xs': ['0.75rem', { lineHeight: '1.4' }],       // 12px Tiny Text
      },
      fontWeight: {
        normal: '400', // Tailwind default normal
        medium: '500', // Tailwind default medium
        semibold: '600', // Tailwind default semibold
        bold: '700', // Tailwind default bold
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))", // Used for input border in some ShadCN components
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary-brand))", // Main brand color for general use
          foreground: "hsl(var(--primary-brand-foreground))", // Text on primary brand
          // Direct mapping from your spec for HSL variables
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))", // Dark mode primary text/icons
          400: "hsl(var(--primary-400))", // Dark mode primary button
          500: "hsl(var(--primary-500))", // Primary brand color
          600: "hsl(var(--primary-600))", // Hover
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))", // Dark mode accent bg
        },
        secondary: { // Accent/Complementary
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          // You can add shades 50-900 if needed, matching HSL vars
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Error Red
          foreground: "hsl(var(--destructive-foreground))", // Text on error red
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: { // For interactive elements, can be same as secondary or distinct
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
        success: { // Semantic success
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: { // Semantic warning
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // Neutral gray palette from spec
        gray: {
          50: "hsl(var(--color-gray-50))", // #F9FAFB
          100: "hsl(var(--color-gray-100))",// #F3F4F6
          200: "hsl(var(--color-gray-200))",// #E5E7EB
          300: "hsl(var(--color-gray-300))",// #D1D5DB
          400: "hsl(var(--color-gray-400))",// #9CA3AF
          500: "hsl(var(--color-gray-500))",// #6B7280
          600: "hsl(var(--color-gray-600))",// #4B5563
          700: "hsl(var(--color-gray-700))",// #374151
          800: "hsl(var(--color-gray-800))",// #1F2937
          900: "hsl(var(--color-gray-900))",// #111827
        },
         teal: { // Direct teal palette from spec for convenience
          50: 'hsl(174, 60%, 95%)',
          100: 'hsl(174, 50%, 90%)',
          200: 'hsl(174, 40%, 80%)',
          300: 'hsl(174, 30%, 70%)',
          400: 'hsl(174, 28%, 60%)',
          500: 'hsl(174, 25%, 55%)',
          600: 'hsl(174, 30%, 45%)',
          700: 'hsl(174, 35%, 35%)',
          800: 'hsl(174, 40%, 25%)',
          900: 'hsl(174, 45%, 15%)',
        },
        // Semantic colors (reiterating for clarity if needed directly)
        'semantic-success': 'hsl(var(--success))',
        'semantic-warning': 'hsl(var(--warning))',
        'semantic-error': 'hsl(var(--destructive))',
        'semantic-success-fg': 'hsl(var(--success-foreground))',
        'semantic-warning-fg': 'hsl(var(--warning-foreground))',
        'semantic-error-fg': 'hsl(var(--destructive-foreground))',
      },
      borderRadius: {
        DEFAULT: "var(--radius)", // Default Shadcn: 0.5rem
        lg: "var(--radius)", // From spec, same as default
        xl: "calc(var(--radius) + 4px)",
        '2xl': "calc(var(--radius) + 8px)", // For cards
        '3xl': "calc(var(--radius) + 16px)",
        full: "9999px",
      },
      spacing: { // Adding 8-point grid values (Section 9.1)
        '1': '0.25rem', // 4px
        '1.5': '0.375rem', // 6px
        '2': '0.5rem', // 8px
        '2.5': '0.625rem', // 10px
        '3': '0.75rem', // 12px
        '3.5': '0.875rem', // 14px
        '4': '1rem', // 16px
        '5': '1.25rem', // 20px
        '6': '1.5rem', // 24px
        '7': '1.75rem', // 28px
        '8': '2rem', // 32px
        '9': '2.25rem', // 36px
        '10': '2.5rem', // 40px
        '11': '2.75rem', // 44px
        '12': '3rem',    // 48px
        '14': '3.5rem',    // 56px (mobile bottom nav height)
        '16': '4rem', // 64px (desktop header height)
        '18': '4.5rem',    // 72px
        '24': '6rem', // 96px
      },
      height: { // From spec, ensuring these are available
        '11': '2.75rem', // 44px
        '12': '3rem',    // 48px
        '14': '3.5rem',    // 56px
        '16': '4rem',    // 64px
      },
      minHeight: { // From spec
        '11': '2.75rem', // 44px
        '12': '3rem',    // 48px
      },
      boxShadow: { // From spec
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)', // Added for more depth if needed
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
        shimmer: { // From spec (Section 13.2)
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // For toasts (Section 15.4)
        "toast-slide-in-top": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "toast-fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: 'shimmer 1.5s infinite linear', // From spec (Section 13.2)
        "toast-slide-in-top": "toast-slide-in-top 0.3s ease-out forwards",
        "toast-fade-out": "toast-fade-out 0.3s ease-in forwards",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
