/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F6F1',
        pearl: '#FFFBF5',
        cream: '#FFF9F0',
        foreground: '#1B1B1B',
        'secondary': '#4A4A4A',
        'muted': '#8A8A8A',
        accent: '#8FA58A',
        'accent-dark': '#6B8B69',
        'accent-light': '#A8BBA3',
        gold: '#D99A2B',
        'gold-light': '#E8B84A',
        'gold-dark': '#C4891F',
        warm: {
          50: '#FFFBF5',
          100: '#F8F6F1',
          200: '#EDE9E0',
        },
      },
      fontFamily: {
        main: ['var(--font-main)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        'soft': '0 4px 30px rgba(27, 27, 27, 0.04)',
        'soft-md': '0 8px 40px rgba(27, 27, 27, 0.06)',
        'soft-lg': '0 20px 60px rgba(27, 27, 27, 0.08)',
        'soft-xl': '0 30px 80px rgba(27, 27, 27, 0.1)',
        'inner-soft': 'inset 0 2px 10px rgba(27, 27, 27, 0.04)',
        'glow': '0 0 60px rgba(143, 165, 138, 0.3)',
        'glow-gold': '0 0 60px rgba(217, 154, 43, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'glow': 'glow-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(1deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
