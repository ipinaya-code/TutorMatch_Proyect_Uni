/** @type {import('tailwindcss').Config} */
export default {
  content: ['./html/**/*.html', './js/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        emi: '#004A9B',   // azul EMI (del logo)
        oro: '#F8D800',   // amarillo EMI (del logo)
        ink: '#021C3A',   // fondo: azul EMI muy oscuro
        ink2: '#062950',  // paneles
        bone: '#F3F6FB',  // texto claro
        azul: '#579DFF',  // azul EMI claro (acentos sobre fondo oscuro)
        cielo: '#A9C7FF', // azul pálido
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
