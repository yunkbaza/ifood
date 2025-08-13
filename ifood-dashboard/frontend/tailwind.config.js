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
        // Adicione estas cores
        'ifood-red': '#EA1D2C',
        'ifood-black': '#333333',
        'ifood-gray': {
          100: '#F7F7F7', // Fundo principal
          200: '#E2E2E2', // Bordas e divisores
          300: '#A6A6A6', // Texto secundário
          400: '#717171', // Texto principal
        },
      },
    },
  },
  plugins: [],
};