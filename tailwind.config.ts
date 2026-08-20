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
        'bg-page': '#07080B',
        'bg-card': '#101218',
        'bg-card-hover': '#161920',
        'bg-elevated': '#14161C',
        accent: '#FEC72C',
        'accent-hover': '#FFD54F',
        'accent-contrast': '#0A0A0B',
        'accent-blue': '#3b82f6',
        border: '#1E2129',
        'border-strong': '#2A2E38',
        'text-primary': '#F4F4F5',
        'text-secondary': '#8B909C',
        'text-muted': '#5C616C',
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
        'brand-gradient': 'linear-gradient(135deg, #FEC72C, #F5B301)',
        'brand-gradient-hover': 'linear-gradient(135deg, #FFD54F, #FEC72C)',
        'card-glow': 'radial-gradient(ellipse at center, rgba(254,199,44,0.06) 0%, transparent 70%)',
        'hero-shade': 'linear-gradient(90deg, rgba(5,6,9,0.97) 8%, rgba(5,6,9,0.75) 42%, rgba(5,6,9,0.05) 75%)',
      },
      boxShadow: {
        'glow-accent': '0 0 40px rgba(254, 199, 44, 0.12)',
        'glow-card': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glow-card-hover': '0 16px 48px rgba(0, 0, 0, 0.45)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.55)',
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
