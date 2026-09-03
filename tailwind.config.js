/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#070c18',
          dark: '#0f172a',          // Slate 900: Institutional Medical Navy
          navy: '#0d1933',          // Academic Hospital Navy
          gray: '#1e293b',          // Slate 800: Refined Card Surface
          'gray-light': '#334155',  // Slate 700: Hover and secondary items
          muted: '#94a3b8',         // Slate 400: Clear and readable typography
          border: '#334155',        // Slate 700: Clean institutional borders
          white: '#f8fafc',         // Slate 50: Medical Crisp White
          accent: '#f59e0b',        // Radiology Amber/Gold
          'accent-dark': '#d97706', // Deep Gold
          'accent-light': '#fde68a',// Soft Gold
          primary: '#0284c7',       // Clinical Sky Blue
          success: '#10b981',       // Clinical Emerald
          error: '#ef4444',         // Clinical Crimson
          warning: '#f59e0b',       // Medical Warning
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
