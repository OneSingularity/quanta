/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          50: '#1a1a1a',
          100: '#0f0f0f',
          200: '#0a0a0a',
          300: '#050505',
          400: '#030303',
          500: '#000000',
        },
        cosmic: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        nebula: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        quantum: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        primary: {
          50: '#f0f4ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      fontFamily: {
        'space': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'orbit': 'orbit 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(20px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(20px) rotate(-360deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #6366f1, 0 0 10px #6366f1, 0 0 15px #6366f1' },
          '100%': { boxShadow: '0 0 10px #6366f1, 0 0 20px #6366f1, 0 0 30px #6366f1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'cosmic': '0 0 20px rgba(99, 102, 241, 0.3)',
        'nebula': '0 0 20px rgba(59, 130, 246, 0.3)',
        'quantum': '0 0 20px rgba(217, 70, 239, 0.3)',
        'void': '0 0 20px rgba(0, 0, 0, 0.8)',
        'orbital': '0 0 30px rgba(99, 102, 241, 0.5), inset 0 0 30px rgba(99, 102, 241, 0.1)',
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
        'cosmic-gradient': 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #d946ef 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)',
      },
      borderRadius: {
        'none': '0',
        'sharp': '2px',
      },
    },
  },
  plugins: [],
};
