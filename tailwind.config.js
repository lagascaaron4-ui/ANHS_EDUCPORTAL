/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./components/*.html",
    "./js/**/*.js",
    "./css/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e8',
          200: '#bbe5d1',
          300: '#8fd4b1',
          400: '#5bbf8a',
          500: '#2d8b4a',
          600: '#1a6633',
          700: '#145229',
          800: '#0f3b1e',
          900: '#0b2e17',
          950: '#05150a'
        },
        secondary: {
          50: '#fdf8f0',
          100: '#f9edd6',
          200: '#f2d9ad',
          300: '#e8bf7c',
          400: '#daa33b',
          500: '#caa33b',
          600: '#b88b2f',
          700: '#976f25',
          800: '#7d5a20',
          900: '#67491c',
          950: '#38240e'
        },
        accent: '#8b5cf6',
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Merriweather', 'serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0,0,0,0.08)',
        'medium': '0 4px 25px rgba(0,0,0,0.12)',
        'hard': '0 8px 40px rgba(0,0,0,0.16)',
        'glow': '0 0 20px rgba(26, 102, 51, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
