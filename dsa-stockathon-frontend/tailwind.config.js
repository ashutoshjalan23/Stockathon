/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bloomberg Terminal Color Palette
        bloomberg: {
          black: '#000000',
          navy: '#0A0E27',
          'dark-blue': '#1A1F3A',
          panel: '#0D1B2A',
          orange: '#FF6B00',
          'orange-hover': '#FF8C00',
          'orange-light': '#FFA04D',
        },
        terminal: {
          green: '#00FF00',
          'green-soft': '#39FF14',
          red: '#FF0000',
          'red-soft': '#FF1744',
        },
        accent: {
          blue: '#00A6FF',
          cyan: '#00FFFF',
          yellow: '#FFD700',
          amber: '#FFC107',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          muted: '#8E8E93',
          disabled: '#5A5A5A',
        },
        border: {
          dark: '#2A2A2A',
          light: '#333333',
          lighter: '#404040',
        }
      },
      fontFamily: {
        mono: ['Courier New', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Arial', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'data-xs': '10px',
        'data-sm': '12px',
        'data-base': '14px',
        'data-lg': '20px',
        'data-xl': '28px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      animation: {
        'blink-green': 'blink-green 0.5s',
        'blink-red': 'blink-red 0.5s',
        'pulse-orange': 'pulse-orange 2s infinite',
      },
      keyframes: {
        'blink-green': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(0, 255, 0, 0.2)' },
        },
        'blink-red': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(255, 0, 0, 0.2)' },
        },
        'pulse-orange': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
