
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
        DEFAULT: '1rem', 
        sm: '1.5rem',    
        md: '2rem',      
        lg: '2rem',      
      },
      screens: {
        sm: '640px',  
        md: '768px',  
        lg: '1024px', 
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
        code: ['monospace', 'monospace'],
      },
      fontSize: {
        'display-lg': ['2rem', { lineHeight: '1.25' }],    
        'display-md': ['1.75rem', { lineHeight: '1.25' }], 
        '2xl': ['1.5rem', { lineHeight: '1.3' }],      
        'xl': ['1.25rem', { lineHeight: '1.3' }],      
        'lg': ['1.125rem', { lineHeight: '1.4' }], 
        'base': ['1rem', { lineHeight: '1.5' }],       
        'sm': ['0.875rem', { lineHeight: '1.4' }],     
        'xs': ['0.75rem', { lineHeight: '1.4' }],       
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
          DEFAULT: "hsl(var(--primary-brand))", 
          foreground: "hsl(var(--primary-brand-foreground))", 
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
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", 
          foreground: "hsl(var(--destructive-foreground))", 
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
        },
        warning: { 
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        gray: {
          50: "hsl(var(--color-gray-50))", 
          100: "hsl(var(--color-gray-100))",
          200: "hsl(var(--color-gray-200))",
          300: "hsl(var(--color-gray-300))",
          400: "hsl(var(--color-gray-400))",
          500: "hsl(var(--color-gray-500))",
          600: "hsl(var(--color-gray-600))",
          700: "hsl(var(--color-gray-700))",
          800: "hsl(var(--color-gray-800))",
          900: "hsl(var(--color-gray-900))",
        },
         teal: { 
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
        'semantic-success': 'hsl(var(--success))',
        'semantic-warning': 'hsl(var(--warning))',
        'semantic-error': 'hsl(var(--destructive))',
        'semantic-success-fg': 'hsl(var(--success-foreground))',
        'semantic-warning-fg': 'hsl(var(--warning-foreground))',
        'semantic-error-fg': 'hsl(var(--destructive-foreground))',

        /* Splash Screen Specific HSL-based colors */
        'splash-bg-light-start': 'hsl(var(--splash-bg-light-start))',
        'splash-bg-light-end': 'hsl(var(--splash-bg-light-end))',
        'splash-glow-light': 'hsl(var(--splash-glow-light))',
        'splash-tendril-light': 'hsl(var(--splash-tendril-light))',
        'splash-logo-text-light': 'hsl(var(--splash-logo-text-light))',

        'splash-bg-dark-start': 'hsl(var(--splash-bg-dark-start))',
        'splash-bg-dark-end': 'hsl(var(--splash-bg-dark-end))',
        'splash-glow-dark': 'hsl(var(--splash-glow-dark))',
        'splash-tendril-dark': 'hsl(var(--splash-tendril-dark))',
        'splash-logo-text-dark': 'hsl(var(--splash-logo-text-dark))',
      },
      borderRadius: {
        DEFAULT: "var(--radius)", 
        lg: "var(--radius)", 
        xl: "calc(var(--radius) + 4px)",
        '2xl': "calc(var(--radius) + 8px)", 
        '3xl': "calc(var(--radius) + 16px)",
        full: "9999px",
      },
      spacing: { 
        '1': '0.25rem', 
        '1.5': '0.375rem', 
        '2': '0.5rem', 
        '2.5': '0.625rem', 
        '3': '0.75rem', 
        '3.5': '0.875rem', 
        '4': '1rem', 
        '5': '1.25rem', 
        '6': '1.5rem', 
        '7': '1.75rem', 
        '8': '2rem', 
        '9': '2.25rem', 
        '10': '2.5rem', 
        '11': '2.75rem', 
        '12': '3rem',    
        '14': '3.5rem',    
        '16': '4rem', 
        '18': '4.5rem',    
        '24': '6rem', 
      },
      height: { 
        '11': '2.75rem', 
        '12': '3rem',    
        '14': '3.5rem',    
        '16': '4rem',    
      },
      minHeight: { 
        '11': '2.75rem', 
        '12': '3rem',    
      },
      boxShadow: { 
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)', 
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
        "toast-slide-in-top": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "toast-fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "fadeInUpDelayed": { 
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "leafFloatIn": {
          '0%': { opacity: '0', transform: 'translateY(15px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        "textEmerge": {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "frostedReveal": { 
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        "indeterminateProgress": {
          '0%': { transform: 'translateX(-100%) scaleX(0.3)' },
          '50%': { transform: 'translateX(0%) scaleX(0.15)' },
          '100%': { transform: 'translateX(100%) scaleX(0.3)' },
        },
        "fadeInSlow": { 
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        "subtlePulse": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        "logoBlossom": {
          '0%': { opacity: '0', transform: 'scale(0.7) rotate(-5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        /* Keyframes for drawPath and pulseGlow will be in globals.css for direct CSS control */
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: 'shimmer 1.5s infinite linear',
        "toast-slide-in-top": "toast-slide-in-top 0.3s ease-out forwards",
        "toast-fade-out": "toast-fade-out 0.3s ease-in forwards",
        "fadeInUpDelayed": "fadeInUpDelayed 0.6s cubic-bezier(0,0,0.2,1) 0.2s forwards",
        "leafFloatIn": 'leafFloatIn 0.7s cubic-bezier(0.2, 1, 0.3, 1) forwards',
        "textEmerge": 'textEmerge 0.5s cubic-bezier(0.2, 1, 0.3, 1) forwards',
        "frostedReveal": 'frostedReveal 0.5s ease-out forwards',
        "indeterminateProgress": 'indeterminateProgress 1.8s ease-in-out infinite',
        "fadeInSlow": 'fadeInSlow 0.5s ease-out forwards',
        "subtlePulse": 'subtlePulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        "logoBlossom": 'logoBlossom 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        /* New animation utilities referring to CSS animations */
        "draw-path": 'drawPath 1.5s ease-out forwards', /* name must match keyframes in globals.css */
        "pulse-glow": 'pulseGlow 2s infinite ease-in-out', /* name must match keyframes in globals.css */
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

    