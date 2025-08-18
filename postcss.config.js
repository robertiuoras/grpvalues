// postcss.config.js
module.exports = {
  plugins: {
    // Correct way to include Tailwind CSS as a PostCSS plugin for newer versions
    // You must also install this package: npm install -D @tailwindcss/postcss
    "@tailwindcss/postcss": {},
    autoprefixer: {}, // This plugin adds vendor prefixes to CSS rules for browser compatibility
  },
};
