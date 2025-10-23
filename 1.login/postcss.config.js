// postcss.config.js

export default {
  plugins: {
    // ⚠️ GANTI 'tailwindcss': {} dengan yang di bawah ini:
    "@tailwindcss/postcss": {}, // PENTING: Ini yang akan menghilangkan error
    autoprefixer: {}, // Jaga plugin PostCSS lainnya
  },
};
