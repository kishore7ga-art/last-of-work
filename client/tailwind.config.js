/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        canvas: '#e5e7eb',
        sidebar: '#111827',
        'sidebar-light': '#1f2937',
        accent: '#3b82f6',
      }
    }
  },
  plugins: []
}
