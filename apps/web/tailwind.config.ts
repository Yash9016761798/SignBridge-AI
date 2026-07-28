import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#E9A8C9',
          600: '#d4849e',
          700: '#b86a83',
          800: '#9a5268',
          900: '#7d3f52',
          950: '#5c2d3b',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F6D365',
          500: '#f0c040',
          600: '#d4a520',
          700: '#b88a15',
          800: '#9a7010',
          900: '#7d5a0a',
          950: '#5c4208',
        },
        surface: {
          50: '#FAF8F6',
          100: '#F5F3F0',
          200: '#EFEFEF',
          300: '#E5E5E5',
          400: '#AAAAAA',
          500: '#767676',
          600: '#666666',
          700: '#444444',
          800: '#2A2A2A',
          900: '#1A1A1A',
          950: '#111111',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#B8E6C3',
          600: '#86d49a',
        },
        info: {
          50: '#f0f7ff',
          100: '#e0f0fe',
          500: '#A9D6F5',
          600: '#7bbde8',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#F7C873',
          600: '#e8b040',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#F87171',
          600: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        '5xl': '28px',
        btn: '18px',
        input: '18px',
        card: '24px',
        dialog: '28px',
        icon: '16px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(233, 168, 201, 0.2)',
        'glow-lg': '0 0 50px rgba(233, 168, 201, 0.3)',
        'glow-yellow': '0 0 30px rgba(246, 211, 101, 0.2)',
        soft: '0 2px 20px -4px rgba(0, 0, 0, 0.05), 0 8px 16px -4px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 8px 40px -8px rgba(0, 0, 0, 0.08)',
        card: '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 32px -8px rgba(0,0,0,0.08)',
        elevated: '0 20px 60px -15px rgba(0,0,0,0.08)',
        float: '0 12px 40px -12px rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(233, 168, 201, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(233, 168, 201, 0.3)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #E9A8C9 0%, #F6D365 100%)',
        'gradient-brand-reverse': 'linear-gradient(135deg, #F6D365 0%, #E9A8C9 100%)',
        'gradient-brand-soft':
          'linear-gradient(135deg, rgba(233,168,201,0.08) 0%, rgba(246,211,101,0.08) 100%)',
        'gradient-brand-medium':
          'linear-gradient(135deg, rgba(233,168,201,0.15) 0%, rgba(246,211,101,0.15) 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
