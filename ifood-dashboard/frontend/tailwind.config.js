// ifood-dashboard/frontend/tailwind.config.js

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
        // iFood palette + dark dashboard accents
        'ifood-red': '#EA1D2C',
        'ifood-black': '#333333',
        'ifood-gray': {
          100: '#F7F7F7',
          200: '#E2E2E2',
          300: '#A6A6A6',
          400: '#717171',
        },
        // Accents inspired by the Streamlit design you shared
        'accent-cyan': '#4CC9F0',
        'accent-pink': '#F72585',
        'accent-green': '#2DC653',
        'accent-yellow': '#FFB703',
        'accent-red': '#E63946',
        'accent-gray': '#8D99AE',
      },
    },
  },
  plugins: [],
};
