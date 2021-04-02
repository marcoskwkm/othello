module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridTemplateRows: {
        board: 'repeat(8, 1fr)',
      },
      gridTemplateColumns: {
        board: 'repeat(8, 1fr)',
      },
      padding: {
        full: '100%',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
