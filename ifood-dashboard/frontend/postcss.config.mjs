// Use Tailwind v3 plugins (tailwindcss + autoprefixer)
// Mixing the Tailwind v4 plugin ('@tailwindcss/postcss') with a v3 config
// prevents styles from being generated. This aligns the setup with
// tailwind.config.js currently in the repo.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
