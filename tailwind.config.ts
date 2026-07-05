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
        'bg-page': '#0a0b0e',
        'bg-card': '#14161d',
        'bg-card-hover': '#1a1d27',
        accent: '#00d4aa',
        'accent-blue': '#0088ff',
        border: '#222636',
        'text-primary': '#eef0f5',
        'text-secondary': '#8a95a8',
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
        'brand-gradient': 'linear-gradient(135deg, #00d4aa, #0088ff)',
        'brand-gradient-hover': 'linear-gradient(135deg, #00b894, #0070d4)',
        'card-glow': 'radial-gradient(ellipse at center, rgba(0,212,170,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-accent': '0 0 40px rgba(0, 212, 170, 0.15)',
        'glow-card': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glow-card-hover': '0 16px 48px rgba(0, 212, 170, 0.12)',
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
  plugins: [],
};

export default config;
