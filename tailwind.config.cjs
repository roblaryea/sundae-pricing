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
          dark: '#0F172A',
          surface: '#1E293B',
          'surface-hover': '#334155',
          text: '#F8FAFC',
          muted: '#94A3B8',
          accent: '#38BDF8',
          success: '#22C55E',
          warning: '#F59E0B',
          report: {
            lite: '#10B981',
            plus: '#3B82F6',
            pro: '#6366F1'
          },
          core: {
            lite: '#8B5CF6',
            pro: '#A855F7'
          },
          enterprise: '#F59E0B',
          watchtower: '#EF4444'
        }
      },
      scale: {
        102: '1.02'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
        glow: '0 0 30px rgba(102, 126, 234, 0.5)',
      }
    },
  },
  plugins: [],
}
