/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-light": "var(--background-light)",
        "background-white": "var(--background-white)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "ifood-red": "var(--ifood-red)",
        "ifood-red-light": "var(--ifood-red-light)",
        "border-color": "var(--border-color)",
        "chart-blue": "var(--chart-blue)",
        "chart-green": "var(--chart-green)",
        "chart-orange": "var(--chart-orange)",
      },
    },
  },
  plugins: [],
}
