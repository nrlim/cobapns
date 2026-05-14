/** @type {import('postcss').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // Autoprefixer adds -webkit-, -moz- etc. vendor prefixes automatically.
    // Critical for Instagram IAB, Samsung Browser, UC Browser, and older WebViews.
    autoprefixer: {},
  },
};

export default config;
