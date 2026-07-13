import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-page': '#1a1d24',
        'bg-card': '#22262e',
        'bg-card-hover': '#2a2f3a',
        accent: '#ff5400',
        'accent-hover': '#ff6b1a',
        'accent-blue': '#3b82f6',
        border: '#2e333e',
        'text-primary': '#ffffff',
        'text-secondary': '#99a0ae',
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Inter',
          'Segoe UI',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ff5400, #ff7a00)',
        'brand-gradient-hover': 'linear-gradient(135deg, #e64c00, #ff5400)',
        'card-glow': 'radial-gradient(ellipse at center, rgba(255,84,0,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-accent': '0 0 40px rgba(255, 84, 0, 0.2)',
        'glow-card': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glow-card-hover': '0 16px 48px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],};

export default config;
