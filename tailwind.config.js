/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './src/**/*.tsx',
    './src/**/*.ts',
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/islands/**/*.tsx',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
