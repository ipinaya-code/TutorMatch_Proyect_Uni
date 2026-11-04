/** @type {import('tailwindcss').Config} */
export default {
  content: ['./html/**/*.html', './js/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0C1A2B',
        ink2: '#13253B',
        bone: '#EAF0EE',
        cian: '#3DD6C6',
        ambar: '#FFB020',
        viol: '#8B7CF6',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
