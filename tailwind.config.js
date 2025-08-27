/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        category: {
          todo: '#93c5fd',
          inprogress: '#facc15',
          review: '#f472b6',
          completed: '#34d399',
        },
      },
    },
  },
  plugins: [],
};
