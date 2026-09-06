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
        // Семантические уровни поверхностей — для нового mobile-слоя.
        // Существующие bg-* оставлены как есть, чтобы не трогать desktop.
        'surface-0': '#07080B', // фон страницы
        'surface-1': '#101218', // карточки
        'surface-2': '#161920', // поля ввода, приподнятые блоки
        'surface-3': '#1C1F27', // поповеры, шторки, нижняя навигация
        accent: '#FEC72C',
        'accent-hover': '#FFD54F',
        'accent-contrast': '#0A0A0B',
        'accent-blue': '#3b82f6',
        border: '#1E2129',
        'border-strong': '#2A2E38',
        'text-primary': '#F4F4F5',
        // Контраст поднят: старые значения давали 2.8–4.6:1 на фоне страницы
        // (text-muted не проходил WCAG AA). Затрагивает и desktop — намеренно.
        'text-secondary': '#9AA1AD',
        'text-muted': '#787F8B',
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
      fontSize: {
        // Единственный легитимный микро-размер: флаговые подписи, юр. строки.
        // Заводится, чтобы постепенно убрать произвольные text-[10px]/[11px].
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        control: '0.75rem', // кнопки, поля, чипы
        card: '1rem', // карточки, панели
        pill: '9999px', // бейджи, переключатели
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
        // Шкала подъёма для нового слоя: 1 — залипшие панели, 2 — поповеры,
        // 3 — модальные шторки.
        'elevation-1': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'elevation-2': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'elevation-3': '0 16px 48px rgba(0, 0, 0, 0.55)',
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
