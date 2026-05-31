module.exports = {
  plugins: [
    ['@tailwindcss/postcss', require.resolve('./tailwind.config.ts')],
    ['autoprefixer', {}]
  ]
}
