/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rausch: {
          DEFAULT: '#FF385C',
          hover: '#E00B41',
          active: '#D70466',
        },
        surface: {
          canvas: '#FFFFFF',
          subtle: '#F7F7F7',
          DEFAULT: '#FBF9F9',
          dim: '#DBDADA',
        },
        border: {
          hairline: '#EBEBEB',
          DEFAULT: '#DDDDDD',
          strong: '#222222',
        },
        content: {
          primary: '#222222',
          secondary: '#717171',
          tertiary: '#B0B0B0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'airbnb-card': '0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)',
        'airbnb-card-hover': '0 6px 20px rgba(0,0,0,0.12)',
        'airbnb-search': '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        'airbnb-search-hover': '0 2px 4px rgba(0,0,0,0.18)',
        'airbnb-modal': '0 8px 28px rgba(0,0,0,0.28)',
      },
      borderRadius: {
        'card': '1rem',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}
