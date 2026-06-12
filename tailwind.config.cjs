/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sundae: {
          dark: '#15110D',
          surface: '#1F1A15',
          'surface-hover': '#2A231C',
          text: '#F8FAFC',
          muted: '#94A3B8',
          accent: '#FF5C4D',
          success: '#22C55E',
          warning: '#F59E0B',
          report: {
            lite: '#10B981',
            plus: '#FF7E6F',
            pro: '#FF5C4D'
          },
          core: {
            lite: '#E9A24A',
            pro: '#C2410C'
          },
          enterprise: '#F59E0B',
          watchtower: '#EF4444'
        }
      },
      scale: {
        102: '1.02'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF5C4D 0%, #E9A24A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        fadeOut: 'fadeOut 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        fadeOut: {
          to: {
            opacity: '0',
            transform: 'translateX(20px)'
          }
        }
      },
      boxShadow: {
        glow: '0 0 30px rgba(255, 92, 77, 0.5)',
      }
    },
  },
  plugins: [],
}
