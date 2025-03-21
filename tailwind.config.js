/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF2EF',
          100: '#FFE5DF',
          200: '#FFC9B2',
          300: '#FFAD86',
          400: '#FF9159',
          500: '#FF7F50',
          600: '#CC6640',
          700: '#994C30',
          800: '#663320',
          900: '#331910',
        },
        pink: {
          50: '#FDEEF7',
          100: '#FBD3EF',
          200: '#F7A7DD',
          300: '#F37BCB',
          400: '#EF4FB9',
          500: '#FF69B4',
          600: '#CC528D',
          700: '#993B66',
          800: '#66243F',
          900: '#33121F',
        },
      },
    },
  },
  plugins: [],
};
